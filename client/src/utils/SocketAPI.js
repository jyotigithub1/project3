import openSocket from 'socket.io-client';
const socket = openSocket("http://localhost:3001");

export default {
      // user connected to the app.
      getConnected: function () {
            socket.on('userConnected', socketData => {
                  // this.setState.socketid = socketData.socketId;
                  socket.on('newclientconnect', data => {
                  });
            });
      }
      // namespace connected
      // namespaceConnected: function () {
      //       socket.on('/cat')
      // }
}


