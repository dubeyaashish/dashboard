// routes/jobRoutes.js
import express from 'express';
import Job from '../models/Job.js';
import JobLocation from '../models/JobLocation.js';
import TechnicianProfile from '../models/TechnicianProfile.js';
import PrecomputedMetrics from '../models/PrecomputedMetrics.js';

const router = express.Router();
// Get job overview data with pagination
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate, status, type, priority, province, teamLeader, page = 1, limit = 10 } = req.query;
    
    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // If requesting today's metrics, use precomputed data if available
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start.getTime() === today.getTime() && end.getTime() >= today.getTime()) {
      const precomputed = await PrecomputedMetrics.findOne({
        metricType: 'daily',
        date: { $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) }
      }).sort({ date: -1 });
      
      if (precomputed) {
        // Return precomputed metrics with additional filtering if needed
        return res.json({
          success: true,
          data: precomputed.data,
          source: 'precomputed'
        });
      }
    }
    
    // Build the query for filtering
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    if (status && status !== 'All') matchCriteria.status = status;
    if (type && type !== 'All') matchCriteria.type = type;
    if (priority && priority !== 'All') matchCriteria.priority = priority;
    
    // Advanced pipeline for province and team leader filtering
    const pipeline = [
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'jobLocation',
          pipeline: [{ $project: { province: 1, district: 1, name: 1, location: 1 } }]
        }
      },
      { $unwind: { path: '$jobLocation', preserveNullAndEmptyArrays: true } }
    ];
    
    // Add province filter if specified
    if (province && province !== 'All') {
      pipeline.push({
        $match: { 'jobLocation.province': province }
      });
    }
    
    // Add technician lookup if needed for team leader filtering
    if (teamLeader && teamLeader !== 'All') {
      pipeline.push(
        {
          $lookup: {
            from: 'TechnicianProfile',
            localField: 'technicianProfileIDs',
            foreignField: '_id',
            as: 'technicians'
          }
        },
        {
          $match: {
            $or: [
              { 'technicians.firstName': { $regex: teamLeader.split(' ')[0], $options: 'i' } },
              { 'technicians.lastName': { $regex: teamLeader.split(' ').slice(1).join(' '), $options: 'i' } }
            ]
          }
        }
      );
    } else {
      // Always lookup technicians for name display
      pipeline.push({
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technicians'
        }
      });
    }
    
    // Clone the pipeline for total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    
    // Add pagination to the main pipeline
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: parseInt(page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );
    
    // Project only the fields we need
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
        locationName: '$jobLocation.name',
        locationProvince: '$jobLocation.province',
        locationDistrict: '$jobLocation.district',
        coordinates: '$jobLocation.location.coordinates',
        technicians: 1
      }
    });
    
    // Execute the queries
    const [jobs, countResult] = await Promise.all([
      Job.aggregate(pipeline),
      Job.aggregate(countPipeline)
    ]);
    
    const total = countResult[0]?.total || 0;
    
    // Process the technician names like in Streamlit
    const processedJobs = jobs.map(job => {
      const technicians = job.technicians || [];
      const technicianNames = technicians
        .map(tech => {
          const firstName = tech.firstName || '';
          const lastName = tech.lastName || '';
          return `${firstName} ${lastName}`.trim();
        })
        .filter(name => name.length > 0);
      
      return {
        ...job,
        technician_names: technicianNames.length > 0 ? technicianNames.join(', ') : 'N/A'
      };
    });
    
    // Get today's jobs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayJobs = await Job.countDocuments({
      ...matchCriteria,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });
    
    const todayClosed = await Job.countDocuments({
      ...matchCriteria,
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'] }
    });
    
    // Get status distribution
    const statusDistribution = await Job.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get priority distribution
    const priorityDistribution = await Job.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Get province distribution (top 10)
    const provinceDistribution = await Job.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location',
          pipeline: [{ $project: { province: 1 } }]
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$location.province', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get district distribution (top 10)
    const districtDistribution = await Job.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'JobLocation',
          localField: 'jobLocationID',
          foreignField: '_id',
          as: 'location',
          pipeline: [{ $project: { district: 1 } }]
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$location.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Send the response
    res.json({
      success: true,
      data: {
        jobs: processedJobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        metrics: {
          totalJobs: total,
          openJobs: total - await Job.countDocuments({
            ...matchCriteria,
            status: { $in: ['COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'] }
          }),
          closedJobs: await Job.countDocuments({
            ...matchCriteria,
            status: { $in: ['COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'] }
          }),
          todayJobs,
          todayClosed
        },
        distributions: {
          status: statusDistribution,
          priority: priorityDistribution,
          province: provinceDistribution,
          district: districtDistribution
        }
      },
      source: 'computed'
    });
  } catch (error) {
    console.error('Error fetching job overview:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get job map data
router.get('/map-data', async (req, res) => {
  try {
    const { startDate, endDate, status, type, priority, province } = req.query;
    
    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Build the query for filtering
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    if (status && status !== 'All') matchCriteria.status = status;
    if (type && type !== 'All') matchCriteria.type = type;
    if (priority && priority !== 'All') matchCriteria.priority = priority;
    
    const pipeline = [
      { $match: matchCriteria },
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
                location: 1,
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
      {
        $lookup: {
          from: 'Customer',
          localField: 'location.customerID',
          foreignField: '_id',
          as: 'customer',
          pipeline: [{ $project: { name: 1 } }]
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'TechnicianProfile',
          localField: 'technicianProfileIDs',
          foreignField: '_id',
          as: 'technicians',
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }]
        }
      }
    ];
    
    // Add province filter if specified
    if (province && province !== 'All') {
      pipeline.push({
        $match: { 'location.province': province }
      });
    }
    
    // Project only the fields needed for the map
    pipeline.push({
      $project: {
        _id: 1,
        jobNo: '$no',
        status: 1,
        type: 1,
        priority: 1,
        createdAt: 1,
        appointmentTime: 1,
        locationName: '$location.name',
        locationProvince: '$location.province',
        locationDistrict: '$location.district',
        locationCoordinates: '$location.location.coordinates',
        customerName: '$customer.name',
        technicians: 1
      }
    });
    
    const mapData = await Job.aggregate(pipeline);
    
    // Process the data for the map - similar to Streamlit
    const processedData = mapData.map(job => {
      const technicians = job.technicians || [];
      const technicianNames = technicians
        .map(tech => {
          const firstName = tech.firstName || '';
          const lastName = tech.lastName || '';
          return `${firstName} ${lastName}`.trim();
        })
        .filter(name => name.length > 0);
      
      // Extract coordinates with proper checks
      let lon = null;
      let lat = null;
      
      if (job.locationCoordinates && Array.isArray(job.locationCoordinates) && job.locationCoordinates.length === 2) {
        [lon, lat] = job.locationCoordinates;
      }
      
      return {
        id: job._id,
        jobNo: job.jobNo,
        status: job.status,
        type: job.type,
        priority: job.priority,
        createdAt: job.createdAt,
        appointmentTime: job.appointmentTime,
        location: {
          name: job.locationName,
          province: job.locationProvince,
          district: job.locationDistrict,
          coordinates: [lon, lat]
        },
        customerName: job.customerName,
        technicianNames: technicianNames.length > 0 ? technicianNames.join(', ') : 'N/A',
        lon: lon,
        lat: lat
      };
    }).filter(job => job.lon !== null && job.lat !== null);
    
    res.json({
      success: true,
      data: processedData
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;