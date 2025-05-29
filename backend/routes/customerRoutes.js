// Completely rewritten routes/customerRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Job from '../models/Job.js';
import JobLocation from '../models/JobLocation.js';
import CustomerReview from '../models/CustomerReview.js';

const router = express.Router();

// Get customer list with location names
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    // Build search query for aggregation
    const searchMatch = {};
    if (search) {
      searchMatch.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Use aggregation to join Customer with JobLocation to get real name
    const aggregate = [
      { $match: searchMatch },
      {
        $lookup: {
          from: 'JobLocation',
          localField: '_id',
          foreignField: 'customerID',
          as: 'locations'
        }
      },
      {
        $addFields: {
          // Use the name from the first location if available
          locationName: {
            $cond: {
              if: { $gt: [{ $size: '$locations' }, 0] },
              then: { $arrayElemAt: ['$locations.name', 0] },
              else: '$name'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          code: 1,
          name: 1,
          phone: 1,
          email: 1,
          status: 1,
          customerType: 1,
          locationName: 1
        }
      },
      { $sort: { name: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ];
    
    // Count pipeline for pagination
    const countPipeline = [
      { $match: searchMatch },
      { $count: 'total' }
    ];
    
    // Execute both pipelines in parallel
    const [customers, countResult] = await Promise.all([
      Customer.aggregate(aggregate),
      Customer.aggregate(countPipeline)
    ]);
    
    const total = countResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// COMPLETELY REWRITTEN: Get customer job history 
router.get('/:id/jobs', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Convert string ID to ObjectId
    let customerObjectId;
    try {
      customerObjectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      console.error('Invalid customer ID format:', id);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid customer ID format',
        data: { jobs: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } }
      });
    }
    
    console.log('Getting jobs for customer ID:', customerObjectId);
    
    // COMPLETELY NEW APPROACH: Single aggregation pipeline to go directly from Customer to Jobs
    const jobPipeline = [
      // Start with the customer
      { $match: { _id: customerObjectId } },
      
      // Look up locations for this customer
      {
        $lookup: {
          from: 'JobLocation',
          localField: '_id',
          foreignField: 'customerID',
          as: 'locations'
        }
      },
      
      // Unwind the locations array to get one document per location
      { $unwind: '$locations' },
      
      // Look up jobs for each location
      {
        $lookup: {
          from: 'Job',
          localField: 'locations._id',
          foreignField: 'jobLocationID',
          as: 'jobs'
        }
      },
      
      // Unwind the jobs array to get one document per job
      { $unwind: '$jobs' },
      
      // Group all jobs together to remove duplicates and prepare for pagination
      {
        $group: {
          _id: '$jobs._id',
          no: { $first: '$jobs.no' },
          status: { $first: '$jobs.status' },
          type: { $first: '$jobs.type' },
          priority: { $first: '$jobs.priority' },
          createdAt: { $first: '$jobs.createdAt' },
          updatedAt: { $first: '$jobs.updatedAt' },
          appointmentTime: { $first: '$jobs.appointmentTime' },
          jobLocationID: { $first: '$jobs.jobLocationID' },
          technicianProfileIDs: { $first: '$jobs.technicianProfileIDs' }
        }
      },
      
      // Look up location info
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location'
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      
      // Look up technician info
      {
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technicians'
        }
      },
      
      // Look up review info
      {
        $lookup: {
          from: 'CustomerReview',
          localField: '_id',
          foreignField: 'jobID',
          as: 'review'
        }
      },
      { $unwind: { path: '$review', preserveNullAndEmptyArrays: true } },
      
      // Sort by creation date
      { $sort: { createdAt: -1 } },
      
      // Skip and limit for pagination
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      
      // Project only the fields we need
      {
        $project: {
          _id: 1,
          jobNo: '$no',
          status: 1,
          type: 1,
          priority: 1,
          createdAt: 1,
          updatedAt: 1,
          appointmentTime: 1,
          closeTime: {
            $cond: {
              if: { $in: ['$status', ['COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW']] },
              then: '$updatedAt',
              else: null
            }
          },
          locationName: '$location.name',
          locationProvince: '$location.province',
          locationDistrict: '$location.district',
          technicians: 1,
          reviewScore: '$review.overall'
        }
      }
    ];
    
    // A separate count pipeline
    const countPipeline = [
      // Start with the customer
      { $match: { _id: customerObjectId } },
      
      // Look up locations for this customer
      {
        $lookup: {
          from: 'JobLocation',
          localField: '_id',
          foreignField: 'customerID',
          as: 'locations'
        }
      },
      
      // Unwind the locations array
      { $unwind: '$locations' },
      
      // Look up jobs for each location
      {
        $lookup: {
          from: 'Job',
          localField: 'locations._id',
          foreignField: 'jobLocationID',
          as: 'jobs'
        }
      },
      
      // Unwind the jobs array
      { $unwind: '$jobs' },
      
      // Group by job ID to count unique jobs
      {
        $group: {
          _id: '$jobs._id'
        }
      },
      
      // Count the total
      { $count: 'total' }
    ];
    
    // Execute both pipelines in parallel
    const [jobsResult, countResult] = await Promise.all([
      Customer.aggregate(jobPipeline),
      Customer.aggregate(countPipeline)
    ]);
    
    console.log(`Found ${jobsResult.length} jobs for customer ${id}`);
    
    // Process technician names
    const processedJobs = jobsResult.map(job => {
      const technicians = job.technicians || [];
      const technicianNames = technicians.map(tech => 
        `${tech.firstName || ''} ${tech.lastName || ''}`.trim()
      ).filter(name => name.length > 0);
      
      return {
        ...job,
        technicians: undefined, // Remove the raw data
        technicianNames: technicianNames.join(', ') || 'N/A'
      };
    });
    
    const total = countResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        jobs: processedJobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get job timeline and details
router.get('/:customerId/jobs/:jobId', async (req, res) => {
  try {
    const { customerId, jobId } = req.params;
    
    // Convert string ID to ObjectId
    let jobObjectId;
    try {
      jobObjectId = new mongoose.Types.ObjectId(jobId);
    } catch (error) {
      console.error('Invalid job ID format:', jobId);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid job ID format'
      });
    }
    
    const pipeline = [
      { $match: { _id: jobObjectId } },
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location',
          pipeline: [{ $project: { name: 1, province: 1, district: 1, address: 1, contactFirstName: 1, contactLastName: 1, contactPhone: 1 } }]
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'Customer',
          localField: 'location.customerID',
          foreignField: '_id',
          as: 'customer',
          pipeline: [{ $project: { name: 1, phone: 1, email: 1 } }]
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technicians'
        }
      },
      {
        $lookup: {
          from: 'CustomerReview',
          localField: '_id',
          foreignField: 'jobID',
          as: 'review'
        }
      },
      { $unwind: { path: '$review', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'JobStatusHistory',
          localField: '_id',
          foreignField: 'jobID',
          as: 'statusHistory'
        }
      }
    ];
    
    console.log('Finding job details for:', jobObjectId);
    const job = await Job.aggregate(pipeline);
    
    if (!job || job.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Process technician names
    const jobData = job[0];
    const technicians = jobData.technicians || [];
    const technicianNames = technicians.map(tech => {
      return {
        id: tech._id,
        name: `${tech.firstName || ''} ${tech.lastName || ''}`.trim(),
        position: tech.position,
        phone: tech.phone
      };
    });
    
    // Format the status timeline
    const statusTimeline = (jobData.statusHistory || []).map(status => {
      return {
        status: status.status,
        timestamp: status.createdAt,
        by: status.createdByName || 'System'
      };
    }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Include created and updated events in the timeline
    statusTimeline.unshift({
      status: 'CREATED',
      timestamp: jobData.createdAt,
      by: jobData.createdByName || 'System'
    });
    
    // Add final status if it's completed
    if (['COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'].includes(jobData.status)) {
      statusTimeline.push({
        status: jobData.status,
        timestamp: jobData.updatedAt,
        by: 'System'
      });
    }
    
    res.json({
      success: true,
      data: {
        jobDetails: {
          id: jobData._id,
          jobNo: jobData.no,
          status: jobData.status,
          type: jobData.type,
          priority: jobData.priority,
          createdAt: jobData.createdAt,
          updatedAt: jobData.updatedAt,
          appointmentTime: jobData.appointmentTime,
          customer: jobData.customer,
          location: {
            name: jobData.location?.name,
            province: jobData.location?.province,
            district: jobData.location?.district,
            address: jobData.location?.address,
            contactName: `${jobData.location?.contactFirstName || ''} ${jobData.location?.contactLastName || ''}`.trim(),
            contactPhone: jobData.location?.contactPhone
          },
          technicians: technicianNames,
          review: jobData.review ? {
            time: jobData.review.time,
            manner: jobData.review.manner,
            knowledge: jobData.review.knowledge,
            overall: jobData.review.overall,
            recommend: jobData.review.recommend,
            comment: jobData.review.comment
          } : null
        },
        timeline: statusTimeline
      }
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;