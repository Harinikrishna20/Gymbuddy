const GymClass = require('../models/GymClass');
const Booking = require('../models/Booking');

const getAllClasses = async (req, res) => {
  try {
    const classes = await GymClass.find().sort({ date: 1, startTime: 1 });

    const classesWithAvailability = await Promise.all(
      classes.map(async (gymClass) => {
        const bookingCount = await Booking.countDocuments({
          gymClass: gymClass._id,
          bookingStatus: 'confirmed',
        });

        return {
          ...gymClass.toObject(),
          availableSeats: Math.max(gymClass.capacity - bookingCount, 0),
          bookedSeats: bookingCount,
        };
      }),
    );

    res.json({
      success: true,
      data: classesWithAvailability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch classes',
    });
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

    const bookingCount = await Booking.countDocuments({
      gymClass: gymClass._id,
      bookingStatus: 'confirmed',
    });

    res.json({
      success: true,
      data: {
        ...gymClass.toObject(),
        bookedSeats: bookingCount,
        availableSeats: Math.max(gymClass.capacity - bookingCount, 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch class',
    });
  }
};

const createClass = async (req, res) => {
  try {
    const { title, description, category, trainer, date, startTime, endTime, location, capacity } = req.body;

    if (!title || !description || !category || !trainer || !date || !startTime || !endTime || !location || !capacity) {
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
      trainer,
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

    const { title, description, category, trainer, date, startTime, endTime, location, capacity } = req.body;

    if (capacity !== undefined && Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be at least 1',
      });
    }

    const updatedFields = {
      title: title ?? gymClass.title,
      description: description ?? gymClass.description,
      category: category ?? gymClass.category,
      trainer: trainer ?? gymClass.trainer,
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
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
