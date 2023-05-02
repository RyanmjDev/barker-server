const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getNotifications, markAllAsRead } = require('../controllers/notificationController');


router.get('/', passport.authenticate('jwt', { session: false }), getNotifications);
router.post("/readAll", passport.authenticate('jwt', { session: false }), markAllAsRead);

module.exports = router;
