const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getDashboard);

module.exports = router;
