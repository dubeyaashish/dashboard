// routes/analyticRoutes.js
import express from 'express';
import Job from '../models/Job.js';
import CustomerReview from '../models/CustomerReview.js';
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

export default router;