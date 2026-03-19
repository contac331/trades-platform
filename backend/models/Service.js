const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
      len: { args: [1, 100], msg: 'Title cannot be more than 100 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
      len: { args: [1, 1000], msg: 'Description cannot be more than 1000 characters' }
    }
  },
  category: {
    type: DataTypes.ENUM('plumbing', 'electrical', 'carpentry', 'painting', 'cleaning', 'landscaping', 'automotive', 'technology', 'other'),
    allowNull: false
  },
  pricing: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidPricing(value) {
        if (!value || !value.type) {
          throw new Error('Pricing type is required');
        }
        if (value.type === 'fixed' && (!value.amount || value.amount <= 0)) {
          throw new Error('Fixed pricing requires a positive amount');
        }
        if (value.type === 'hourly' && (!value.amount || value.amount <= 0)) {
          throw new Error('Hourly pricing requires a positive rate');
        }
      }
    }
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  availability: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  serviceArea: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tradespersonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'services',
  timestamps: true
});

// Define associations
Service.associate = function(models) {
  Service.belongsTo(models.User, {
    foreignKey: 'tradespersonId',
    as: 'User'
  });
};

module.exports = Service;
