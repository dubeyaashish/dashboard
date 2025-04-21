// routes/customerRoutes.js
import express from 'express';
import Customer from '../models/Customer.js';
import Job from '../models/Job.js';
import JobLocation from '../models/JobLocation.js';
import CustomerReview from '../models/CustomerReview.js';

const router = express.Router();

// Get customer list
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const customers = await Customer.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Customer.countDocuments(query);
    
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

// Get customer job history
router.get('/:id/jobs', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Find all job locations for this customer
    const locationPipeline = [
      { $match: { customerID: id } },
      { $project: { _id: 1 } }
    ];
    
    const locations = await JobLocation.aggregate(locationPipeline);
    const locationIds = locations.map(loc => loc._id);
    
    // Find all jobs for these locations
    const jobPipeline = [
      { $match: { jobLocationID: { $in: locationIds } } },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location',
          pipeline: [{ $project: { name: 1, province: 1, district: 1 } }]
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technicians',
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }]
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
    
    // Count total jobs
    const countPipeline = [
      { $match: { jobLocationID: { $in: locationIds } } },
      { $count: 'total' }
    ];
    
    const [jobs, countResult] = await Promise.all([
      Job.aggregate(jobPipeline),
      Job.aggregate(countPipeline)
    ]);
    
    const total = countResult[0]?.total || 0;
    
    // Process technician names
    const processedJobs = jobs.map(job => {
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
    const { jobId } = req.params;
    
    const pipeline = [
      { $match: { _id: jobId } },
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