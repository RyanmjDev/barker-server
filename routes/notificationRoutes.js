const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getNotifications, markAsRead } = require('../controllers/notificationController');


router.get('/', passport.authenticate('jwt', { session: false }), getNotifications);
router.patch('/:id/read', passport.authenticate('jwt', { session: false }), markAsRead);

module.exports = router;
