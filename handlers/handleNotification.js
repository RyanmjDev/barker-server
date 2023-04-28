const Notification = require('../models/notification');
const User = require('../models/User');
const { getConnectedUsers,  unreadNotificationCounts } = require('./socketHandler');



const handleNotification = async (userId, barkId, barkOwner, action, connectedUsers) => {

    const socketConfig = require('../socketConfig');
    const io = socketConfig.getIo();

    const existingNotification = await Notification.findOne({
      user: barkOwner._id,
      type: 'like',
      relatedBark: barkId,
    });
  
    if (action === 'like') {
      if (existingNotification) {
        existingNotification.fromUser = userId;
        existingNotification.read = false;
        existingNotification.engagements.likes += 1;
        await existingNotification.save();
      } else {
        const notification = new Notification({
          user: barkOwner._id,
          type: 'like',
          relatedBark: barkId,
          fromUser: userId,
          engagements: {
            likes: 1,
          },
        });
  
        await notification.save();
  
        if (connectedUsers[barkOwner.username]) {
          const barkOwnerSocketId = connectedUsers[barkOwner.username];
          unreadNotificationCounts[barkOwner.username]++;
          console.log("barkOwner socketId:", barkOwnerSocketId);
          io.to(barkOwnerSocketId).emit('updateUnreadCount', unreadNotificationCounts[barkOwner.username]);
        }
      }
    } else if (action === 'unlike') {

        if (existingNotification) {
          existingNotification.engagements.likes -= 1;
          if (existingNotification.engagements.likes <= 0) {
            if (connectedUsers[barkOwner.username]) {
                const barkOwnerSocketId = connectedUsers[barkOwner.username];
                console.log("barkOwner socketId:", barkOwnerSocketId);
    
                unreadNotificationCounts[barkOwner.username]--;
                io.to(connectedUsers[barkOwner.username]).emit('updateUnreadCount', unreadNotificationCounts[barkOwner.username]);
              }
              
            await existingNotification.deleteOne();
          } else {
            await existingNotification.save();
          }
          
        }
      }
  };
  
  module.exports = handleNotification;