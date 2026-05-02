const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, requireRole('admin'), getAllUsers);
router.patch('/:id/role', verifyToken, requireRole('admin'), updateUserRole);

module.exports = router;
