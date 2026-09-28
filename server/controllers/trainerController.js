const Booking = require('../models/Booking');
const GymClass = require('../models/GymClass');

const getTrainerDashboard = async (req, res) => {
  try {
    const classes = await GymClass.find({ trainerId: req.user._id }).select('_id date');
    const classIds = classes.map((gymClass) => gymClass._id);
    const [totalBookings, learnerCounts] = await Promise.all([
      Booking.countDocuments({ gymClass: { $in: classIds }, bookingStatus: 'confirmed' }),
      Booking.aggregate([
        { $match: { gymClass: { $in: classIds }, bookingStatus: 'confirmed' } },
        { $group: { _id: { $ifNull: ['$learner', '$user'] } } },
        { $match: { _id: { $ne: null } } },
        { $count: 'total' },
      ]),
    ]);
    const today = new Date().toISOString().slice(0, 10);

    res.json({
      success: true,
      data: {
        totalClasses: classes.length,
        totalLearners: learnerCounts[0]?.total || 0,
        totalBookings,
        upcomingClasses: classes.filter((gymClass) => gymClass.date >= today).length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch trainer dashboard' });
  }
};

module.exports = { getTrainerDashboard };