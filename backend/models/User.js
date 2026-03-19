const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
      len: { args: [1, 50], msg: 'Name cannot be more than 50 characters' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email' },
      notEmpty: { msg: 'Email is required' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' }
    }
  },
  role: {
    type: DataTypes.ENUM('customer', 'tradesperson', 'admin'),
    defaultValue: 'customer'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isValidPhone(value) {
        if (this.role === 'tradesperson' && !value) {
          throw new Error('Phone is required for tradespeople');
        }
        if (value && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(value)) {
          throw new Error('Please provide a valid phone number');
        }
      }
    }
  },
  address: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  profileImage: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Define associations
User.associate = function(models) {
  User.hasMany(models.Service, {
    foreignKey: 'tradesperson',
    as: 'services'
  });
};

module.exports = User;
