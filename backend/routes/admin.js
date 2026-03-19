const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin middleware - only allow admin users
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const userCount = await User.count();
    const serviceCount = await Service.count();
    const activeServiceCount = await Service.count({ where: { isActive: true } });
    const reviewCount = await Review.count();
    const bookingCount = await Booking.count();
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.count({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: userCount,
          recent: recentUsers
        },
        services: {
          total: serviceCount,
          active: activeServiceCount,
          inactive: serviceCount - activeServiceCount
        },
        reviews: reviewCount,
        bookings: bookingCount
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      count,
      pagination: {
        page,
        pages: Math.ceil(count / limit),
        limit,
        total: count
      },
      data: users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, adminOnly, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['customer', 'tradesperson', 'admin']),
  body('isVerified').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await user.update(req.body);
    
    // Remove password from response
    const { password, ...userData } = updatedUser.toJSON();

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all services
// @route   GET /api/admin/services
// @access  Private/Admin
router.get('/services', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: services } = await Service.findAndCountAll({
      include: [{
        model: User,
        attributes: ['name', 'email', 'role']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      count,
      pagination: {
        page,
        pages: Math.ceil(count / limit),
        limit,
        total: count
      },
      data: services
    });
  } catch (error) {
    console.error('Admin services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update service
// @route   PUT /api/admin/services/:id
// @access  Private/Admin
router.put('/services/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const updatedService = await service.update(req.body);

    res.json({
      success: true,
      data: updatedService
    });
  } catch (error) {
    console.error('Admin update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/admin/services/:id
// @access  Private/Admin
router.delete('/services/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await service.destroy();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
