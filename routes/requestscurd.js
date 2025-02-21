require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Connection Error:", err));

// User Schema with Embedded Requests
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    street: { type: String, default: '' },
    apartment: { type: String, default: '' },
    zip: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    requests: [{
        id: { type: String, required: true },
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
        productPrice: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        feedback: { type: [String], default: [] },
        payment: { type: Boolean, default: false },
        sharable: { type: Boolean, default: false },
        userName: { type: String, required: true },
        paymentlink: { type: String, default: '' },
        sharablelink: { type: String, default: '' },
        totalAmount: { type: Number, required: true },
        remaingamount: { type: Number, default: 0 },
        noofpayments: { type: Number, default: 0 },
        paymentAmount: { type: Number, default: 0 }
    }]
});

// Virtual ID field
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

// ────────────────────────────────────────────
//               API Endpoints
// ────────────────────────────────────────────

// ✅ Get User by ID
app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Get Specific Request by Request ID
app.get('/api/users/:userId/requests/:requestId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const request = user.requests.find(req => req.id === req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Add New Request to a User
app.post('/api/users/:userId/requests', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newRequest = req.body;
        user.requests.push(newRequest);
        await user.save();

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Update Request Status
app.put('/api/users/:userId/requests/:requestId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const request = user.requests.find(req => req.id === req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = req.body.status || request.status;
        await user.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Delete a Request
app.delete('/api/users/:userId/requests/:requestId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.requests = user.requests.filter(req => req.id !== req.params.requestId);
        await user.save();

        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ────────────────────────────────────────────
//               Start Server
// ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
