const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ user: 1, gymClass: 1, bookingStatus: 1 }, { unique: false });

module.exports = mongoose.model('Booking', bookingSchema, 'bookings');
