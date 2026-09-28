const express = require('express');
const { getAdminDashboard, getAdminBookings } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getAdminDashboard);
router.get('/bookings', protect, adminOnly, getAdminBookings);

module.exports = router;
