const User = require("../models/User");
const Bark = require ("../models/bark");
const generateToken = require("../utils/generateToken");
const parseUserId = require("../utils/parseToken");
const jwt = require('jsonwebtoken');
const Notification = require("../models/notification");


exports.getUser = async (req, res) => {
  try {

      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const userId = parseUserId(token);

    if (userId) {
      const { username } = await User.findById(userId);
      res.json(username);
    }
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};



exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    const {profile} = user;
    const followers = user.followers.length;
    const following = user.following.length;
    let isFollowing = false;

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      if (token) {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.id;

          // Find the logged-in user
          const loggedInUser = await User.findById(userId);
          
           // Check if the logged-in user is already following the user whose profile is being visited
           isFollowing = loggedInUser.following.some((followedUserId) =>
           followedUserId.equals(user._id)
           );
      }
    }


    res.status(200).json({profile, username, followers, following, isFollowing});
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile!" });
  }
};

exports.getAllUserBarks = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const barks = await Bark.find({ user: user._id }).sort({ createdAt: -1 }).populate('user', 'username');

    
    res.status(200).json(barks);
  } catch (error) {
    console.error("Error fetching user barks:", error);
    res.status(500).json({ message: "Error fetching user barks!" });
  }
};

exports.getAllUserLikes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const likedBarks = await Bark.find({ _id: { $in: user.likedBarks } }).populate('user', 'username')
      .sort({ createdAt: -1 });

      console.log(likedBarks) 


    res.status(200).json(likedBarks);
  } catch (error) {
    console.error("Error fetching user likes:", error);
    res.status(500).json({ message: "Error fetching user likes!" });
  }
}

exports.follow = async (req, res) => {
  try {

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token,  process.env.SECRET_KEY);
    const userId = decodedToken.id;

    const username = req.params.username;

    const targetUser = await User.findOne({ username });
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser || targetUser._id.equals(currentUser._id)) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const isFollowing = currentUser.following.some(user => user.equals(targetUser._id));

    if (isFollowing) {
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }



    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: isFollowing ? 'Unfollowed' : 'Followed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

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
  });


   if(!notifications) {
     return res.status(404).json({message: "User Not found"})
   }
  res.status(200).json(notifications)
  } catch(error) {
    console.error("Error getting Notifications", error);
    res.status(500).json({message: "Error getting notifications"})
  }
}

exports.login = (req, res) => {
  const token = generateToken(req.user);
  res.json({ message: "Logged in successfully", token: token });
};

exports.logout = (req, res) => {
  req.logout();
  res.json({ message: "Logged out successfully" });
};


