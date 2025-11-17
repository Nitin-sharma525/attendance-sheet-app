const express = require('express');
const router = express.Router();
const performanceController = require('../controller/performance');
const authenticate = require('../middleware/index');

router.get('/performance/:studentId/:classId', authenticate, performanceController.generatePerformanceReport);

module.exports = router;
