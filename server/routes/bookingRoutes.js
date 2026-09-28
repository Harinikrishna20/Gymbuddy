const express = require('express');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { learnerOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, learnerOnly, createBooking);
router.get('/my', protect, learnerOnly, getMyBookings);
router.delete('/:id', protect, learnerOnly, cancelBooking);

module.exports = router;
