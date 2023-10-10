const Bark = require('../models/bark');
const User = require('mongoose').model('User');
const jwt = require('jsonwebtoken'); 


const barkUtils = require('../utils/barkUtils');

// const notificationService = require('./notificationService');

exports.getAllBarks = async (page, token) => {
  const barks = await Bark.find()
    .sort({ createdAt: -1 })
    .populate('user', 'username displayName')
    .skip((page - 1) * barkUtils.barksPageLimit)
    .limit(barkUtils.barksPageLimit)
    .exec();

  if (token) {
    const userId = barkUtils.getUserIdFromToken(token);
    if (userId) {
      const user = await User.findById(userId);
      return barkUtils.mapBarksWithUserLikes(barks, user);
    }
  }
  return barks;
};