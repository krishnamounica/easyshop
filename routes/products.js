const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

// router.post(`/`, uploadOptions.single('image'), async (req, res) => {
//     const category = await Category.findById(req.body.category);
//     if (!category) return res.status(400).send('Invalid Category');

//     const file = req.file;
    

//     const fileName = file.filename;
//     // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
//     const basePath = `https://raw.githubusercontent.com/krishnamounica/easyshop/refs/heads/main/public/uploads/`;

//     imagepath = `${basePath}${fileName}`;
//     console.log(imagepath,"============")
//     console.log(basePath, `${fileName}`)
//     if (!file) return res.status(400).send('No image in the request');
//     let product = new Product({
//         name: req.body.name,
//         description: req.body.description,
//         richDescription: req.body.richDescription,
//         image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
//         brand: req.body.brand,
//         price: req.body.price,
//         category: req.body.category,
//         countInStock: req.body.countInStock,
//         rating: req.body.rating,
//         numReviews: req.body.numReviews,
//         isFeatured: req.body.isFeatured
//     });

//     product = await product.save();

//     if (!product) return res.status(500).send('The product cannot be created');

//     res.send(product);
// });

// ====================
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');

// router.post(`/`, uploadOptions.single('image'), async (req, res) => {
//     const category = await Category.findById(req.body.category);
//     if (!category) return res.status(400).send('Invalid Category');

//     const file = req.file;
//     if (!file) return res.status(400).send('No image in the request');

//     const filePath = file.path;
//     const fileName = file.filename;
    
//     // Convert image to Base64
//     const imageBuffer = fs.readFileSync(filePath);
//     const base64Image = imageBuffer.toString('base64');

//     // GitHub repository details
// 
//     const REPO_OWNER = "krishnamounica";
//     const REPO_NAME = "easyshop";
//     const FILE_PATH = `public/uploads/${fileName}`; // Path inside the repo
//     const COMMIT_MESSAGE = `Uploaded ${fileName}`;

//     try {
//         // Check if the file already exists to get the SHA (needed for updates)
//         let sha = null;
//         try {
//             const existingFile = await axios.get(
//                 `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
//                 {
//                     headers: {
//                         Authorization: `token ${GITHUB_TOKEN}`,
//                         Accept: 'application/vnd.github.v3+json',
//                     },
//                 }
//             );
//             sha = existingFile.data.sha;
//         } catch (error) {
//             if (error.response && error.response.status !== 404) {
//                 return res.status(500).send('Error checking existing file');
//             }
//         }

//         // Upload the image to GitHub
//         const response = await axios.put(
//             `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
//             {
//                 message: COMMIT_MESSAGE,
//                 content: base64Image,
//                 sha: sha || undefined, // Needed only if updating
//             },
//             {
//                 headers: {
//                     Authorization: `token ${GITHUB_TOKEN}`,
//                     Accept: 'application/vnd.github.v3+json',
//                 },
//             }
//         );

//         const githubFileUrl = response.data.content.download_url;

//         // Save product with the GitHub image URL
//         let product = new Product({
//             name: req.body.name,
//             description: req.body.description,
//             richDescription: req.body.richDescription,
//             image: githubFileUrl,
//             brand: req.body.brand,
//             price: req.body.price,
//             category: req.body.category,
//             countInStock: req.body.countInStock,
//             rating: req.body.rating,
//             numReviews: req.body.numReviews,
//             isFeatured: req.body.isFeatured,
//         });

//         product = await product.save();
//         if (!product) return res.status(500).send('The product cannot be created');

//         res.send(product);
//     } catch (error) {
//         console.error("GitHub Upload Error:", error.response?.data || error.message);
//         res.status(500).send('Error uploading image to GitHub');
//     }
// });

// ======================
 // Replace with your actual GitHub token
 const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Use environment variable

const REPO_OWNER = "krishnamounica"; // Your GitHub username
const REPO_NAME = "easyshop"; // Your GitHub repository name
const GITHUB_UPLOAD_PATH = "public/uploads"; // Folder inside GitHub repo

// Function to upload the image to GitHub
async function uploadToGitHub(filePath, fileName) {
    try {
        // ✅ Check if the file exists
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found: " + filePath);
        }

        // ✅ Convert file to Base64
        const fileContent = fs.readFileSync(filePath, { encoding: "base64" });

        // ✅ GitHub API URL for file upload
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_UPLOAD_PATH}/${fileName}`;

        // ✅ Check if file exists on GitHub to get the SHA
        let sha = null;
        try {
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            });
            sha = data.sha; // Needed for updating an existing file
        } catch (err) {
            if (err.response && err.response.status !== 404) {
                throw err;
            }
        }

        // ✅ Upload file to GitHub
        const response = await axios.put(
            url,
            {
                message: "Uploading product image",
                content: fileContent,
                sha, // Required if updating an existing file
            },
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        // ✅ Return the uploaded file's GitHub raw URL
        return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${GITHUB_UPLOAD_PATH}/${fileName}`;
    } catch (error) {
        console.error("❌ GitHub Upload Error:", error.response?.data || error.message);
        throw new Error("Image upload failed");
    }
}

// ✅ Express route to handle product creation with image upload
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
    try {
        // ✅ Validate category
        const category = "67791b1988fbde331f4187fe"
        if (!category) return res.status(400).send("Invalid Category");

        // ✅ Validate image file
        const file = req.file;
        if (!file) return res.status(400).send("No image in the request");

        const filePath = file.path; // Local file path
        const fileName = file.filename; // Image file name

        // ✅ Upload image to GitHub
        const imageUrl = await uploadToGitHub(filePath, fileName);

        // ✅ Save product to database
        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imageUrl, // ✅ Store GitHub image URL in DB
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
        res.status(500).send(error.message);
    }
});
// ====================
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const basePath = `https://github.com/krishnamounica/easyshop/tree/main/public/uploads/`;

        imagepath = `${basePath}${fileName}`;
        console.log(imagepath,"============")
        exit()
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if (!updatedProduct) return res.status(500).send('the product cannot be updated!');

    res.send(updatedProduct);
});

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
