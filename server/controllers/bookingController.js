const Booking = require('../models/Booking');
const GymClass = require('../models/GymClass');

const createBooking = async (req, res) => {
  try {
    const { gymClassId } = req.body;

    if (!gymClassId) {
      return res.status(400).json({
        success: false,
        message: 'gymClassId is required',
      });
    }

    const gymClass = await GymClass.findById(gymClassId);
    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const activeBooking = await Booking.findOne({
      user: req.user._id,
      gymClass: gymClass._id,
      bookingStatus: 'confirmed',
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this class',
      });
    }

    const bookingCount = await Booking.countDocuments({
      gymClass: gymClass._id,
      bookingStatus: 'confirmed',
    });

    if (bookingCount >= gymClass.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Class is fully booked',
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      gymClass: gymClass._id,
      bookingStatus: 'confirmed',
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to create booking',
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate({
        path: 'gymClass',
        select: 'title trainer date startTime endTime location category description',
      })
      .sort({ createdAt: -1 });

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
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot cancel someone else\'s booking',
      });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to cancel booking',
    });
  }
};

const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'user', select: 'name email' })
      .populate({
        path: 'gymClass',
        select: 'title trainer date startTime endTime',
      })
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      memberName: booking.user?.name || 'Unknown',
      email: booking.user?.email || 'Unknown',
      className: booking.gymClass?.title || 'Class removed',
      trainer: booking.gymClass?.trainer || 'N/A',
      date: booking.gymClass?.date || 'N/A',
      time: booking.gymClass ? `${booking.gymClass.startTime} - ${booking.gymClass.endTime}` : 'N/A',
      status: booking.bookingStatus,
      bookingDate: booking.createdAt,
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
