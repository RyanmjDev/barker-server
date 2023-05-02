const Notification = require('../models/notification');
const User = require("../models/User");
const socketConfig = require('../socketConfig');

const connectedUsers = {};
const unreadNotificationCounts = {};

 const getConnectedUsers = () => {
  return connectedUsers;
};

const socketHandler =  (io, socket) => {
    console.log('a user connected');
  
    socket.on('join', async(userId) => {
      if(userId)
      {
        const initialUnreadCount = await Notification.countDocuments({ user: userId, read: false });
        unreadNotificationCounts[userId] = initialUnreadCount; 
        
        socket.emit('updateUnreadCount', initialUnreadCount); // sends the initial unreadcount
        
        connectedUsers[userId] = socket.id;
        console.log(`User ${userId} joined with socket ID: ${socket.id}`);
      }

      socket.on('readAllNotifications', (userId) => {
        if (userId) {
          unreadNotificationCounts[userId] = 0;
          socket.emit('updateUnreadCount', 0);
        }
      });
  

      socket.on('disconnect', () => {
        console.log('a user disconnected');
        // Remove the user from the connectedUsers object
        const username = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
        if (userId) {
          delete connectedUsers[userId];
          delete unreadNotificationCounts[userId];
        }
      });
    });
  };



  module.exports = {
    socketHandler,
    getConnectedUsers,
    unreadNotificationCounts,
  };