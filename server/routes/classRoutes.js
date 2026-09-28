const express = require('express');
const {
  getAllClasses,
  getMyClasses,
  getClassById,
  getClassLearners,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');
const { trainerOnly, trainerOrAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getAllClasses);
router.get('/mine', protect, trainerOnly, getMyClasses);
router.get('/:id/learners', protect, trainerOrAdmin, getClassLearners);
router.get('/:id', getClassById);
router.post('/', protect, trainerOrAdmin, createClass);
router.put('/:id', protect, trainerOrAdmin, updateClass);
router.delete('/:id', protect, trainerOrAdmin, deleteClass);

module.exports = router;
