const User = require("../models/User");
const Bark = require ("../models/bark")
const generateToken = require("../utils/generateToken");
const parseUserId = require("../utils/parseToken");

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
    res.status(200).json({profile, username});
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


exports.login = (req, res) => {
  const token = generateToken(req.user);
  res.json({ message: "Logged in successfully", token: token });
};

exports.logout = (req, res) => {
  req.logout();
  res.json({ message: "Logged out successfully" });
};


