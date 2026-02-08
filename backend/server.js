const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http'); // Import http
const { Server } = require('socket.io'); // Import Socket.io

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.io (CORS handled inside socket config too)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], // Allow Frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store io instance in app to use in controllers
app.set('io', io);

// Socket connection logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow loading images from different origins (Cloudinary)
}));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP param pollution

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000, // Increased limit to prevent 429 issues during development/testing
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// CORS Config
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
].filter(Boolean); // Filter out undefined if env var is missing
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
    console.log(`Global Log: ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/worker', require('./routes/workerRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Root Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server running on port ${PORT}`)); // Use server.listen instead of app.listen
