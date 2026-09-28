const express = require('express');
const { getTrainerDashboard } = require('../controllers/trainerController');
const { protect } = require('../middleware/authMiddleware');
const { trainerOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard', protect, trainerOnly, getTrainerDashboard);

module.exports = router;