const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SECRET_KEY;
function generateToken(user) {
  const payload = {
    id: user._id,
    username: user.username,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  });
}
 
module.exports = generateToken;