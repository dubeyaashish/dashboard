// utils/metricsComputation.js
import Job from '../models/Job.js';
import JobLocation from '../models/JobLocation.js';
import CustomerReview from '../models/CustomerReview.js';
import PrecomputedMetrics from '../models/PrecomputedMetrics.js';

// Common aggregation pipeline stages for job metrics
const getBaseJobAggregation = (startDate, endDate) => [
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $lookup: {
      from: 'joblocations',
      localField: 'jobLocationID',
      foreignField: '_id',
      as: 'location',
      pipeline: [
        { $project: { province: 1, district: 1, location: 1, name: 1 } }
      ]
    }
  },
  {
    $unwind: {
      path: '$location',
      preserveNullAndEmptyArrays: true
    }
  }
];

// Precompute daily job metrics
export const precomputeDailyMetrics = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startDate = yesterday;
    const endDate = new Date(yesterday);
    endDate.setHours(23, 59, 59, 999);
    
    // Get total jobs for the day
    const totalJobs = await Job.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get closed jobs for the day
    const closedJobs = await Job.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'] }
    });
    
    // Get jobs by province
    const jobsByProvince = await Job.aggregate([
      ...getBaseJobAggregation(startDate, endDate),
      {
        $group: {
          _id: '$location.province',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get jobs by district
    const jobsByDistrict = await Job.aggregate([
      ...getBaseJobAggregation(startDate, endDate),
      {
        $group: {
          _id: '$location.district',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get status distribution
    const statusDistribution = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Save precomputed metrics
    await PrecomputedMetrics.findOneAndUpdate(
      { metricType: 'daily', date: yesterday },
      {
        metricType: 'daily',
        date: yesterday,
        data: {
          totalJobs,
          closedJobs,
          jobsByProvince,
          jobsByDistrict,
          statusDistribution
        }
      },
      { upsert: true, new: true }
    );
    
    console.log(`Daily metrics precomputed for ${yesterday.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error('Error precomputing daily metrics:', error);
  }
};

// Precompute weekly job metrics
export const precomputeWeeklyMetrics = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate last week's date range
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekStart.getDate() - 6);
    lastWeekStart.setHours(0, 0, 0, 0);
    
    // Get total jobs for the week
    const totalJobs = await Job.countDocuments({
      createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd }
    });
    
    // Get closed jobs for the week
    const closedJobs = await Job.countDocuments({
      createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
      status: { $in: ['COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'] }
    });
    
    // Get jobs by province
    const jobsByProvince = await Job.aggregate([
      ...getBaseJobAggregation(lastWeekStart, lastWeekEnd),
      {
        $group: {
          _id: '$location.province',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get status distribution
    const statusDistribution = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Save precomputed metrics
    await PrecomputedMetrics.findOneAndUpdate(
      { metricType: 'weekly', date: lastWeekEnd },
      {
        metricType: 'weekly',
        date: lastWeekEnd,
        data: {
          totalJobs,
          closedJobs,
          jobsByProvince,
          statusDistribution,
          period: {
            start: lastWeekStart,
            end: lastWeekEnd
          }
        }
      },
      { upsert: true, new: true }
    );
    
    console.log(`Weekly metrics precomputed for week ending ${lastWeekEnd.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error('Error precomputing weekly metrics:', error);
  }
};