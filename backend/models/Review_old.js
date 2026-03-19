const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  response: {
    message: {
      type: String,
      maxlength: [300, 'Response cannot be more than 300 characters']
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Ensure one review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

// Index for service reviews
reviewSchema.index({ service: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
