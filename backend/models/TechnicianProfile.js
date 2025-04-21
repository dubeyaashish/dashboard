// models/TechnicianProfile.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  address: String,
  subDistrict: String,
  district: String,
  province: String,
  postalCode: String
}, { _id: false });

const scoreSchema = new mongoose.Schema({
  time: {
    type: Number,
    default: 0
  },
  manner: {
    type: Number,
    default: 0
  },
  knowledge: {
    type: Number,
    default: 0
  },
  overall: {
    type: Number,
    default: 0
  },
  recommend: {
    type: Number,
    default: 0
  }
}, { _id: false });

const avgScoreSchema = new mongoose.Schema({
  time: {
    type: Number,
    default: 0
  },
  manner: {
    type: Number,
    default: 0
  },
  knowledge: {
    type: Number,
    default: 0
  },
  overall: {
    type: Number,
    default: 0
  },
  recommend: {
    type: Number,
    default: 0
  }
}, { _id: false });

const technicianProfileSchema = new mongoose.Schema({
  code: String,
  type: String,
  status: {
    type: String,
    default: 'ACTIVE'
  },
  firstName: String,
  lastName: String,
  imageID: {
    type: mongoose.Schema.Types.ObjectId
  },
  idCard: String,
  position: String,
  birthDate: Date,
  gender: String,
  lineId: String,
  isLocationActive: Boolean,
  currentArea: Boolean,
  settingCompanyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SettingCompany'
  },
  contactPersonID: {
    type: mongoose.Schema.Types.ObjectId
  },
  technicianWorkConditionID: {
    type: mongoose.Schema.Types.ObjectId
  },
  totalScore: {
    type: Number,
    default: 0
  },
  totalJobReviewed: {
    type: Number,
    default: 0
  },
  address: addressSchema,
  score: scoreSchema,
  avgScore: avgScoreSchema,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

technicianProfileSchema.index({ code: 1 });
technicianProfileSchema.index({ position: 1 });
technicianProfileSchema.index({ status: 1 });
technicianProfileSchema.index({ settingCompanyID: 1 });
technicianProfileSchema.index({ firstName: 1, lastName: 1 });

const TechnicianProfile = mongoose.model('TechnicianProfile', technicianProfileSchema, 'TechnicianProfile');
export default TechnicianProfile;