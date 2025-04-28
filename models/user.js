const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true },
    occasion: { type: String, required: true },
    date: { type: Date, required: true },
    flatNumber: { type: String, required: true },
    building: { type: String, required: true },
    landmark: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" }, // Reference to Product Model
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true }, // Ensure price is stored as a number
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    id: { type: String, required: true, unique: true }, // Ensure ID is stored as a string
    feedback: { type: [String], default: [] },
    payment: { type: Boolean, default: false },
    sharable: { type: Boolean, default: false },
    userName: { type: String, required: true },
    paymentlink: { type: String },
    sharablelink: { type: String },
    totalAmount: { type: Number, required: true },
    remaingamount: { type: Number, default: 0 },
    noofpayments: { type: Number, default: 0 }
}, { _id: false }); // Prevents mongoose from adding an automatic `_id` inside requests

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip :{
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    requests : {
        type:Array,
        default:[]
    }

});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
