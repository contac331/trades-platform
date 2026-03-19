const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  tradesperson: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    start: {
      type: String,
      required: [true, 'Start time is required']
    },
    end: {
      type: String,
      required: [true, 'End time is required']
    }
  },
  location: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    }
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  pricing: {
    estimated: {
      type: Number,
      required: function() {
        return this.service && this.service.pricing.type !== 'quote';
      }
    },
    final: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'check', 'online'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    transactionId: String
  },
  notes: [{
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Note cannot be more than 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    url: String,
    description: String,
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ tradesperson: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
