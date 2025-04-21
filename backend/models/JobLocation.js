// models/JobLocation.js
import mongoose from 'mongoose';

const jobLocationSchema = new mongoose.Schema({
  name: String,
  status: String,
  type: String,
  address: String,
  subDistrict: String,
  district: String,
  province: String,
  postalCode: String,
  contactFirstName: String,
  contactLastName: String,
  contactPhone: String,
  customerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
});

// Create geospatial index for location queries
jobLocationSchema.index({ location: "2dsphere" });
jobLocationSchema.index({ province: 1 });
jobLocationSchema.index({ district: 1 });
jobLocationSchema.index({ customerID: 1 });

const JobLocation = mongoose.model('JobLocation', jobLocationSchema, 'JobLocation');
export default JobLocation;