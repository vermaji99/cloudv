const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables as early as possible
dotenv.config();

const authRoutes = require('./routes/auth.routes');
const metadataRoutes = require('./routes/metadata.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://cloudv-client.onrender.com',
    'https://cloudv-client-c1eb.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In development, allow localhost and 127.0.0.1 on any port
        const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
        
        if (allowedOrigins.indexOf(origin) !== -1 || isLocal) {
            callback(null, true);
        } else {
            console.log('CORS Blocked Origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(cookieParser());

// Startup check for required environment variables
const requiredEnv = ['SALESFORCE_CLIENT_ID', 'SALESFORCE_CLIENT_SECRET', 'JWT_SECRET'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.error(`FATAL ERROR: ${env} is not defined in .env file`);
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/metadata', metadataRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong on the server'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
