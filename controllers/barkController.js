const Bark = require('../models/bark');
const parseUserId = require("../utils/parseToken");
const jwt = require('jsonwebtoken');


const getAllBarks = async (req, res) => {
  try {
    const barks = await Bark.find().populate('user', 'username');
    res.status(200).json(barks);
  } catch (error) {
    console.error('Error fetching barks:', error); // Add this line
    res.status(500).json({ message: 'Error fetching barks' });
  }
};

const listBarks = async (req, res) => {
  try {
    const barks = await Bark.find().populate('user', 'username');
    res.status(200).json(barks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching barks', error: err });
  }
};

const createBark = async (req, res) => {
  try {
    const newBark = new Bark({
      user: req.user._id,
      content: req.body.content,
    });

    const savedBark = await newBark.save();
    res.json(savedBark);
  } catch (error) {
    console.error('Error creating bark:', error);
    res.status(500).json({ message: 'Error creating bark' });
  }
};

const getBarkById = async (req, res) => {
  try {
    const barkId = req.params.barkId;
    const bark = await Bark.findById(barkId)
    .populate('user', 'username') 
    .exec();

    if (!bark) {
      return res.status(404).json({ message: 'Bark not found' });
    }

    res.json(bark);
  } catch (error) {
    console.error('Error fetching bark by ID:', error);
    res.status(500).json({ message: 'Error fetching bark by ID' });
  }
};

const likeBark = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token,  process.env.SECRET_KEY);
    const userId = decodedToken.id;


    const barkId = req.params.barkId;

    const bark = await Bark.findById(barkId);
    if(!bark) {
      return res.status(404).json({message: 'Bark not found'});
    }

    const likeIndex = bark.likes.findIndex((like) => like.user.toString() === userId);

    if (likeIndex === -1) {
      // If a bark isn't liked, like it
      bark.likes.push({ user: userId })
    } else {
      // If has already been liked, unlike it
      bark.likes.splice(likeIndex, 1);
    }
    
    await bark.save();
    res.status(200).json(bark);


  } catch(error) {
    console.error('Error liking bark:', error);
    res.status(500).json({ message: 'Error liking bar', error });
  }
}

const deleteBark = async (req, res) => {
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

module.exports = {
  getAllBarks, listBarks, createBark, deleteBark, getBarkById,
  likeBark
};
