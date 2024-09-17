const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Authorization Header:', authHeader);
    console.log('Token:', token);

    if (!token) {
        console.error('Token is missing');
        return res.status(401).json({ message: 'Token is required' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ message: 'Internal server error' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token expired, please log in again' });
            }
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}



// Export the middleware function
module.exports = { authenticateToken };
