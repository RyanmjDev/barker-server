const Notification = require('../models/notification');
const User = require("../models/User");
const connectedUsers = {};
const unreadNotificationCounts = {};

 const getConnectedUsers = () => {
  return connectedUsers;
};

const socketHandler =  (io, socket) => {
    console.log('a user connected');
  
    socket.on('join', async(username) => {
      if(username)
      {
        // Initialize notifications. Later on, optimize this by replacing username with userId to make less database calls
        const user = await User.findOne({ username });
        const initialUnreadCount = await Notification.countDocuments({ user: user._id, read: false });
        unreadNotificationCounts[username] = initialUnreadCount; 
        
        connectedUsers[username] = socket.id;
        console.log(`User ${username} joined with socket ID: ${socket.id}`);
      }

      socket.on('disconnect', () => {
        console.log('a user disconnected');
        // Remove the user from the connectedUsers object
        const username = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
        if (username) {
          delete connectedUsers[username];
          delete unreadNotificationCounts[username];
        }
      });
    });
  };

  module.exports = {
    socketHandler,
    getConnectedUsers,
    unreadNotificationCounts,
  };