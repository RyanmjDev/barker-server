
const jwt = require('jsonwebtoken');

// Determines how many barks are loaded per page. Eventually, this value shouldn't be hardcoded. 
exports.barksPageLimit = 20;

exports.getUserIdFromToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    return decodedToken.id;
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  return null;
};

exports.mapBarksWithUserLikes = (barks, user) => {
  return barks.map((bark) => {
    const isLikedByUser = user.likedBarks.includes(bark._id);
    return { ...bark._doc, isLikedByUser };
  });
};