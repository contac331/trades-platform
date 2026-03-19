const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Scheduled date is required' }
    }
  },
  scheduledTime: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidTime(value) {
        if (!value || !value.start || !value.end) {
          throw new Error('Start and end times are required');
        }
      }
    }
  },
  location: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidLocation(value) {
        if (!value || !value.street || !value.city || !value.state || !value.zipCode) {
          throw new Error('Complete address is required');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: 0, msg: 'Total cost must be positive' }
    }
  },
  specialRequirements: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  payment: {
    type: DataTypes.JSON,
    defaultValue: {
      method: null,
      status: 'pending',
      transactionId: null
    }
  }
}, {
  tableName: 'bookings',
  timestamps: true
});

// Define associations
Booking.associate = function(models) {
  Booking.belongsTo(models.User, {
    foreignKey: 'customer',
    as: 'Customer'
  });
  Booking.belongsTo(models.User, {
    foreignKey: 'tradesperson', 
    as: 'Tradesperson'
  });
  Booking.belongsTo(models.Service, {
    foreignKey: 'service',
    as: 'Service'
  });
};

module.exports = Booking;
