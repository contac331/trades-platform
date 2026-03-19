const express = require('express');
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Build query options
    let queryOptions = { 
      where: { isActive: true },
      include: [{ model: require('../models/User'), attributes: ['name', 'email'] }]
    };

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      queryOptions.where.category = req.query.category;
    }

    // Search functionality (basic text search on title and description)
    if (req.query.search) {
      const { Op } = require('sequelize');
      queryOptions.where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',');
      queryOptions.order = sortBy.map(field => {
        if (field.startsWith('-')) {
          return [field.substring(1), 'DESC'];
        }
        return [field, 'ASC'];
      });
    } else {
      queryOptions.order = [['createdAt', 'DESC']];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    
    queryOptions.limit = limit;
    queryOptions.offset = offset;

    const { count: total, rows: services } = await Service.findAndCountAll(queryOptions);

    // Pagination result
    const pagination = {};
    const endIndex = page * limit;
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (offset > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: services.length,
      pagination,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [{
        model: require('../models/User'),
        attributes: ['name', 'profileImage', 'phone', 'address', 'createdAt']
      }]
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Tradesperson only)
router.post('/', protect, authorize('tradesperson'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('pricing.type').isIn(['hourly', 'fixed', 'quote']).withMessage('Invalid pricing type')
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

    // Add tradesperson to req.body
    req.body.tradespersonId = req.user.id;

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Owner only)
router.put('/:id', protect, authorize('tradesperson'), async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user is service owner
    if (service.tradesperson.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Owner only)
router.delete('/:id', protect, authorize('tradesperson'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user is service owner
    if (service.tradesperson.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get services by tradesperson
// @route   GET /api/services/tradesperson/:id
// @access  Public
router.get('/tradesperson/:id', async (req, res) => {
  try {
    const services = await Service.find({
      tradesperson: req.params.id,
      isActive: true
    }).populate({
      path: 'reviews',
      select: 'rating comment createdAt',
      populate: {
        path: 'customer',
        select: 'name profileImage'
      }
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get tradesperson services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
