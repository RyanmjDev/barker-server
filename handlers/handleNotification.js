const Notification = require('../models/notification');
const User = require('../models/User');
const { getConnectedUsers, unreadNotificationCounts } = require('./socketHandler');
const socketConfig = require('../socketConfig');

const handleNotification = async (userId, barkId, barkOwner, action, connectedUsers) => {

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
      existingNotification.createdAt = new Date(); // Update the created At field to the time of the most recent engagement
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

      if (connectedUsers[barkOwner._id]) {
        const barkOwnerSocketId = connectedUsers[barkOwner._id];
        unreadNotificationCounts[barkOwner._id]++;
        console.log("barkOwner socketId:", barkOwnerSocketId);
        io.to(barkOwnerSocketId).emit('updateUnreadCount', unreadNotificationCounts[barkOwner._id]);
      }
    }
  } else if (action === 'unlike') {
    if (existingNotification) {

      existingNotification.engagements.likes = Math.max(0, existingNotification.engagements.likes - 1); // Prevent negative value;

      if (existingNotification.engagements.likes <= 0) {
        if (connectedUsers[barkOwner._id]) {
          const barkOwnerSocketId = connectedUsers[barkOwner._id];
          console.log("barkOwner socketId:", barkOwnerSocketId);

          unreadNotificationCounts[barkOwner._id] = Math.max(0, existingNotification.engagements.likes - 1); // Prevent negative value
          io.to(connectedUsers[barkOwner._id]).emit('updateUnreadCount', unreadNotificationCounts[barkOwner._id]);
        }

        await existingNotification.deleteOne();
      } else {
        await existingNotification.save();
      }
    }
  }
};

module.exports = handleNotification;
