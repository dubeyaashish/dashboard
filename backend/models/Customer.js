// models/Customer.js
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  type: String,
  status: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;