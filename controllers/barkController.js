const Bark = require('../models/bark');

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
  const { content } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const bark = new Bark({ content, user: req.user._id });
    await bark.save();
    res.status(201).json(bark);
  } catch (err) {
    res.status(500).json({ message: 'Error creating bark', error: err });
  }
};

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
  getAllBarks, listBarks, createBark, deleteBark
};
