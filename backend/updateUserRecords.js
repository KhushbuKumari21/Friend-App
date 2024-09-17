const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed

mongoose.connect('mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function updateUserRecords() {
    try {
        // Find users with an email field
        const users = await User.find({ email: { $exists: true } });

        for (const user of users) {
            const hashedPassword = user.password; // Assuming the password is already hashed
            let username = user.email; // Using email as username

            // Ensure the username is unique
            let existingUser = await User.findOne({ username: username });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                // If username already exists and it's not the current user, make it unique
                username = `${username}_${user._id.toString().slice(-4)}`;
            }

            // Update the user's record with the new username
            await User.updateOne(
                { _id: user._id },
                { $set: { username: username, password: hashedPassword } }
            );
        }

        console.log('User records updated successfully.');
    } catch (err) {
        console.error('Error updating user records:', err);
    } finally {
        mongoose.disconnect();
    }
}

updateUserRecords();
