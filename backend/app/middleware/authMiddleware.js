const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check if the authorization header exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the decoded object
            req.user = decoded;
            
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };