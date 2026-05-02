const express = require('express');
const router = express.Router();
const {
  getMyTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/task.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// IMPORTANT: /mine MUST be defined BEFORE /:id to avoid route conflict
router.get('/mine', verifyToken, getMyTasks);
router.get('/:id', verifyToken, getTaskById);
router.put('/:id', verifyToken, requireRole('admin'), updateTask);
router.patch('/:id/status', verifyToken, updateTaskStatus);
router.delete('/:id', verifyToken, requireRole('admin'), deleteTask);

module.exports = router;
