const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure the path is correct
const { authenticateToken } = require('../middleware/authenticateToken');



// Middleware to check authentication
router.use(authenticateToken); // Apply auth middleware to all routes
  // Apply auth middleware to all routes

// Search users by username
router.get('/search', async (req, res) => {
    const { username } = req.query;
    try {
        if (typeof username !== 'string' || !username.trim()) {
            return res.status(400).json({ error: 'Invalid username' });
        }

        const users = await User.find({ username: { $regex: username, $options: 'i' } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send friend request
router.post('/send-request/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Get the current user from request (authMiddleware should set req.user)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Current user not found' });
        }

        // Check if the friend request has already been sent
        if (!Array.isArray(user.friendRequests) || user.friendRequests.includes(userId)) {
            return res.status(400).json({ error: 'Request already sent' });
        }

        // Add friend request
        user.friendRequests.push(userId);
        await user.save();

        res.status(200).json({ success: 'Friend request sent' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Server error while sending friend request' });
    }
});

// Accept friend request
router.post('/accept-request/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);
        const friend = await User.findById(id);

        if (!user || !friend) {
            return res.status(404).json({ error: 'User or friend not found' });
        }

        if (user.friendRequests.includes(id)) {
            user.friends.push(id);
            friend.friends.push(user._id);
            user.friendRequests.pull(id);
            await user.save();
            await friend.save();
            res.json({ success: 'Friend request accepted' });
        } else {
            res.status(400).json({ error: 'No friend request found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error while accepting friend request' });
    }
});

// Reject friend request
router.post('/reject-request/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.friendRequests.pull(id);
        await user.save();
        res.json({ success: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Server error while rejecting friend request' });
    }
});

// Get friend recommendations (mock data, replace with logic)
router.get('/recommendations', authenticateToken, (req, res) => {
    // Logic to fetch recommendations
    res.json({ message: 'Recommendations data' }); // Example response
});

// Get user's friends list
router.get('/friends', async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from authentication middleware
        const user = await User.findById(userId).populate('friends'); // Populate friends if needed

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.friends); // Send the list of friends
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
