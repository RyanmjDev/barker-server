const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
//const authMiddleware = require('../middleware/authMiddleware');

router.get('/',  getNotifications);
router.patch('/:id/read',  markAsRead);
//authMiddleware

module.exports = router;
