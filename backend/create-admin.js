const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/User');

async function createAdmin() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Admin ID:', existingAdmin.id);
      console.log('Admin role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('ID:', admin.id);
    
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    process.exit();
  }
}

createAdmin();
