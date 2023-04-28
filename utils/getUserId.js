const jwt = require('jsonwebtoken');

const getUserId = (authorizationHeader) => {
    const token = authorizationHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;
  
    return decodedToken.id;
  };
  
  module.exports = getUserId;