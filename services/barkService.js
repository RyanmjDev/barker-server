const Bark = require('../models/bark');
const User = require('mongoose').model('User');
const jwt = require('jsonwebtoken'); 

const {socketHandler, unreadNotificationCounts,  getConnectedUsers} = require('../handlers/socketHandler');
const handleNotification = require('../handlers/handleNotification');

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

exports.createBark = async(userId, content) => {
  try {
    const newBark = new Bark({
      user: userId,
      content: content,
    });
    const savedBark = await newBark.save();
    return await Bark.findById(savedBark._id).populate({
      path: 'user',
      select: 'username displayName',
    });
  } catch (error) {
    console.error('Error creating bark:', error);
    throw error;
  }
};

exports.postReply = async (parentBarkId, userId, content) => {
  try {
    const parentBark = await Bark.findById(parentBarkId);
    if (!parentBark) throw new Error('Bark not found');

    const reply = new Bark({
      user: userId,
      content,
      parentBark: parentBarkId,
    });
    await reply.save();
    parentBark.replies.push(reply);
    await parentBark.save();
    return reply;
  } catch (error) {
    console.error('Error posting reply:', error);
    throw error;
  }
}


exports.getReplies = async (parentBarkId, page) => {
  try {
    const parentBark = await Bark.findById(parentBarkId)
      .populate('replies')
      .populate('user', 'username displayName')
      .skip((page - 1) * barkUtils.barksPageLimit)
      .limit(barkUtils.barksPageLimit)
      .exec();
    if (!parentBark) throw new Error('Bark not found');

    return await Promise.all(
      parentBark.replies.map(async (reply) => {
        return await Bark.populate(reply, { path: 'user', select: 'username displayName' });
      })
    );
  } catch (error) {
    console.error('Error fetching replies:', error);
    throw error;
  }
};

exports.getBarkById = async (barkId, token) => {
  try {
    const bark = await Bark.findById(barkId).populate('user', 'username displayName').exec();
    if (!bark) throw new Error('Bark not found');

    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
      const userId = decodedToken.id;
      if (userId) {
        const user = await User.findById(userId);
        const isLikedByUser = user.likedBarks.includes(barkId);
        return { ...bark._doc, isLikedByUser };
      }
    }
    return bark;
  } catch (error) {
    console.error('Error fetching bark by ID:', error);
    throw error;
  }
};

exports.likeBark = async (barkId, userId) => {
  try {
    const bark = await Bark.findById(barkId);
    if (!bark) throw new Error('Bark not found');

    const likeIndex = bark.likes.findIndex((like) => like.user.toString() === userId);
    const user = await User.findById(userId);
    const barkOwner = await User.findById(bark.user);
    const connectedUsers = getConnectedUsers();

    if (likeIndex === -1) {
      bark.likes.push({ user: userId });
      user.likedBarks.push(bark);
      await handleNotification(userId, barkId, barkOwner, 'like', connectedUsers);
    } else {
      const barkIndex = user.likedBarks.findIndex((likedBark) => likedBark._id.toString() === barkId);
      user.likedBarks.splice(barkIndex, 1);
      bark.likes.splice(likeIndex, 1);
      await handleNotification(userId, barkId, barkOwner, 'unlike', connectedUsers);
    }

    await user.save();
    await bark.save();
    return bark;
  } catch (error) {
    console.error('Error liking bark:', error);
    throw error;
  }
};

exports.bookmarkBark = async (barkId, userId) => {
  try {
      const bark = await Bark.findById(barkId);
      if (!bark) throw new Error('Bark not found');

      const user = await User.findById(userId);
      const bookmarkIndex = user.bookmarks.findIndex((bookmark) => bookmark.equals(bark._id)); // Check if User has already bookmarked this

      if (bookmarkIndex !== -1) {
        // If the bark is already bookmarked, remove it
        console.log(`UNbookmarked barkID: ${bark}`)
        user.bookmarks.splice(bookmarkIndex, 1);
      } else {
        // If the bark is not bookmarked, add it
        user.bookmarks.push(bark);
        console.log(`Successfully bookmarked barkID: ${bark}`)
      }

      await user.save();
      return bark;


  }
  catch (error){
    console.error('error bookmarking/unbookmarking bark!', error)
    throw error;
  }
}

exports.deleteBark = async (barkId, userId) => {
  try {
    const bark = await Bark.findById(barkId);
    if (!bark) throw new Error('Bark not found');
    if (bark.user.toString() !== userId.toString()) throw new Error('Forbidden');

    await Bark.findByIdAndDelete(barkId);
    return;
  } catch (error) {
    console.error('Error deleting bark:', error);
    throw error;
  }
};