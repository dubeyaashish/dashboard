// utils/cronJobs.js
import * as cron from 'node-cron';
import { precomputeDailyMetrics, precomputeWeeklyMetrics } from './metricsComputation.js';

export const startPrecomputationJobs = () => {
  // Run daily metrics computation at 1 AM every day
  cron.schedule('0 1 * * *', async () => {
    console.log('Running daily metrics precomputation...');
    await precomputeDailyMetrics();
  });

  // Run weekly metrics computation at 2 AM every Monday
  cron.schedule('0 2 * * 1', async () => {
    console.log('Running weekly metrics precomputation...');
    await precomputeWeeklyMetrics();
  });
};