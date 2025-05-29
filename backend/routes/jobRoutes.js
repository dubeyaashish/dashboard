// File: backend/routes/jobRoutes.js (Complete version with filter options)
import express from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import JobLocation from '../models/JobLocation.js';
import TechnicianProfile from '../models/TechnicianProfile.js';
import PrecomputedMetrics from '../models/PrecomputedMetrics.js';

const router = express.Router();

// File: backend/routes/jobRoutes.js - Atlas SQL compatible version
router.get('/filter-options', async (req, res) => {
  try {
    console.log('=== Getting filter options for Atlas SQL ===');
    
    const responseData = {
      success: true,
      data: {
        statuses: ['All'],
        types: ['All'],
        priorities: ['All'],
        provinces: ['All'],
        technicians: [],
        teamLeaders: ['All']
      }
    };

    try {
      // For Atlas SQL, we need to use regular find() and aggregate, not distinct()
      
      // Get statuses using aggregation
      console.log('Getting statuses...');
      const statusResult = await Job.aggregate([
        { $group: { _id: '$status' } },
        { $match: { _id: { $ne: null } } }
      ]);
      if (statusResult && statusResult.length > 0) {
        const statuses = statusResult.map(item => item._id).filter(s => s);
        responseData.data.statuses = ['All', ...statuses];
      }
      console.log('Statuses:', responseData.data.statuses);

      // Get types using aggregation
      console.log('Getting types...');
      const typeResult = await Job.aggregate([
        { $group: { _id: '$type' } },
        { $match: { _id: { $ne: null } } }
      ]);
      if (typeResult && typeResult.length > 0) {
        const types = typeResult.map(item => item._id).filter(t => t);
        responseData.data.types = ['All', ...types];
      }
      console.log('Types:', responseData.data.types);

      // Get priorities using aggregation
      console.log('Getting priorities...');
      const priorityResult = await Job.aggregate([
        { $group: { _id: '$priority' } },
        { $match: { _id: { $ne: null } } }
      ]);
      if (priorityResult && priorityResult.length > 0) {
        const priorities = priorityResult.map(item => item._id).filter(p => p);
        responseData.data.priorities = ['All', ...priorities];
      }
      console.log('Priorities:', responseData.data.priorities);

      // Get provinces using aggregation
      console.log('Getting provinces...');
      const provinceResult = await JobLocation.aggregate([
        { $group: { _id: '$province' } },
        { $match: { _id: { $ne: null } } }
      ]);
      if (provinceResult && provinceResult.length > 0) {
        const provinces = provinceResult.map(item => item._id).filter(p => p);
        responseData.data.provinces = ['All', ...provinces];
      }
      console.log('Provinces:', responseData.data.provinces);

      // Get technicians - try different approaches
      console.log('Getting technicians...');
      let technicians = [];
      
      // Try method 1: Find all active technicians
      try {
        const techDocs = await TechnicianProfile.find({})
        console.log('Method 1 - Active technicians found:', techDocs.length);
        technicians = techDocs;
      } catch (e1) {
        console.log('Method 1 failed:', e1.message);
        
        // Try method 2: Find all technicians without status filter  
        try {
          const techDocs = await TechnicianProfile.find({}).limit(50);
          console.log('Method 2 - All technicians found:', techDocs.length);
          technicians = techDocs;
        } catch (e2) {
          console.log('Method 2 failed:', e2.message);
          
          // Try method 3: Use aggregation
          try {
            const techDocs = await TechnicianProfile.aggregate([
              { $limit: 50 }
            ]);
            console.log('Method 3 - Aggregated technicians found:', techDocs.length);
            technicians = techDocs;
          } catch (e3) {
            console.log('Method 3 failed:', e3.message);
          }
        }
      }

      // Format technicians if we found any
      if (technicians && technicians.length > 0) {
        const formattedTechnicians = technicians.map(tech => {
          const firstName = tech.firstName || '';
          const lastName = tech.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          return {
            id: tech._id.toString(),
            firstName: firstName,
            lastName: lastName,
            code: tech.code || '',
            position: tech.position || '',
            fullName: fullName || 'Unknown',
            displayName: `${fullName}${tech.code ? ` (${tech.code})` : ''}`.trim()
          };
        }).filter(tech => tech.fullName !== 'Unknown'); // Only include technicians with names
        
        responseData.data.technicians = formattedTechnicians;
        console.log('Formatted technicians:', formattedTechnicians.length);
      }

    } catch (dbError) {
      console.error('Database operation failed:', dbError.message);
      // Keep default values
    }

    console.log('=== Final Results ===');
    console.log('Statuses:', responseData.data.statuses.length);
    console.log('Types:', responseData.data.types.length);
    console.log('Priorities:', responseData.data.priorities.length);
    console.log('Provinces:', responseData.data.provinces.length);
    console.log('Technicians:', responseData.data.technicians.length);

    res.json(responseData);
    
  } catch (error) {
    console.error('Filter options error:', error.message);
    
    // Return safe defaults
    res.json({
      success: true,
      data: {
        statuses: ['All', 'WAITINGJOB', 'WORKING', 'COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'],
        types: ['All', 'INSTALLATION', 'MAINTENANCE', 'REPAIR'],
        priorities: ['All', 'HIGH', 'MEDIUM', 'LOW'],
        provinces: ['All', 'Bangkok', 'Chiang Mai', 'Phuket'],
        technicians: [],
        teamLeaders: ['All']
      }
    });
  }
});
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


// Add this debug route to your backend/routes/jobRoutes.js to check what types exist

router.get('/debug-types', async (req, res) => {
  try {
    console.log('=== DEBUGGING JOB TYPES ===');
    
    // Method 1: Get all distinct types using aggregation
    const typeResult = await Job.aggregate([
      { $group: { _id: '$type' } },
      { $match: { _id: { $ne: null } } }
    ]);
    console.log('Types from aggregation:', typeResult);
    
    // Method 2: Get sample jobs to see what type field looks like
    const sampleJobs = await Job.find({}).limit(10).select('no type');
    console.log('Sample jobs with types:', sampleJobs);
    
    // Method 3: Count jobs by type manually
    const typeCounts = {};
    const allJobs = await Job.find({}).select('type');
    allJobs.forEach(job => {
      const type = job.type || 'null/empty';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    console.log('Type counts:', typeCounts);
    
    res.json({
      success: true,
      aggregationTypes: typeResult,
      sampleJobs: sampleJobs,
      typeCounts: typeCounts,
      totalJobs: allJobs.length
    });
    
  } catch (error) {
    console.error('Debug types error:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

export default router;