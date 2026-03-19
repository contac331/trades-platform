const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
router.post('/', protect, [
  body('service').notEmpty().withMessage('Service ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime.start').notEmpty().withMessage('Start time is required'),
  body('scheduledTime.end').notEmpty().withMessage('End time is required'),
  body('location.street').notEmpty().withMessage('Street address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.zipCode').notEmpty().withMessage('Zip code is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get the service and verify it exists
    const service = await Service.findById(req.body.service);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Add customer and tradesperson to booking
    req.body.customer = req.user.id;
    req.body.tradesperson = service.tradesperson;

    // Set estimated pricing if not quote-based
    if (service.pricing.type !== 'quote') {
      req.body.pricing = {
        estimated: service.pricing.amount,
        currency: service.pricing.currency
      };
    }

    const booking = await Booking.create(req.body);

    // Populate the booking with related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('tradesperson', 'name email phone')
      .populate('service', 'title category pricing');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'tradesperson') {
      query.tradesperson = req.user.id;
    }

    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Sort
    const sort = req.query.sort || '-createdAt';

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone profileImage')
      .populate('tradesperson', 'name email phone profileImage')
      .populate('service', 'title category pricing')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone profileImage address')
      .populate('tradesperson', 'name email phone profileImage address')
      .populate('service', 'title description category pricing')
      .populate('notes.author', 'name profileImage');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is involved in this booking
    if (
      booking.customer._id.toString() !== req.user.id &&
      booking.tradesperson._id.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Tradesperson or Customer)
router.put('/:id/status', protect, [
  body('status').isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status')
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

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Authorization check
    const isCustomer = booking.customer.toString() === req.user.id;
    const isTradesperson = booking.tradesperson.toString() === req.user.id;

    if (!isCustomer && !isTradesperson) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Status update rules
    const { status } = req.body;
    const currentStatus = booking.status;

    // Define allowed status transitions
    const allowedTransitions = {
      customer: {
        pending: ['cancelled'],
        confirmed: ['cancelled'],
        'in-progress': [],
        completed: [],
        cancelled: []
      },
      tradesperson: {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['in-progress', 'cancelled'],
        'in-progress': ['completed'],
        completed: [],
        cancelled: []
      }
    };

    const userRole = isCustomer ? 'customer' : 'tradesperson';
    const allowedStatuses = allowedTransitions[userRole][currentStatus] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('tradesperson', 'name email phone')
      .populate('service', 'title category');

    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add note to booking
// @route   POST /api/bookings/:id/notes
// @access  Private (Involved parties only)
router.post('/:id/notes', protect, [
  body('message').notEmpty().withMessage('Message is required')
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

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (
      booking.customer.toString() !== req.user.id &&
      booking.tradesperson.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to add notes to this booking'
      });
    }

    booking.notes.push({
      author: req.user.id,
      message: req.body.message
    });

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('notes.author', 'name profileImage');

    res.status(200).json({
      success: true,
      data: updatedBooking.notes
    });
  } catch (error) {
    console.error('Add booking note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
