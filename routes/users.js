const {User} = require('../models/user');
const Payment = require('../models/payment'); 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const shortid = require('shortid');


const razorpay = new Razorpay({
    key_id: `rzp_test_Zr4AoaaUCDwWjy`,
    key_secret: `fECCwYuUdur6HdahuurRr7Nm`
});

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

// router.get('/:id', async(req,res)=>{
//     const user = await User.findById(req.params.id).select('-passwordHash');

//     if(!user) {
//         res.status(500).json({message: 'The user with the given ID was not found.'})
//     } 
//     res.status(200).send(user);
// })

router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})
router.post('/guser', async (req,res)=>{
    const {token} = req.body
    let user = await User.findOne({email: req.body.email})
    if(!user) {
        const newusers = new User({
            name: req.body.name,
            email: req.body.email,
            isAdmin: false
        })
        user = await newusers.save();
        res.status(200).send({user: user.email , token: token,
            requests: user.requests,
            id : user.id,userName : user.name}) 
    }
   
  res.status(200).send({email: user.email , token:token,
    requests: user.requests,
    id : user.id,userName : user.name}) 
})

router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
            requests:req.body.requests
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.post('/login', async (req,res) => {
   
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('The user not found');
    }
    if(user  && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
       
        res.status(200).send({user: user.email , token: token, 
            requests: user.requests,
            id : user.id,userName : user.name}) 
    } else {
       res.status(400).send('password is wrong!');
    }

    
})
// ✅ Get Specific Request by Request ID
// router.get('/:userId/:requestId', async (req, res) => {
//     try {
//         const { userId, requestId } = req.params;

//         console.log("Received User ID:", userId);
//         console.log("Received Request ID:", requestId);

//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const request = user.requests.find(req => req.id === requestId);
//         if (!request) return res.status(404).json({ message: 'Request not found' });

//         res.json(request);
//     } catch (error) {
//         console.error("Error fetching request:", error);
//         res.status(500).json({ message: error.message });
//     }
// });




router.get('/:requestId', async (req, res) => {
    try {
        const requestId = req.params.requestId;
        console.log("Request ID:", requestId);

        // Find the user containing the request
        const user = await User.findOne({ "requests.id": requestId });
        console.log("User Found:", user);

        if (!user) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Extract the specific request from the user's requests array
        const foundRequest = user.requests.find(request => request.id === requestId);
        console.log("Found Request:", foundRequest);

        if (!foundRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json(foundRequest);
    } catch (error) {
        console.error("Error fetching request:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



router.post('/register', async (req,res)=>{
    console.log(req,"======")
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})


router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        
        const options = {
            amount: 100, // Razorpay accepts paise (multiply by 100)
            currency: currency || "INR",
            receipt: shortid.generate(),
        };

        const order = await razorpay.orders.create(options);
    
        res.status(200).send({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).send({ success: false, message: 'Failed to create order' });
    }
});
const fetch = require('node-fetch');

router.post('/save-payment', async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    productId,
    userId,
    amount
  } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !userId || !productId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  

  try {
    const auth = Buffer.from(`rzp_test_Zr4AoaaUCDwWjy:fECCwYuUdur6HdahuurRr7Nm`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });

    const paymentDetails = await response.json();
  

    const payment = new Payment({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      productId,
      userId,
      payment_mode: paymentDetails.method,
      tax: paymentDetails.tax || 0,
      amount: amount
    });

    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Payment saved successfully',
    });

  } catch (err) {
    console.error('Error saving payment details:', err);
    return res.status(500).json({ success: false, message: 'Server error saving payment' });
  }
});



module.exports =router;
