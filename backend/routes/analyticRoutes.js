// routes/analyticRoutes.js
import express from 'express';
import Job from '../models/Job.js';
import CustomerReview from '../models/CustomerReview.js';
import mongoose from 'mongoose';
import TechnicianProfile from '../models/TechnicianProfile.js';
import PrecomputedMetrics from '../models/PrecomputedMetrics.js';

const router = express.Router();

// Get technician performance data
router.get('/technician-performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technician'
        }
      },
      { $unwind: { path: '$technician', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$technician._id',
          technicianName: { $first: { $concat: ['$technician.firstName', ' ', '$technician.lastName'] } },
          avgTime: { $avg: '$time' },
          avgManner: { $avg: '$manner' },
          avgKnowledge: { $avg: '$knowledge' },
          avgOverall: { $avg: '$overall' },
          avgRecommend: { $avg: '$recommend' },
          reviewCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 1,
          technicianName: 1,
          metrics: {
            time: { $round: ['$avgTime', 1] },
            manner: { $round: ['$avgManner', 1] },
            knowledge: { $round: ['$avgKnowledge', 1] },
            overall: { $round: ['$avgOverall', 1] },
            recommend: { $round: ['$avgRecommend', 1] }
          },
          reviewCount: 1
        }
      },
      { $sort: { 'metrics.overall': -1 } }
    ];
    
    const techPerformance = await CustomerReview.aggregate(pipeline);
    
    // Get recent reviews for each technician
    const reviewsPipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technician'
        }
      },
      { $unwind: { path: '$technician', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'Job',
          localField: 'jobID',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          jobNo: '$job.no',
          technicianName: { $concat: ['$technician.firstName', ' ', '$technician.lastName'] },
          time: 1,
          manner: 1,
          knowledge: 1,
          overall: 1,
          recommend: 1,
          comment: 1,
          createdAt: 1
        }
      }
    ];
    
    const recentReviews = await CustomerReview.aggregate(reviewsPipeline);
    
    res.json({
      success: true,
      data: {
        performanceSummary: techPerformance,
        recentReviews
      }
    });
  } catch (error) {
    console.error('Error fetching technician performance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get geographic distribution stats
router.get('/geographic', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location'
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$location.province',
          count: { $sum: 1 },
          locations: {
            $push: {
              jobId: '$_id',
              jobNo: '$no',
              status: '$status',
              coordinates: '$location.location.coordinates'
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ];
    
    const provinceData = await Job.aggregate(pipeline);
    
    // Get district level data
    const districtPipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location'
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            province: '$location.province',
            district: '$location.district'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $group: {
          _id: '$_id.province',
          districts: {
            $push: {
              name: '$_id.district',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { totalCount: -1 } }
    ];
    
    const districtData = await Job.aggregate(districtPipeline);
    
    // Status breakdown by province
    const statusPipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'Joblocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location'
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            province: '$location.province',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.province',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { total: -1 } }
    ];
    
    const statusByProvince = await Job.aggregate(statusPipeline);
    
    res.json({
      success: true,
      data: {
        provinceData: provinceData.map(p => ({
          province: p._id,
          count: p.count,
          // Only include summarized location data to reduce payload size
          locationSample: p.locations
            .filter(l => l.coordinates && l.coordinates.length === 2)
            .slice(0, 5)
            .map(l => ({
              jobNo: l.jobNo,
              status: l.status,
              coordinates: l.coordinates
            }))
        })),
        districtBreakdown: districtData,
        statusByProvince
      }
    });
  } catch (error) {
    console.error('Error fetching geographic analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// File: backend/routes/analyticRoutes.js - QUICK FIX - Go back to aggregation but simplified

// File: backend/routes/analyticRoutes.js - Fix the technician-jobs route to include customer data

router.get('/technician-jobs', async (req, res) => {
  try {
    const { startDate, endDate, technicianId, status, type, priority, page = 1, limit = 10 } = req.query;
    
    // Convert dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    if (status && status !== 'All') matchCriteria.status = status;
    if (type && type !== 'All') matchCriteria.type = type;
    if (priority && priority !== 'All') matchCriteria.priority = priority;
    
    if (technicianId && technicianId !== 'All') {
      matchCriteria.technicianProfileIDs = new mongoose.Types.ObjectId(technicianId);
    }
    
    // FIXED AGGREGATION PIPELINE WITH CUSTOMER DATA
    const pipeline = [
      { $match: matchCriteria },
      
      // Get location data
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location'
        }
      },
      
      // Get customer data through location
      {
        $lookup: {
          from: 'Customer',
          localField: 'location.customerID',
          foreignField: '_id',
          as: 'customer'
        }
      },
      
      // Get technician data  
      {
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technicians'
        }
      },
      
      // Sort and paginate
      { $sort: { createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      
      // Format the output with customer data
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
          customerContact: 1,
          // Location info
          locationName: { $arrayElemAt: ['$location.name', 0] },
          locationProvince: { $arrayElemAt: ['$location.province', 0] },
          locationDistrict: { $arrayElemAt: ['$location.district', 0] },
          locationAddress: { $arrayElemAt: ['$location.address', 0] },
          // Customer info - FIXED
          customerName: { $arrayElemAt: ['$customer.name', 0] },
          customerPhone: { $arrayElemAt: ['$customer.phone', 0] },
          customerEmail: { $arrayElemAt: ['$customer.email', 0] },
          // Technician info
          technicians: {
            $map: {
              input: '$technicians',
              as: 'tech',
              in: {
                firstName: '$$tech.firstName',
                lastName: '$$tech.lastName',
                code: '$$tech.code',
                position: '$$tech.position'
              }
            }
          }
        }
      }
    ];
    
    // Count pipeline
    const countPipeline = [
      { $match: matchCriteria },
      { $count: 'total' }
    ];
    
    // Execute both
    const [jobs, countResult] = await Promise.all([
      Job.aggregate(pipeline),
      Job.aggregate(countPipeline)
    ]);
    
    // Process results with customer data
    const processedJobs = jobs.map(job => {
      // Format technician names
      const technicianNames = (job.technicians || [])
        .map(tech => {
          const name = `${tech.firstName || ''} ${tech.lastName || ''}`.trim();
          const code = tech.code ? ` (${tech.code})` : '';
          return name ? `${name}${code}` : null;
        })
        .filter(name => name)
        .join(', ');
      
      // Get customer info - try multiple sources
      let customerName = job.customerName; // From Customer collection
      let customerPhone = job.customerPhone; // From Customer collection  
      let customerEmail = job.customerEmail; // From Customer collection
      
      // Fallback to customerContact if Customer collection data is missing
      if (!customerName && job.customerContact) {
        if (job.customerContact.firstName || job.customerContact.lastName) {
          customerName = `${job.customerContact.firstName || ''} ${job.customerContact.lastName || ''}`.trim();
        }
      }
      
      if (!customerPhone && job.customerContact?.phone) {
        customerPhone = job.customerContact.phone;
      }
      
      if (!customerEmail && job.customerContact?.email) {
        customerEmail = job.customerContact.email;
      }
      
      return {
        _id: job._id,
        jobNo: job.jobNo,
        status: job.status,
        type: job.type,
        priority: job.priority,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        appointmentTime: job.appointmentTime,
        customerContact: {
          name: customerName || 'N/A',
          phone: customerPhone || '',
          email: customerEmail || ''
        },
        location: {
          name: job.locationName,
          province: job.locationProvince,
          district: job.locationDistrict,
          address: job.locationAddress
        },
        technicianNames: technicianNames || 'N/A',
        technicianCount: (job.technicians || []).length
      };
    });
    
    const total = countResult[0]?.total || 0;
    
    // Summary
    const summary = {
      totalJobs: total,
      statusCounts: {},
      typeCounts: {},
      priorityCounts: {}
    };
    
    processedJobs.forEach(job => {
      summary.statusCounts[job.status] = (summary.statusCounts[job.status] || 0) + 1;
      summary.typeCounts[job.type] = (summary.typeCounts[job.type] || 0) + 1;
      summary.priorityCounts[job.priority] = (summary.priorityCounts[job.priority] || 0) + 1;
    });
    
    console.log(`Returning ${processedJobs.length} jobs with customer data`);
    
    res.json({
      success: true,
      data: {
        jobs: processedJobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        summary
      }
    });
    
  } catch (error) {
    console.error('Error fetching technician jobs:', error);
    res.json({ 
      success: false, 
      error: error.message,
      data: {
        jobs: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
        summary: { totalJobs: 0, statusCounts: {}, typeCounts: {}, priorityCounts: {} }
      }
    });
  }
});
export default router;