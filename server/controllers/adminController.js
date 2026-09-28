const Booking = require('../models/Booking');
const User = require('../models/User');
const GymClass = require('../models/GymClass');

const getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalTrainers, totalLearners, totalClasses, totalBookings, confirmedBookings, upcomingClasses] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'trainer' }),
      User.countDocuments({ role: 'learner' }),
      GymClass.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'confirmed' }),
      GymClass.countDocuments({ date: { $gte: new Date().toISOString().slice(0, 10) } }),
    ]);

    const recentBookings = await Booking.find()
      .populate({ path: 'learner', select: 'name email' })
      .populate({ path: 'user', select: 'name email' })
      .populate({ path: 'gymClass', select: 'title trainer date startTime endTime' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTrainers,
        totalLearners,
        totalClasses,
        totalBookings,
        confirmedBookings,
        upcomingClasses,
        recentBookings: recentBookings.map((booking) => ({
          id: booking._id,
          learnerName: booking.learner?.name || booking.user?.name || 'Unavailable account',
          learnerEmail: booking.learner?.email || booking.user?.email || 'Unavailable',
          className: booking.gymClass?.title || 'Unavailable class',
          trainer: booking.gymClass?.trainer || 'N/A',
          date: booking.gymClass?.date || 'N/A',
          time: booking.gymClass ? `${booking.gymClass.startTime} - ${booking.gymClass.endTime}` : 'N/A',
          status: booking.bookingStatus,
          bookedAt: booking.bookedAt || booking.createdAt,
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
      className: booking.gymClass?.title || 'Unavailable class',
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

const getAdminUsers = async (req, res) => {
  try {
    const { role } = req.query;
    if (role && !['learner', 'trainer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Unsupported user role filter' });
    }

    const users = await User.find(role ? { role } : {})
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch users' });
  }
};

const updateAdminUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['learner', 'trainer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be learner, trainer, or admin' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.equals(req.user._id) && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own admin role' });
    }

    if (user.role === 'admin' && role !== 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
      return res.status(400).json({ success: false, message: 'The last admin cannot be demoted' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to update user role' });
  }
};

module.exports = {
  getAdminDashboard,
  getAdminBookings,
  getAdminUsers,
  updateAdminUserRole,
};
