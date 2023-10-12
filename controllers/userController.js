const User = require("../models/User");
const Bark = require ("../models/bark");
const jwt = require('jsonwebtoken');
const Notification = require("../models/notification");

const getUserId = require('../utils/getUserId');
const userService = require('../services/userService');

const {barksPageLimit} = require('../utils/barkUtils')



exports.getUser = async (req, res) => {
  try {
      const userId = getUserId(req.headers.authorization);
      if (userId) {
          const user = await userService.getUserById(userId);
          res.json(user);
      }
  } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Error fetching user" });
  }
};
exports.getProfile = async (req, res) => {
  try {
      const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;
      const profileData = await userService.getProfileByUsername(req.params.username, token);
      res.status(200).json(profileData);
  } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Error fetching user profile!" });
  }
};

exports.getAllUserBarks = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const barks = await userService.getAllUserBarksByUsername(req.params.username, page);
      res.status(200).json(barks);
  } catch (error) {
      console.error("Error fetching user barks:", error);
      res.status(500).json({ message: "Error fetching user barks!" });
  }
};

exports.getAllUserLikes = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const likedBarks = await userService.getAllUserLikesByUsername(req.params.username, page);
      res.status(200).json(likedBarks);
  } catch (error) {
      console.error("Error fetching user likes:", error);
      res.status(500).json({ message: "Error fetching user likes!" });
  }
};

exports.follow = async (req, res) => {
  try {
      const userId = getUserId(req.headers.authorization);
      const isFollowing = await userService.toggleFollow(userId, req.params.username);
      res.status(200).json({ message: isFollowing ? 'Unfollowed' : 'Followed' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
      const userId = getUserId(req.headers.authorization);
      const notifications = await userService.getUserNotifications(userId);
      if (!notifications) {
          return res.status(404).json({ message: "User Not found" });
      }
      res.status(200).json(notifications);
  } catch (error) {
      console.error("Error getting Notifications", error);
      res.status(500).json({ message: "Error getting notifications" });
  }
};

exports.login = (req, res) => {
  const token = userService.loginUser(req.user);
  res.json({ message: "Logged in successfully", token: token });
};

exports.logout = (req, res) => {
  req.logout();
  res.json({ message: "Logged out successfully" });
};