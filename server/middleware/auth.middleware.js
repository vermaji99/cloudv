const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    // Check for token in cookies or Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    console.log('Protect Middleware - Token found:', token ? 'Yes' : 'No');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Protect Middleware - JWT Verification Error:', err.message);
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};
