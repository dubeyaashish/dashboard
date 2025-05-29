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

// Add this route to backend/routes/analyticRoutes.js

// Get jobs by technician with detailed information
router.get('/technician-jobs', async (req, res) => {
  try {
    const { startDate, endDate, technicianId, status, type, priority, page = 1, limit = 10 } = req.query;
    
    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    // Add filters
    if (status && status !== 'All') matchCriteria.status = status;
    if (type && type !== 'All') matchCriteria.type = type;
    if (priority && priority !== 'All') matchCriteria.priority = priority;
    
    // Technician filter - match if technician ID is in the array
    if (technicianId && technicianId !== 'All') {
      matchCriteria.technicianProfileIDs = new mongoose.Types.ObjectId(technicianId);
    }
    
    // Main aggregation pipeline
    const pipeline = [
      // STEP 1: Match jobs by criteria
      { $match: matchCriteria },
      
      // STEP 2: Lookup job location details
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location',
          pipeline: [
            {
              $project: {
                name: 1,
                province: 1,
                district: 1,
                address: 1,
                contactFirstName: 1,
                contactLastName: 1,
                contactPhone: 1,
                customerID: 1
              }
            }
          ]
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      
      // STEP 3: Lookup customer details through location
      {
        $lookup: {
          from: 'Customer',
          localField: 'location.customerID',
          foreignField: '_id',
          as: 'customer',
          pipeline: [
            {
              $project: {
                name: 1,
                phone: 1,
                email: 1
              }
            }
          ]
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      
      // STEP 4: Lookup technician details
      {
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technicians',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                code: 1,
                position: 1,
                type: 1
              }
            }
          ]
        }
      },
      
      // STEP 5: Sort by creation date (newest first)
      { $sort: { createdAt: -1 } },
      
      // STEP 6: Project final fields
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
          isManualFindTechnician: 1,
          isSendRequest: 1,
          isEditable: 1,
          isQcJob: 1,
          isReview: 1,
          // Customer contact info
          customerContact: {
            name: {
              $cond: {
                if: { $eq: ['$customerContact.firstName', ''] },
                then: {
                  $cond: {
                    if: '$customer.name',
                    then: '$customer.name',
                    else: 'N/A'
                  }
                },
                else: {
                  $concat: [
                    { $ifNull: ['$customerContact.firstName', ''] },
                    ' ',
                    { $ifNull: ['$customerContact.lastName', ''] }
                  ]
                }
              }
            },
            phone: {
              $cond: {
                if: { $ne: ['$customerContact.phone', ''] },
                then: '$customerContact.phone',
                else: '$customer.phone'
              }
            },
            email: {
              $cond: {
                if: { $ne: ['$customerContact.email', ''] },
                then: '$customerContact.email',
                else: '$customer.email'
              }
            }
          },
          // Location info
          location: {
            name: '$location.name',
            province: '$location.province',
            district: '$location.district',
            address: '$location.address',
            contactName: {
              $concat: [
                { $ifNull: ['$location.contactFirstName', ''] },
                ' ',
                { $ifNull: ['$location.contactLastName', ''] }
              ]
            },
            contactPhone: '$location.contactPhone'
          },
          // Technician info
          technicians: 1,
          technicianCount: { $size: '$technicians' }
        }
      }
    ];
    
    // Count pipeline for pagination
    const countPipeline = [
      { $match: matchCriteria },
      { $count: 'total' }
    ];
    
    // Add pagination to main pipeline
    const paginatedPipeline = [
      ...pipeline,
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ];
    
    // Execute both pipelines
    const [jobs, countResult] = await Promise.all([
      Job.aggregate(paginatedPipeline),
      Job.aggregate(countPipeline)
    ]);
    
    // Process technician names
    const processedJobs = jobs.map(job => {
      const technicians = job.technicians || [];
      const technicianNames = technicians.map(tech => {
        const name = `${tech.firstName || ''} ${tech.lastName || ''}`.trim();
        const code = tech.code ? ` (${tech.code})` : '';
        const position = tech.position ? ` - ${tech.position}` : '';
        return `${name}${code}${position}`;
      }).filter(name => name.length > 3); // Filter out empty or very short names
      
      return {
        ...job,
        technicians: undefined, // Remove raw technician data
        technicianNames: technicianNames.join(', ') || 'N/A',
        technicianCount: technicians.length
      };
    });
    
    const total = countResult[0]?.total || 0;
    
    // Get summary statistics
    const summaryPipeline = [
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          byStatus: {
            $push: '$status'
          },
          byType: {
            $push: '$type'
          },
          byPriority: {
            $push: '$priority'
          }
        }
      },
      {
        $project: {
          totalJobs: 1,
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$byStatus'] },
                as: 'status',
                in: {
                  k: '$$status',
                  v: {
                    $size: {
                      $filter: {
                        input: '$byStatus',
                        cond: { $eq: ['$$this', '$$status'] }
                      }
                    }
                  }
                }
              }
            }
          },
          typeCounts: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$byType'] },
                as: 'type',
                in: {
                  k: '$$type',
                  v: {
                    $size: {
                      $filter: {
                        input: '$byType',
                        cond: { $eq: ['$$this', '$$type'] }
                      }
                    }
                  }
                }
              }
            }
          },
          priorityCounts: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$byPriority'] },
                as: 'priority',
                in: {
                  k: '$$priority',
                  v: {
                    $size: {
                      $filter: {
                        input: '$byPriority',
                        cond: { $eq: ['$$this', '$$priority'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ];
    
    const summaryResult = await Job.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalJobs: 0,
      statusCounts: {},
      typeCounts: {},
      priorityCounts: {}
    };
    
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
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;