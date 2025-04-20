// models/Job.js
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  no: String,
  status: String,
  type: String,
  priority: String,
  appointmentTime: Date,
  createdAt: Date,
  updatedAt: Date,
  customerContact: String,
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
  pauseTime: Number,
  numOfHourSla: Number
});

// Add indexes for performance optimization
jobSchema.index({ createdAt: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ "type": 1 });
jobSchema.index({ "priority": 1 });
jobSchema.index({ technicianProfileIDs: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;