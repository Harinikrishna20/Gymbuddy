const express = require('express');
const {
	getAdminDashboard,
	getAdminBookings,
	getAdminUsers,
	updateAdminUserRole,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getAdminDashboard);
router.get('/bookings', protect, adminOnly, getAdminBookings);
router.get('/users', protect, adminOnly, getAdminUsers);
router.patch('/users/:id/role', protect, adminOnly, updateAdminUserRole);

module.exports = router;
