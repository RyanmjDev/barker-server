const User = require("../models/User");
const Bark = require ("../models/bark");
const jwt = require('jsonwebtoken');
const generateToken = require("../utils/generateToken");
const Notification = require("../models/notification");
const { barksPageLimit } = require('../utils/barkUtils');
const { getallUserBookmarks } = require("../controllers/userController");

exports.getUserById = async (userId) => {
    const { username, displayName } = await User.findById(userId);
    return { username, displayName };
};

exports.getProfileByUsername = async (username, token) => {
    const user = await User.findOne({ username });
    const { profile, displayName } = user;
    const followers = user.followers.length;
    const following = user.following.length;
    let isFollowing = false;

    if (token) {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.id;
        const loggedInUser = await User.findById(userId);
        isFollowing = loggedInUser.following.some((followedUserId) => followedUserId.equals(user._id));
    }

    return { profile, displayName, username, followers, following, isFollowing };
};

exports.getAllUserBarksByUsername = async (username, page) => {
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');

    return await Bark.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate('user', 'username displayName')
        .skip((page - 1) * barksPageLimit)
        .limit(barksPageLimit)
        .exec();
};

exports.getAllUserLikesByUsername = async (username, page) => {
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');

    return await Bark.find({ _id: { $in: user.likedBarks } })
        .populate('user', 'username displayName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * barksPageLimit)
        .limit(barksPageLimit)
        .exec();
};

exports.getAllUserBookmarks = async (userId, page) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    return await Bark.find({ _id: { $in: user.bookmarks } })
        .populate('user', 'username displayName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * barksPageLimit)
        .limit(barksPageLimit)
        .exec();
}

exports.toggleFollow = async (userId, username) => {
    const targetUser = await User.findOne({ username });
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser || targetUser._id.equals(currentUser._id)) {
        throw new Error('Invalid request');
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

    return isFollowing;
};

exports.getUserNotifications = async (userId) => {
    return await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("fromUser", "username")
        .populate({
            path: "relatedBark",
            populate: { path: "user", select: "username" },
        });
};

exports.loginUser = (user) => {
    return generateToken(user);
};
