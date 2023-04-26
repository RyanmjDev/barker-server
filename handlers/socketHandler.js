const connectedUsers = {};

 const getConnectedUsers = () => {
  return connectedUsers;
};

const socketHandler =  (io, socket) => {
    console.log('a user connected');
  
    socket.on('join', (username) => {
      if(username)
      {
        connectedUsers[username] = socket.id;
        console.log(`User ${username} joined with socket ID: ${socket.id}`);
      }

      socket.on('disconnect', () => {
        console.log('a user disconnected');
        // Remove the user from the connectedUsers object
        const username = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
        if (username) {
          delete connectedUsers[username];
        }
      });
    });
  };

  module.exports = {
    socketHandler,
    getConnectedUsers,
  };