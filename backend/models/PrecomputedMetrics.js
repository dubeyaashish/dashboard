// models/PrecomputedMetrics.js
import mongoose from 'mongoose';

const precomputedMetricsSchema = new mongoose.Schema({
  metricType: String, // 'daily', 'weekly', 'monthly'
  date: Date,
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

precomputedMetricsSchema.index({ metricType: 1, date: 1 }, { unique: true });

const PrecomputedMetrics = mongoose.model('PrecomputedMetrics', precomputedMetricsSchema);
export default PrecomputedMetrics;