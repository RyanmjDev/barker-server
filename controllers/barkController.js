const Bark = require('../models/bark');
const User = require('mongoose').model('User');
const parseUserId = require("../utils/parseToken");
const jwt = require('jsonwebtoken');

const Notification = require("../models/notification");

const getUserId = require('../utils/getUserId');
const barksPageLimit = require('../utils/barkUtils')

const barkService = require('../services/barkService');
const authUtils = require('../utils/authUtils');


exports.getAllBarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const token = authUtils.getTokenFromHeaders(req.headers.authorization);
    const barks = await barkService.getAllBarks(page, token);
    res.status(200).json(barks);
  } catch (error) {
    console.error('Error fetching barks:', error);
    res.status(500).json({ message: 'Error fetching barks' });
  }
};



exports.createBark = async (req, res) => {
  try {
    const newBark = await barkService.createBark(req.user._id, req.body.content);
    res.json(newBark);
  } catch (error) {
    console.error('Error creating bark:', error);
    res.status(500).json({ message: 'Error creating bark' });
  }
};



exports.postReply = async (req, res) => {
  try {
    const reply = await barkService.postReply(req.params.barkId, req.user.id, req.body.content);

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
    const populatedReplies = await barkService.getReplies(req.params.barkId, page);
    res.status(200).json(populatedReplies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ message: 'Error fetching replies' });
  }
};


exports.getBarkById = async (req, res) => {
  try {
    const token = authUtils.getTokenFromHeaders(req.headers.authorization);
    const bark = await barkService.getBarkById(req.params.barkId, token);
    res.status(200).json(bark);
  } catch (error) {
    console.error('Error fetching bark by ID:', error);
    res.status(500).json({ message: 'Error fetching bark by ID' });
  }
};


exports.likeBark = async (req, res) => {
  try {
    const userId = getUserId(req.headers.authorization);
    const bark = await barkService.likeBark(req.params.barkId, userId);
    res.status(200).json(bark);
  } catch (error) {
    console.error('Error liking bark:', error);
    res.status(500).json({ message: 'Error liking bark', error });
  }
};

exports.bookmarkBark = async (req, res) => {
  try {
    const userId = getUserId(req.headers.authorization);
    const bark = await barkService.bookmarkBark(req.params.barkId, userId);
    res.status(200).json(bark);
  } catch (error)
  {
    console.error('Error bookmarking bark:', error);
    res.status(500).json({ message: 'Error bookmarking bark', error });
  }
}

exports.deleteBark = async (req, res) => {
  try {
    await barkService.deleteBark(req.params.barkId, req.user._id);
    res.status(200).json({ message: 'Bark deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting bark', error: err });
  }
};