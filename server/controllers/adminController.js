const Booking = require('../models/Booking');
const User = require('../models/User');
const GymClass = require('../models/GymClass');

const getAdminDashboard = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalClasses = await GymClass.countDocuments();
    const totalBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });

    const upcomingClasses = await GymClass.countDocuments({
      date: { $gte: new Date().toISOString().slice(0, 10) },
    });

    const recentBookings = await Booking.find({ bookingStatus: 'confirmed' })
      .populate({ path: 'user', select: 'name email' })
      .populate({ path: 'gymClass', select: 'title trainer date startTime endTime' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalMembers,
        totalClasses,
        totalBookings,
        upcomingClasses,
        recentBookings: recentBookings.map((booking) => ({
          id: booking._id,
          memberName: booking.user?.name || 'Unknown',
          memberEmail: booking.user?.email || 'Unknown',
          className: booking.gymClass?.title || 'Class removed',
          trainer: booking.gymClass?.trainer || 'N/A',
          date: booking.gymClass?.date || 'N/A',
          time: booking.gymClass ? `${booking.gymClass.startTime} - ${booking.gymClass.endTime}` : 'N/A',
          status: booking.bookingStatus,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch dashboard stats',
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
  getAdminDashboard,
  getAdminBookings,
};
