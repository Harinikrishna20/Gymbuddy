const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const GymClass = require('../models/GymClass');

const createBooking = async (req, res) => {
  const { gymClassId } = req.body;

  if (!gymClassId) {
    return res.status(400).json({ success: false, message: 'gymClassId is required' });
  }

  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      const gymClass = await GymClass.findById(gymClassId).session(session);
      if (!gymClass) {
        const error = new Error('Class not found');
        error.statusCode = 404;
        throw error;
      }

      const activeBooking = await Booking.findOne({
        gymClass: gymClass._id,
        bookingStatus: 'confirmed',
        $or: [{ learner: req.user._id }, { user: req.user._id }],
      }).session(session);

      if (activeBooking) {
        const error = new Error('You have already booked this class');
        error.statusCode = 409;
        throw error;
      }

      const bookingCount = await Booking.countDocuments({
        gymClass: gymClass._id,
        bookingStatus: 'confirmed',
      }).session(session);

      if (bookingCount >= gymClass.capacity) {
        const error = new Error('Class is fully booked');
        error.statusCode = 409;
        throw error;
      }

      await GymClass.updateOne({ _id: gymClass._id }, { $inc: { bookingRevision: 1 } }, { session });
      [booking] = await Booking.create([{
        learner: req.user._id,
        user: req.user._id,
        gymClass: gymClass._id,
        bookingStatus: 'confirmed',
        bookedAt: new Date(),
      }], { session });
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    res.status(error.statusCode || (error.code === 11000 ? 409 : 500)).json({
      success: false,
      message: error.statusCode || error.code === 11000 ? error.message : 'Unable to create booking',
    });
  } finally {
    await session.endSession();
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ $or: [{ learner: req.user._id }, { user: req.user._id }] })
      .populate({
        path: 'gymClass',
        select: 'title trainer date startTime endTime location category description capacity trainerId',
      })
      .sort({ bookedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch your bookings',
    });
  }
};

const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      booking = await Booking.findOne({
        _id: req.params.id,
        $or: [{ learner: req.user._id }, { user: req.user._id }],
      }).session(session);

      if (!booking) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
      }

      if (booking.bookingStatus === 'confirmed') {
        booking.bookingStatus = 'cancelled';
        await booking.save({ session });
        await GymClass.updateOne(
          { _id: booking.gymClass },
          { $inc: { bookingRevision: 1 } },
          { session },
        );
      }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Unable to cancel booking',
    });
  } finally {
    await session.endSession();
  }
};

const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'learner', select: 'name email' })
      .populate({ path: 'user', select: 'name email' })
      .populate({
        path: 'gymClass',
        select: 'title trainer date startTime endTime',
      })
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      learnerName: booking.learner?.name || booking.user?.name || 'Unavailable account',
      email: booking.learner?.email || booking.user?.email || 'Unavailable',
      className: booking.gymClass?.title || 'Class removed',
      trainer: booking.gymClass?.trainer || 'N/A',
      date: booking.gymClass?.date || 'N/A',
      time: booking.gymClass ? `${booking.gymClass.startTime} - ${booking.gymClass.endTime}` : 'N/A',
      status: booking.bookingStatus,
      bookedAt: booking.bookedAt || booking.createdAt,
    }));

    res.json({
      success: true,
      data: formattedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch admin bookings',
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAdminBookings,
};
