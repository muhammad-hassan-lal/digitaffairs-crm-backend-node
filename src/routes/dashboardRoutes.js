const express = require('express');
const controller = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');

const router = express.Router();
router.get('/', authMiddleware, checkPermission('dashboard.view'), controller.getDashboard);
module.exports = router;
