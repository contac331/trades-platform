const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

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
    ? [process.env.FRONTEND_URL, process.env.RENDER_EXTERNAL_URL] 
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
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'build')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQLite database');
    
    await sequelize.sync();
    console.log('Database models synced');
    
    // Create default admin user if it doesn't exist
    try {
      const adminEmail = 'admin@example.com';
      const existingAdmin = await User.findOne({ where: { email: adminEmail } });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await User.create({
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          isVerified: true
        });
        console.log('Default admin user created');
      } else {
        console.log('Admin user already exists');
      }
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
