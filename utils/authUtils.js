const jwt = require('jsonwebtoken');

exports.getTokenFromHeaders = (authorizationHeader) => {
  if (authorizationHeader) {
    return authorizationHeader.split(" ")[1];
  }
  return null;
};
