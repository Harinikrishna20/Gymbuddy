const GymClass = require('../models/GymClass');
const Booking = require('../models/Booking');
const User = require('../models/User');

const withAvailability = async (classes) => {
  const classIds = classes.map((gymClass) => gymClass._id);
  const counts = await Booking.aggregate([
    { $match: { gymClass: { $in: classIds }, bookingStatus: 'confirmed' } },
    { $group: { _id: '$gymClass', bookingCount: { $sum: 1 } } },
  ]);
  const countByClass = new Map(counts.map((item) => [item._id.toString(), item.bookingCount]));

  return classes.map((gymClass) => {
    const classData = gymClass.toObject ? gymClass.toObject() : gymClass;
    const bookedSeats = countByClass.get(classData._id.toString()) || 0;

    return {
      ...classData,
      bookedSeats,
      availableSeats: Math.max(classData.capacity - bookedSeats, 0),
    };
  });
};

const canManageClass = (req, gymClass) => req.user.role === 'admin'
  || gymClass.trainerId?.toString() === req.user._id.toString();

const getAllClasses = async (req, res) => {
  try {
    const classes = await GymClass.find().sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      data: await withAvailability(classes),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch classes',
    });
  }
};

const getMyClasses = async (req, res) => {
  try {
    const classes = await GymClass.find({ trainerId: req.user._id }).sort({ date: 1, startTime: 1 });

    res.json({ success: true, data: await withAvailability(classes) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch your classes' });
  }
};

const getClassById = async (req, res) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const [classWithAvailability] = await withAvailability([gymClass]);
    res.json({
      success: true,
      data: classWithAvailability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch class',
    });
  }
};

const getClassLearners = async (req, res) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);

    if (!gymClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (!canManageClass(req, gymClass)) {
      return res.status(403).json({ success: false, message: 'You can only view learners in your own classes' });
    }

    const bookings = await Booking.find({ gymClass: gymClass._id, bookingStatus: 'confirmed' })
      .populate({ path: 'learner', select: 'name email' })
      .populate({ path: 'user', select: 'name email' })
      .sort({ bookedAt: 1 });

    res.json({
      success: true,
      data: bookings.map((booking) => {
        const learner = booking.learner || booking.user;
        return {
          bookingId: booking._id,
          id: learner?._id,
          name: learner?.name || 'Unavailable account',
          email: learner?.email || 'Unavailable',
          bookedAt: booking.bookedAt || booking.createdAt,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch learners for this class' });
  }
};

const createClass = async (req, res) => {
  try {
    const { title, description, category, trainer, trainerId, date, startTime, endTime, location, capacity } = req.body;
    let assignedTrainerId = req.user.role === 'trainer' ? req.user._id : trainerId || null;
    let trainerName = req.user.role === 'trainer' ? req.user.name : trainer;

    if (assignedTrainerId && req.user.role === 'admin') {
      const assignedTrainer = await User.findOne({ _id: assignedTrainerId, role: 'trainer' });
      if (!assignedTrainer) {
        return res.status(400).json({ success: false, message: 'Selected account is not a trainer' });
      }
      trainerName = assignedTrainer.name;
    }

    if (!title || !description || !category || !trainerName || !date || !startTime || !endTime || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'All class fields are required',
      });
    }

    if (Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be at least 1',
      });
    }

    const gymClass = await GymClass.create({
      title,
      description,
      category,
      trainer: trainerName,
      trainerId: assignedTrainerId,
      date,
      startTime,
      endTime,
      location,
      capacity: Number(capacity),
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: gymClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to create class',
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    if (!canManageClass(req, gymClass)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own classes' });
    }

    const { title, description, category, trainer, date, startTime, endTime, location, capacity } = req.body;

    if (capacity !== undefined && Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be at least 1',
      });
    }

    const currentBookings = await Booking.countDocuments({ gymClass: gymClass._id, bookingStatus: 'confirmed' });
    if (capacity !== undefined && Number(capacity) < currentBookings) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be lower than the ${currentBookings} confirmed bookings`,
      });
    }

    const updatedFields = {
      title: title ?? gymClass.title,
      description: description ?? gymClass.description,
      category: category ?? gymClass.category,
      trainer: req.user.role === 'trainer' ? req.user.name : trainer ?? gymClass.trainer,
      date: date ?? gymClass.date,
      startTime: startTime ?? gymClass.startTime,
      endTime: endTime ?? gymClass.endTime,
      location: location ?? gymClass.location,
      capacity: capacity !== undefined ? Number(capacity) : gymClass.capacity,
    };

    const updatedClass = await GymClass.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to update class',
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    if (!canManageClass(req, gymClass)) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own classes' });
    }

    await Booking.deleteMany({ gymClass: gymClass._id });
    await GymClass.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to delete class',
    });
  }
};

module.exports = {
  getAllClasses,
  getMyClasses,
  getClassById,
  getClassLearners,
  createClass,
  updateClass,
  deleteClass,
};
