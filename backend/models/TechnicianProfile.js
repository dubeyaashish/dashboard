// models/TechnicianProfile.js
import mongoose from 'mongoose';

const technicianProfileSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  code: String,
  position: String,
  teamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechnicianProfile'
  },
  phone: String,
  address: {
    address: String,
    subDistrict: String,
    district: String,
    province: String,
    postalCode: String
  },
  workCondition: {
    workloadPerDay: Number,
    jobType: [String],
    expertise: [String]
  },
  imageUrl: String,
  status: {
    type: String,
    default: 'ACTIVE'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

technicianProfileSchema.index({ position: 1 });
technicianProfileSchema.index({ status: 1 });
technicianProfileSchema.index({ "workCondition.jobType": 1 });

const TechnicianProfile = mongoose.model('TechnicianProfile', technicianProfileSchema);
export default TechnicianProfile;