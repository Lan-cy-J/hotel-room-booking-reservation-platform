const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorMiddleware = require('./middleware/error.middleware');
const apiRoutes = require('./routes');
const ApiError = require('./utils/apiError');

const app = express();

// Security & Utility Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', apiRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to P03 — Hotel Room Booking & Reservation Platform API',
    documentation: '/api/health',
    version: '1.0.0'
  });
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot find endpoint ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
