const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: 1, msg: 'Rating must be at least 1' },
      max: { args: 5, msg: 'Rating cannot exceed 5' },
      notEmpty: { msg: 'Rating is required' }
    }
  },
  comment: {
    type: DataTypes.STRING(500),
    validate: {
      len: { args: [0, 500], msg: 'Comment cannot be more than 500 characters' }
    }
  },
  response: {
    type: DataTypes.JSON,
    defaultValue: {
      message: null,
      respondedAt: null
    }
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['booking']
    },
    {
      fields: ['service', 'rating']
    }
  ]
});

// Define associations
Review.associate = function(models) {
  Review.belongsTo(models.User, {
    foreignKey: 'customer',
    as: 'Customer'
  });
  Review.belongsTo(models.Service, {
    foreignKey: 'service',
    as: 'Service'
  });
  Review.belongsTo(models.Booking, {
    foreignKey: 'booking',
    as: 'Booking'
  });
};

module.exports = Review;
