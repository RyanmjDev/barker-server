const Bark = require('../models/bark');
const User = require('mongoose').model('User');
const parseUserId = require("../utils/parseToken");
const jwt = require('jsonwebtoken');

const Notification = require("../models/notification");

const handleNotification = require('../handlers/handleNotification');
const {socketHandler, unreadNotificationCounts,  getConnectedUsers} = require('../handlers/socketHandler');
const getUserId = require('../utils/getUserId');
const barksPageLimit = require('../utils/barksPageLimit')



exports.getAllBarks = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;

    const barks = await Bark.find()
    .sort({ createdAt: -1 })
    .populate('user', 'username displayName')
    .skip((page - 1) * barksPageLimit)
    .limit(barksPageLimit)
    .exec();

    // Check if the token exists
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      if (token) {
        try {
          const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
          const userId = decodedToken.id;

          if (userId) {
            const user = await User.findById(userId);
            const barksWithUserLikes = barks.map((bark) => {
              const isLikedByUser = user.likedBarks.includes(bark._id);
              return { ...bark._doc, isLikedByUser };
            });
            return res.status(200).json(barksWithUserLikes);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          // Continue without user-specific data if the token is invalid
        }
      }
    } 

    res.status(200).json(barks);
  } catch (error) {
    console.error('Error fetching barks:', error);
    res.status(500).json({ message: 'Error fetching barks' });
  }
};


exports.createBark = async (req, res) => {
  try {

    const newBark = new Bark({
      user: req.user._id,
      content: req.body.content,
    })

    const savedBark = await newBark.save();

    const populatedBark = await Bark.findById(savedBark._id).populate({
      path: 'user',
      select: 'username displayName',
    });

    res.json(populatedBark);
  } catch (error) {
    console.error('Error creating bark:', error);
    res.status(500).json({ message: 'Error creating bark' });
  }
};

exports.postReply = async (req, res) => {
  try {
    const parentBarkId = req.params.barkId;
    const parentBark = await Bark.findById(parentBarkId);

    if (!parentBark) {
      return res.status(404).json({ message: 'Bark not found' });
    }

    const userId = req.user.id;
    const content = req.body.content;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const reply = new Bark({
      user: userId,
      content,
      parentBark: parentBarkId
    });



    await reply.save();

    parentBark.replies.push(reply);
    await parentBark.save();

    const barkOwner = await User.findById(parentBark.user); // Find the owner of the bark to send them a notification

    // const replyNotification = new Notification({
    //   user: barkOwner._id,
    //   type: 'reply',
    //   relatedBark: parentBarkId,
    //   relatedReply: newReply._id, // Store the ID of the reply
    //   fromUser: userId, // The user who created the reply
    // });

    // await replyNotification.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(500).json({ message: 'Error posting reply' });
  }
};


exports.getReplies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const parentBarkId = req.params.barkId;
    const parentBark = await Bark.findById(parentBarkId)
    .populate('replies')
    .populate('user', 'username displayName')
    .skip((page - 1) * barksPageLimit)
    .limit(barksPageLimit)
    .exec();
    

    if (!parentBark) {
      return res.status(404).json({ message: 'Bark not found' });
    }

    // Take populate replies and populates the username field on them...
    const populatedReplies = await Promise.all(
      parentBark.replies.map(async (reply) => {
        return await Bark.populate(reply, { path: 'user', select: 'username displayName' });
      })
    );


    res.status(200).json(populatedReplies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ message: 'Error fetching replies' });
  }
};


exports.getBarkById = async (req, res) => {
  try {
    const barkId = req.params.barkId;
    const bark = await Bark.findById(barkId)
    .populate('user', 'username displayName') 
    .exec();

    if (!bark) {
      return res.status(404).json({ message: 'Bark not found' });
    }
   
if (req.headers.authorization) {
  
      const token = req.headers.authorization.split(" ")[1];
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.id;

        if (userId) {

           const user = await User.findById(userId);
           const isLikedByUser = user.likedBarks.includes(barkId);
           const barkWithLikes = {...bark._doc, isLikedByUser};
           res.status(200).json(barkWithLikes);
        }
      } catch (error)
      {
        console.error('Error with token:', error);
        res.status(500).json({ message: 'Error with token:' });
      }
    }
  } else {
    res.json(bark);
  }
  } catch (error) {
    console.error('Error fetching bark by ID:', error);
    res.status(500).json({ message: 'Error fetching bark by ID' });
  }
};



exports.likeBark = async (req, res) => {
  try {

    const userId = getUserId(req.headers.authorization)

    const barkId = req.params.barkId;

    const bark = await Bark.findById(barkId);
    if (!bark) {
      return res.status(404).json({ message: 'Bark not found' });
    }

    const likeIndex = bark.likes.findIndex((like) => like.user.toString() === userId);
    const user = await User.findById(userId);

    const barkOwner = await User.findById(bark.user);

    const connectedUsers = getConnectedUsers();
    console.log("connectedUsers:", connectedUsers); // Get rid of this later

    if (likeIndex === -1) {
      // If a bark isn't liked, like it
      bark.likes.push({ user: userId });
      user.likedBarks.push(bark);
      await handleNotification(userId, barkId, barkOwner, 'like', connectedUsers);
    } else {
      // If has already been liked, unlike it
      const barkIndex = user.likedBarks.findIndex((likedBark) => likedBark._id.toString() === barkId);
      if (barkIndex !== -1) {
        user.likedBarks.splice(barkIndex, 1);
      }
      bark.likes.splice(likeIndex, 1);
      await handleNotification(userId, barkId, barkOwner, 'unlike', connectedUsers);
    }

    await user.save();
    await bark.save();
    res.status(200).json(bark);
    } catch (error) {
    console.error('Error liking bark:', error);
    res.status(500).json({ message: 'Error liking bark', error });
    }
};


exports.deleteBark = async (req, res) => {
  const { barkId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const bark = await Bark.findById(barkId);

    if (!bark) {
      return res.status(404).json({ message: 'Bark not found' });
    }

    if (bark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Bark.findByIdAndDelete(barkId);
    res.status(200).json({ message: 'Bark deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting bark', error: err });
  }
};

// module.exports = {
//   getAllBarks,  createBark, deleteBark, getBarkById,
//   likeBark
// };
