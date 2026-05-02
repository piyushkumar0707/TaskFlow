const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');
const { createTask, getTasksByProject } = require('../controllers/task.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Project CRUD
router.post('/', verifyToken, requireRole('admin'), createProject);
router.get('/', verifyToken, requireRole('admin'), getAllProjects);
router.get('/mine', verifyToken, getMyProjects);
router.get('/:id', verifyToken, getProjectById);
router.put('/:id', verifyToken, requireRole('admin'), updateProject);
router.delete('/:id', verifyToken, requireRole('admin'), deleteProject);

// Member management
router.post('/:id/members', verifyToken, requireRole('admin'), addMember);
router.delete('/:id/members/:userId', verifyToken, requireRole('admin'), removeMember);

// Project-scoped tasks
router.post('/:id/tasks', verifyToken, requireRole('admin'), createTask);
router.get('/:id/tasks', verifyToken, getTasksByProject);

module.exports = router;
