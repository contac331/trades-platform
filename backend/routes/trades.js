const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all tradespeople
// @route   GET /api/trades
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = User.find({ role: 'tradesperson' });

    // Search functionality
    if (req.query.search) {
      query = query.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { 'address.city': { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Filter by location
    if (req.query.city) {
      query = query.where({
        'address.city': { $regex: req.query.city, $options: 'i' }
      });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-isVerified -createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments(query.getQuery());

    query = query.skip(startIndex).limit(limit);

    // Populate services
    query = query.populate({
      path: 'services',
      select: 'title category pricing rating isActive',
      match: { isActive: true }
    });

    // Select fields (exclude sensitive info)
    query = query.select('-password -resetPasswordToken -resetPasswordExpire -verificationToken');

    const tradespeople = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: tradespeople.length,
      pagination,
      data: tradespeople
    });
  } catch (error) {
    console.error('Get tradespeople error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single tradesperson
// @route   GET /api/trades/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tradesperson = await User.findOne({
      _id: req.params.id,
      role: 'tradesperson'
    })
      .populate({
        path: 'services',
        match: { isActive: true },
        populate: {
          path: 'reviews',
          select: 'rating comment createdAt',
          populate: {
            path: 'customer',
            select: 'name profileImage'
          }
        }
      })
      .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken');

    if (!tradesperson) {
      return res.status(404).json({
        success: false,
        message: 'Tradesperson not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tradesperson
    });
  } catch (error) {
    console.error('Get tradesperson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get tradesperson statistics
// @route   GET /api/trades/:id/stats
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const Review = require('../models/Review');
    const Service = require('../models/Service');

    const tradespersonId = req.params.id;

    // Get basic stats
    const [services, bookings, reviews] = await Promise.all([
      Service.countDocuments({ tradesperson: tradespersonId, isActive: true }),
      Booking.countDocuments({ tradesperson: tradespersonId, status: 'completed' }),
      Review.countDocuments({ 
        service: { $in: await Service.find({ tradesperson: tradespersonId }).select('_id') }
      })
    ]);

    // Get average rating
    const ratingStats = await Review.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      {
        $match: {
          'serviceInfo.tradesperson': mongoose.Types.ObjectId(tradespersonId)
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalServices: services,
      completedJobs: bookings,
      totalReviews: reviews,
      averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get tradesperson stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
