const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  razorpay_payment_id: { type: String, required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  amount:{type:String,required:true},
  payment_mode: { type: String },
tax: { type: Number },
amount: { type: Number }
});
module.exports = mongoose.model('Payment', paymentSchema);
