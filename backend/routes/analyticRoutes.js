// File: backend/routes/analyticRoutes.js (Updated with multi-select technician support)
import express from 'express';
import Job from '../models/Job.js';
import CustomerReview from '../models/CustomerReview.js';
import mongoose from 'mongoose';
import TechnicianProfile from '../models/TechnicianProfile.js';
import PrecomputedMetrics from '../models/PrecomputedMetrics.js';

const router = express.Router();

// Helper function to parse technician filter (same as in jobRoutes.js)
const parseTechnicianFilter = (req) => {
  const { technicianIds, technicianId, technician } = req.query;
  
  // Handle multi-select technicians (comma-separated string)
  if (technicianIds && technicianIds !== 'All') {
    const ids = technicianIds.split(',').filter(id => id.trim() !== '');
    return ids.map(id => {
      try {
        return new mongoose.Types.ObjectId(id.trim());
      } catch (error) {
        console.warn(`Invalid ObjectId: ${id}`);
        return null;
      }
    }).filter(id => id !== null);
  }
  
  // Handle single technician (backward compatibility)
  if (technicianId && technicianId !== 'All') {
    try {
      return [new mongoose.Types.ObjectId(technicianId)];
    } catch (error) {
      console.warn(`Invalid ObjectId: ${technicianId}`);
      return [];
    }
  }
  
  // Legacy technician name filtering (keep for compatibility)
  if (technician && technician !== 'All') {
    return technician; // Will be handled differently in aggregation
  }
  
  return null;
};

// Get technician performance data with multi-select support
router.get('/technician-performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const technicianFilter = parseTechnicianFilter(req);
    
    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    console.log('Technician performance filter:', technicianFilter);
    
    // Build match criteria for reviews
    const reviewMatchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    // Add technician filter to review criteria if specified
    if (technicianFilter && Array.isArray(technicianFilter)) {
      reviewMatchCriteria.technicianProfileIDs = { $in: technicianFilter };
      console.log('Applied technician filter to performance query:', technicianFilter.length, 'technicians');
    }
    
    const pipeline = [
      {
        $match: reviewMatchCriteria
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
    
    // Get recent reviews for filtered technicians
    const reviewsMatchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    // Apply same technician filter to recent reviews
    if (technicianFilter && Array.isArray(technicianFilter)) {
      reviewsMatchCriteria.technicianProfileIDs = { $in: technicianFilter };
    }
    
    const reviewsPipeline = [
      {
        $match: reviewsMatchCriteria
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
    
    console.log(`Returning performance data for ${techPerformance.length} technicians and ${recentReviews.length} recent reviews`);
    
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

// Get geographic distribution stats with multi-select technician support
router.get('/geographic', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const technicianFilter = parseTechnicianFilter(req);
    
    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    console.log('Geographic analysis technician filter:', technicianFilter);
    
    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    // Apply technician filter if specified
    if (technicianFilter && Array.isArray(technicianFilter)) {
      matchCriteria.technicianProfileIDs = { $in: technicianFilter };
      console.log('Applied technician filter to geographic query:', technicianFilter.length, 'technicians');
    }
    
    const pipeline = [
      {
        $match: matchCriteria
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
    
    // Get district level data with technician filter
    const districtPipeline = [
      {
        $match: matchCriteria
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
    
    // Status breakdown by province with technician filter
    const statusPipeline = [
      {
        $match: matchCriteria
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
    
    console.log(`Geographic analysis returning ${provinceData.length} provinces, ${districtData.length} district groups, ${statusByProvince.length} status breakdowns`);
    
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

// Get technician jobs with multi-select support
router.get('/technician-jobs', async (req, res) => {
  try {
    const { startDate, endDate, status, type, priority, page = 1, limit = 10 } = req.query;
    const technicianFilter = parseTechnicianFilter(req);
    
    // Convert dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    console.log('Technician jobs filter:', technicianFilter);
    console.log(`Request: page=${page}, limit=${limit}`);
    
    // IMPORTANT: Allow large limits for Excel export
    const requestedLimit = parseInt(limit);
    const requestedPage = parseInt(page);
    
    // If requesting more than 100 records, it's likely an export request
    const isExportRequest = requestedLimit >= 100;
    if (isExportRequest) {
      console.log(`Export request detected: ${requestedLimit} records requested`);
    }
    
    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    if (status && status !== 'All') matchCriteria.status = status;
    if (type && type !== 'All') matchCriteria.type = type;
    if (priority && priority !== 'All') matchCriteria.priority = priority;
    
    // Apply technician filter
    if (technicianFilter && Array.isArray(technicianFilter)) {
      matchCriteria.technicianProfileIDs = { $in: technicianFilter };
      console.log('Applied technician filter to jobs query:', technicianFilter.length, 'technicians');
    }
    
    // ENHANCED AGGREGATION PIPELINE
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
      
      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } }
    ];
    
    // Apply pagination ONLY if not a large export request
    if (!isExportRequest || requestedLimit <= 10000) {
      pipeline.push(
        { $skip: (requestedPage - 1) * requestedLimit },
        { $limit: requestedLimit }
      );
    }
    
    // Add projection to format the output
    pipeline.push({
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
        // Customer info
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
    });
    
    // Get total count (separate query for efficiency)
    const countPipeline = [
      { $match: matchCriteria },
      { $count: 'total' }
    ];
    
    // Execute both queries
    console.log('Executing aggregation pipeline...');
    const [jobs, countResult] = await Promise.all([
      Job.aggregate(pipeline),
      Job.aggregate(countPipeline)
    ]);
    
    const total = countResult[0]?.total || 0;
    console.log(`Found ${jobs.length} jobs out of ${total} total matching records`);
    
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
    
    // Summary calculation
    const summary = {
      totalJobs: total,
      statusCounts: {},
      typeCounts: {},
      priorityCounts: {}
    };
    
    // Calculate summary from all matching records (not just current page)
    const summaryPipeline = [
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          statusCounts: { $push: '$status' },
          typeCounts: { $push: '$type' },
          priorityCounts: { $push: '$priority' }
        }
      }
    ];
    
    try {
      const summaryResult = await Job.aggregate(summaryPipeline);
      if (summaryResult.length > 0) {
        const data = summaryResult[0];
        
        // Count occurrences
        data.statusCounts.forEach(status => {
          summary.statusCounts[status] = (summary.statusCounts[status] || 0) + 1;
        });
        
        data.typeCounts.forEach(type => {
          summary.typeCounts[type] = (summary.typeCounts[type] || 0) + 1;
        });
        
        data.priorityCounts.forEach(priority => {
          summary.priorityCounts[priority] = (summary.priorityCounts[priority] || 0) + 1;
        });
      }
    } catch (summaryError) {
      console.error('Error calculating summary:', summaryError);
    }
    
    const responseData = {
      success: true,
      data: {
        jobs: processedJobs,
        pagination: {
          total,
          page: requestedPage,
          limit: requestedLimit,
          pages: Math.ceil(total / requestedLimit)
        },
        summary
      }
    };
    
    // Log export info
    if (isExportRequest) {
      console.log(`✅ EXPORT RESPONSE: Returning ${processedJobs.length} records out of ${total} total`);
    }
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Error fetching technician jobs:', error);
    res.status(500).json({ 
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