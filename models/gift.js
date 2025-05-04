// models/gift.js
const mongoose = require('mongoose');

// Define the gift schema
const giftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relation: { type: String, required: true },
  occasion: { type: String, required: true },
  date: { type: Date, required: true },
  flatNumber: { type: String, default: '' },
  building: { type: String, default: '' },
  landmark: { type: String, default: '' },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  feedback: { type: [String], default: [] },
  payment: { type: Boolean, default: false },
  sharable: { type: Boolean, default: false },
  userName: { type: String, required: true },
  paymentlink: { type: String, default: '' },
  sharablelink: { type: String, default: '' },
  totalAmount: { type: Number, required: true },
  remainingAmount: { type: Number, default: 0 },
  noOfPayments: { type: Number, default: 0 },
  paymentAmount: { type: Number, default: 0 }, timestamps: true
});

// Adding a virtual field for 'id' (MongoDB _id as string)
giftSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Setting virtuals to be included in JSON response
giftSchema.set('toJSON', {
  virtuals: true,
});

// Export the model
module.exports = mongoose.model('Gift', giftSchema); // Correct export
