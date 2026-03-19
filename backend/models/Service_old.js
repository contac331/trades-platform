const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'plumbing',
      'electrical',
      'carpentry',
      'painting',
      'landscaping',
      'hvac',
      'roofing',
      'flooring',
      'cleaning',
      'handyman',
      'other'
    ]
  },
  tradesperson: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  pricing: {
    type: {
      type: String,
      enum: ['hourly', 'fixed', 'quote'],
      required: true
    },
    amount: {
      type: Number,
      required: function() {
        return this.pricing && this.pricing.type !== 'quote';
      },
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    hours: {
      start: String, // Format: "09:00"
      end: String    // Format: "17:00"
    }
  },
  serviceArea: {
    radius: {
      type: Number,
      default: 25 // miles
    },
    zipCodes: [String]
  },
  images: [{
    url: String,
    alt: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service',
  justOne: false
});

// Index for search functionality
serviceSchema.index({
  title: 'text',
  description: 'text',
  category: 1
});

// Index for location-based queries
serviceSchema.index({ 'serviceArea.zipCodes': 1 });

module.exports = mongoose.model('Service', serviceSchema);
