const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const cors = require('cors');

// Apply CORS to auth routes strictly
router.use(cors({
    origin: [
        "https://finance-tracker-two-mocha.vercel.app",
        "http://localhost:5173"
    ],
    credentials: true
}));

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'All fields are required' });

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const user = await User.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/auth/me
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ _id: user._id, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/auth/profile — update name and/or email
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }
        if (name) user.name = name;

        await user.save();
        res.json({ _id: user._id, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;
        console.log("➡️ Google Login Attempt :: Checking Client ID in Env:", process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "...");

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log("✅ Google Token Verified :: User:", payload.email);

        const { sub: googleId, email, name } = payload;
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            console.log("Found existing user:", user.email);
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            console.log("Creating new Google user:", email);
            user = await User.create({ name, email, googleId });
        }

        const token = generateToken(user._id);
        res.json({ _id: user._id, name: user.name, email: user.email, token });
    } catch (err) {
        console.error("❌ Google Login Failed Error Detail:", {
            message: err.message,
            stack: err.stack?.substring(0, 150),
            clientIdProvided: process.env.GOOGLE_CLIENT_ID?.substring(0, 5) + "..."
        });
        res.status(500).json({ message: 'Google authentication failed internally: ' + err.message });
    }
});

module.exports = router;
