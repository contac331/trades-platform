const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trades');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3001'
  ],
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Connected to SQLite database');
    
    // Import models and set up associations
    const User = require('./models/User');
    const Service = require('./models/Service');
    const Booking = require('./models/Booking');
    const Review = require('./models/Review');
    
    // Set up associations
    User.hasMany(Service, { foreignKey: 'tradespersonId' });
    Service.belongsTo(User, { foreignKey: 'tradespersonId' });
    
    User.hasMany(Booking, { foreignKey: 'customer', as: 'CustomerBookings' });
    User.hasMany(Booking, { foreignKey: 'tradesperson', as: 'TradespersonBookings' });
    Service.hasMany(Booking, { foreignKey: 'service' });
    Booking.belongsTo(User, { foreignKey: 'customer', as: 'Customer' });
    Booking.belongsTo(User, { foreignKey: 'tradesperson', as: 'Tradesperson' });
    Booking.belongsTo(Service, { foreignKey: 'service' });
    
    User.hasMany(Review, { foreignKey: 'customer' });
    Service.hasMany(Review, { foreignKey: 'service' });
    Booking.hasOne(Review, { foreignKey: 'booking' });
    Review.belongsTo(User, { foreignKey: 'customer', as: 'Customer' });
    Review.belongsTo(Service, { foreignKey: 'service' });
    Review.belongsTo(Booking, { foreignKey: 'booking' });
    
    // Sync database models
    await sequelize.sync({ force: false }); // Set to true to drop tables on restart
    console.log('Database models synced');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
