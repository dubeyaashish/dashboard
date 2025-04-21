// models/CustomerReview.js
import mongoose from 'mongoose';

const customerReviewSchema = new mongoose.Schema({
  jobID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  technicianProfileIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechnicianProfile'
  }],
  time: Number,
  manner: Number,
  knowledge: Number,
  overall: Number,
  recommend: Number,
  comment: String,
  createdAt: Date
});

customerReviewSchema.index({ createdAt: 1 });
customerReviewSchema.index({ jobID: 1 });
customerReviewSchema.index({ technicianProfileIDs: 1 });

const CustomerReview = mongoose.model('CustomerReview', customerReviewSchema, 'CustomerReview');
export default CustomerReview;