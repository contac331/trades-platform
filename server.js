const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Ensure JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'trades-platform-secret-key-' + Date.now();
  console.log('JWT_SECRET not found, using generated secret');
} else {
  console.log('JWT_SECRET loaded from environment');
}

const app = express();

// Import database connection
const sequelize = require('./backend/config/database');

// Import models
const User = require('./backend/models/User');
const Service = require('./backend/models/Service');
const Booking = require('./backend/models/Booking');
const Review = require('./backend/models/Review');

// Import routes
const authRoutes = require('./backend/routes/auth');
const serviceRoutes = require('./backend/routes/services');
const adminRoutes = require('./backend/routes/admin');
const uploadRoutes = require('./backend/routes/upload');

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://trades-platform.onrender.com', process.env.FRONTEND_URL, process.env.RENDER_EXTERNAL_URL] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Service creation and photo upload are working properly

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQLite database');
    
    // Define associations
    User.hasMany(Service, { foreignKey: 'tradespersonId' });
    Service.belongsTo(User, { foreignKey: 'tradespersonId' });
    User.hasMany(Review, { foreignKey: 'customer' });
    Service.hasMany(Review, { foreignKey: 'service' });
    Booking.hasOne(Review, { foreignKey: 'booking' });
    Review.belongsTo(User, { foreignKey: 'customer', as: 'Customer' });
    Review.belongsTo(Service, { foreignKey: 'service' });
    Review.belongsTo(Booking, { foreignKey: 'booking' });
    
    await sequelize.sync();
    console.log('Database models synced');
    
    // Create default admin user if it doesn't exist
    try {
      const adminEmail = 'admin@example.com';
      
      // Delete any existing admin user to start fresh
      await User.destroy({ where: { email: adminEmail } });
      console.log('Cleaned up any existing admin user');
      
      // Create fresh admin user with proper password
      const adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123', // Raw password - model will hash it
        role: 'admin',
        isVerified: true
      });
      
      console.log('Fresh admin user created with ID:', adminUser.id);
      
      // Test the password immediately
      const testMatch = await adminUser.matchPassword('admin123');
      console.log('Password test result:', testMatch);
      
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
