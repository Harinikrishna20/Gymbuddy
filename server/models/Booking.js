const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    gymClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GymClass',
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ user: 1, gymClass: 1, bookingStatus: 1 }, { unique: false });
bookingSchema.index(
  { learner: 1, gymClass: 1 },
  {
    unique: true,
    partialFilterExpression: { learner: { $type: 'objectId' }, bookingStatus: 'confirmed' },
  },
);

module.exports = mongoose.model('Booking', bookingSchema, 'bookings');
