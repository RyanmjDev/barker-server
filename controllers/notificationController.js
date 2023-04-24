const Notification = require('../models/notification');
const User = require("../models/User");
const Bark = require ("../models/bark");
const generateToken = require("../utils/generateToken");
const parseUserId = require("../utils/parseToken");
const jwt = require('jsonwebtoken');

// Get notifications for a user
exports.getNotifications = async (req, res) => {
  try {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token,  process.env.SECRET_KEY);
  const userId = decodedToken.id;


  const notifications = await Notification.find({ user: userId })
  .sort({ createdAt: -1 })
  .populate("fromUser", "username")
  .populate({
    path: "relatedBark",
    populate: { path: "user", select: "username" },
  })
  .populate({ path: 'relatedReply' });



   if(!notifications) {
     return res.status(404).json({message: "User Not found"})
   }
  res.status(200).json(notifications)
  } catch(error) {
    console.error("Error getting Notifications", error);
    res.status(500).json({message: "Error getting notifications"})
  }
}

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};
