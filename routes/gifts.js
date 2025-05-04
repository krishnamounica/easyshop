// routes/gifts.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Gift = require('../models/gift');  // Correct import
const app = express();
app.use(express.json());
app.use(cors());


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
            feedback, payment, sharable, userName, paymentlink, sharablelink, totalAmount, remainingAmount, noOfPayments, pincode, createdAt: new Date()
        });

        await giftData.save();
        res.status(201).send({ message: 'Gift details saved!' });
    } catch (error) {
        console.error('Error saving gift details:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});



// GET all gifts for a specific user
app.get('/', async (req, res) => {
  try {
    const { userName } = req.query;

    if (!userName) {
      return res.status(400).json({ error: 'UserName is required' });
    }

    const gifts = await Gift.find({ userName });

    return res.status(200).json(gifts);
  } catch (error) {
    console.error('Error fetching gift requests:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Optional: validate incoming data if needed
    if (!id) {
      return res.status(400).json({ error: 'Gift ID is required' });
    }

    const updatedGift = await Gift.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedGift) {
      return res.status(404).json({ error: 'Gift not found' });
    }

    return res.status(200).json({ message: 'Gift updated successfully', gift: updatedGift });
  } catch (error) {
    console.error('Error updating gift request:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app; // Export the route handler
