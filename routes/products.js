require('dotenv').config();
const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const axios =require('axios');
const fs = require("fs");


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Keep the exact original filename
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});



router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    try {
        // Validate category
        const category = await Category.findById(req.body.category);
         "67791b1988fbde331f4187fe"
        
        if (!category) return res.status(400).send("Invalid Category");

        // Validate file upload
        const file = req.file;
        if (!file) return res.status(400).send("No image in the request");

        // Read and encode image
        const imageBuffer = fs.readFileSync(file.path);
        const imageBase64 = imageBuffer.toString("base64");

        // GitHub Configuration
        const githubRepo = "krishnamounica/easyshop";
        const githubToken = "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";
        console.log(githubToken,"==========githubToken======")
        const githubOwner = "krishnamounica"; // Change this if needed
        const branch = "main"; // Change if using a different branch
        const fileName = `products/${Date.now()}-${file.originalname}`;

        if (!githubToken) {
            return res.status(500).send("GitHub token is missing");
        }

        // Check if file exists to get `sha`
        let sha = null;
        try {
            const existingFile = await axios.get(
                `https://api.github.com/repos/${githubRepo}/contents/${fileName}`,
                {
                    headers: {
                        Authorization: `token ${githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );
            sha = existingFile.data.sha; // Required if updating an existing file
        } catch (err) {
            // File does not exist, continue without `sha`
        }

        // Upload image to GitHub
        const response = await axios.put(
            `https://api.github.com/repos/${githubRepo}/contents/${fileName}`,
            {
                message: `Uploaded ${fileName}`,
                content: imageBase64,
                branch: branch,
                ...(sha ? { sha } : {}), // Include `sha` only if file exists
            },
            {
                headers: {
                    Authorization: `token ${githubToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        // Construct GitHub raw image URL
        const imageUrl = `https://raw.githubusercontent.com/${githubRepo}/${branch}/${fileName}`;

        // Create and save product
        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imageUrl, // GitHub image URL
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        });

        product = await product.save();
        if (!product) return res.status(500).send("The product cannot be created");

        res.send(product);
    } catch (error) {
        console.error("Error uploading to GitHub:", error.response?.data || error);
        res.status(500).send("Failed to upload image to GitHub");
    }
});


// router.put('/:id', uploadOptions.single('image'), async (req, res) => {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//         return res.status(400).send('Invalid Product Id');
//     }
//     const category = await Category.findById(req.body.category);
//     if (!category) return res.status(400).send('Invalid Category');

//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(400).send('Invalid Product!');

//     const file = req.file;
//     let imagepath;

//     if (file) {
//         const fileName = file.filename;
//         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
//         imagepath = `${basePath}${fileName}`;
//     } else {
//         imagepath = product.image;
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//         req.params.id,
//         {
//             name: req.body.name,
//             description: req.body.description,
//             richDescription: req.body.richDescription,
//             image: imagepath,
//             brand: req.body.brand,
//             price: req.body.price,
//             category: req.body.category,
//             countInStock: req.body.countInStock,
//             rating: req.body.rating,
//             numReviews: req.body.numReviews,
//             isFeatured: req.body.isFeatured
//         },
//         { new: true }
//     );

//     if (!updatedProduct) return res.status(500).send('the product cannot be updated!');

//     res.send(updatedProduct);
// });

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'the product is deleted!'
                });
            } else {
                return res.status(404).json({ success: false, message: 'product not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});

module.exports = router;
