// models/Job.js
import mongoose from 'mongoose';

const customerContactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  email: String
}, { _id: false });

const jobSchema = new mongoose.Schema({
  no: String,
  status: String,
  type: String,
  priority: String,
  appointmentTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  customerContact: customerContactSchema,
  jobLocationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobLocation'
  },
  createdByID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  settingCompanyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SettingCompany'
  },
  technicianProfileIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechnicianProfile'
  }],
  isManualFindTechnician: Boolean,
  isSendRequest: Boolean,
  isEditable: Boolean,
  isQcJob: Boolean,
  isReview: Boolean,
  isSlaInRisk: Boolean,
  isSlaInFail: Boolean,
  oldJobRefIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  pauseTime: {
    type: Number,
    default: 0
  },
  numOfHourSla: {
    type: Number,
    default: 0
  }
});

// Add indexes for performance optimization
jobSchema.index({ createdAt: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ priority: 1 });
jobSchema.index({ technicianProfileIDs: 1 });
jobSchema.index({ jobLocationID: 1 });
jobSchema.index({ no: 1 }, { unique: true });
jobSchema.index({ settingCompanyID: 1 });

const Job = mongoose.model('Job', jobSchema, 'Job');
export default Job;