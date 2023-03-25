const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const generateToken = require("../utils/generateToken");
const parseUserId = require("../utils/parseToken");

router.get('/profile',  async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const userId = parseUserId(token);
    if (userId) {
    const {username} = await User.findById(userId);
    res.json(username);
    }

  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = generateToken(req.user);
  res.json({ message: 'Logged in successfully', token: token });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
