const port = 7000;
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const paypal = require('paypal-rest-sdk');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/Ecommerce", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("DB Connected!"))
    .catch((err) => console.log("Error connecting DB: ", err.message));

// Basic route for testing
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });
app.use('/images', express.static('upload/images'));

// Image upload route
app.post("/upload", upload.single('product'), (req, res) => {
    if (req.file) {
        res.json({
            success: 1,
            image_url: `http://localhost:${port}/images/${req.file.filename}`
        });
    } else {
        res.status(400).json({ success: 0, message: "No file uploaded" });
    }
});

// Product schema and model
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});

// Add product
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: 'Failed to add product' });
    }
});

// Get product by ID
app.get('/product/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    try {
        const product = await Product.findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update product
app.post('/updateproduct', async (req, res) => {
    const { id, name, image, category, new_price, old_price } = req.body;

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { id: id },
            { name, image, category, new_price, old_price },
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Remove product
app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, message: 'Failed to remove product' });
    }
});

// Get all products
app.get('/allproducts', async (req, res) => {
    try {
        const products = await Product.find({});
        res.send(products);
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// User schema and model
const Users = mongoose.model('Users', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now },
});

// User registration
app.post('/signup', async (req, res) => {
    try {
        let existingUser = await Users.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ success: false, errors: "Existing user found with the same email address" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let cart = Array.from({ length: 300 }, () => 0);

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            cartData: cart,
        });

        await user.save();
        const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
        res.json({ success: true, token });
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).json({ success: false, message: 'Failed to register user' });
    }
});

// User login
app.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({ email: req.body.email });
        if (user) {
            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (isPasswordValid) {
                const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
                res.json({ success: true, token });
            } else {
                res.json({ success: false, errors: "Wrong Password" });
            }
        } else {
            res.json({ success: false, errors: "Wrong Email Id" });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Middleware to fetch user from token
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using valid token" });
    }

    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "please authenticate using a valid token" });
    }
};

// PayPal configuration
paypal.configure({
    mode: 'sandbox',
    client_id: 'EM8-ku4USujza8oFQ-aA_vFmVaf_7U2y9k_zVT1lUseU5lA2JDJRnWLU5EsleY7-heQf3I9avdtdzKod',
    client_secret: 'EM8-ku4USujza8oFQ-aA_vFmVaf_7U2y9k_zVT1lUseU5lA2JDJRnWLU5EsleY7-heQf3I9avdtdzKod'
});

// Create PayPal payment
app.post('/create-payment', (req, res) => {
    const { amount } = req.body;

    const paymentJson = {
        intent: 'sale',
        payer: { payment_method: 'paypal' },
        redirect_urls: {
            return_url: 'http://localhost:6000/success',
            cancel_url: 'http://localhost:6000/cancel'
        },
        transactions: [{
            amount: {
                currency: 'USD',
                total: amount
            },
            description: 'Your purchase description'
        }]
    };

    paypal.payment.create(paymentJson, (error, payment) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error creating PayPal payment');
        } else {
            const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
            res.json({ approvalUrl: approvalUrl.href });
        }
    });
});

// Start the server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});
