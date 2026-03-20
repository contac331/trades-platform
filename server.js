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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint to check users (temporary for debugging)
app.get('/api/test/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test auth endpoint
app.post('/api/test/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Test login attempt:', email);
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        debug: { email, userExists: false }
      });
    }
    
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);
    
    res.json({
      success: isMatch,
      message: isMatch ? 'Login successful' : 'Invalid password',
      debug: { 
        email, 
        userExists: true, 
        passwordMatch: isMatch,
        jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
      }
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      debug: { jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET' }
    });
  }
});

// Quick admin login test (GET endpoint for easy testing)
app.get('/api/test/admin-login', async (req, res) => {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    
    console.log('Testing admin login...');
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({
        success: false,
        message: 'Admin user not found',
        debug: { userExists: false }
      });
    }
    
    const isMatch = await user.matchPassword(password);
    console.log('Admin password match result:', isMatch);
    
    res.json({
      success: isMatch,
      message: isMatch ? 'Admin login successful' : 'Admin password invalid',
      debug: { 
        userExists: true, 
        passwordMatch: isMatch,
        userId: user.id,
        userRole: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
      }
    });
  } catch (error) {
    console.error('Admin login test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

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
