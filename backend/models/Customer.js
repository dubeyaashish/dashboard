// models/Customer.js
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  code: String,
  customerType: String,
  name: String,
  phone: String,
  email: String,
  status: {
    type: String,
    default: 'ACTIVE'
  },
  imageID: {
    type: mongoose.Schema.Types.ObjectId
  },
  billingLocationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobLocation'
  },
  billingLocationRefID: {
    type: mongoose.Schema.Types.ObjectId
  },
  customerServiceTypeIDs: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for optimization
customerSchema.index({ code: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });

const Customer = mongoose.model('Customer', customerSchema, 'Customer');
export default Customer;