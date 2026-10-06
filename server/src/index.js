require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration (limited to specific origin)
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: clientOrigin,
  optionsSuccessStatus: 200
}));

// Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Parse incoming JSON payloads
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
const profileRoutes = require('./routes/profiles');
const conversationRoutes = require('./routes/conversations');

app.use('/api/profiles', profileRoutes);
app.use('/api/conversations', conversationRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Funny AI Server is healthy!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
