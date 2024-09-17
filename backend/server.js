require('dotenv').config(); // Ensure environment variables are loaded

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes'); // Ensure this path is correct
const { authenticateToken } = require('./middleware/authenticateToken');
const { validateRegister, validateLogin } = require('./middleware/validation'); // Import validation middleware

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware setup
const app = express();
app.use(cors({ origin: 'http://localhost:3001' })); // Adjust origin for production
app.use(bodyParser.json());
app.use(express.json()); // For parsing application/json

// Use the userRoutes for all '/api/users' routes
app.use('/api/users', userRoutes);

// Authentication Routes
app.post('/api/auth/register', validateRegister, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/auth/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Friend Request Route
app.post('/api/friend-request', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.body;
        const { userId } = req.user; // Get userId from authenticated token
        if (!friendId) {
            return res.status(400).json({ error: 'Friend ID is required' });
        }
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);
        if (!user || !friend) {
            return res.status(404).json({ error: 'User or friend not found' });
        }
        if (!user.friendRequests.includes(friendId)) {
            user.friendRequests.push(friendId);
            await user.save();
            res.status(200).json({ message: 'Friend request sent successfully' });
        } else {
            res.status(400).json({ error: 'Friend request already sent' });
        }
    } catch (err) {
        console.error('Friend request error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Recommendation Route (New addition)
app.get('/api/users/recommendations', authenticateToken, (req, res) => {
    res.json({ recommendations: ['Item 1', 'Item 2', 'Item 3'] });
});

// Protected Route Example
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Protected route accessed' });
});

// Public Route Example
app.get('/api/public', (req, res) => {
    res.json({ message: 'Public route accessed' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
