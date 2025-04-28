// routes/gifts.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Gift = require('../models/gift');  // Correct import
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Connection Error:", err));

// Gift Route - POST request to save gift details
app.post('/', async (req, res) => {
    const {
        name, phone, relation, occasion, date, flatNumber, building, landmark, district, state, productId, productName, productPrice, status,
        feedback, payment, sharable, userName, paymentlink, sharablelink, totalAmount, remainingAmount, noOfPayments, pincode
    } = req.body;
    const [day, month, year] = req.body.date.split('/');
const formattedDate = new Date(`${year}-${month}-${day}`);
req.body.date = formattedDate;


    try {
        const giftData = new Gift({
            name, phone, relation, occasion, date, flatNumber, building, landmark, district, state, productId, productName, productPrice, status,
            feedback, payment, sharable, userName, paymentlink, sharablelink, totalAmount, remainingAmount, noOfPayments, pincode
        });

        await giftData.save();
        res.status(201).send({ message: 'Gift details saved!' });
    } catch (error) {
        console.error('Error saving gift details:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = app; // Export the route handler
