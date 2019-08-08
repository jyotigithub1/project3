import openSocket from 'socket.io-client';
import axios from "axios";
const socket = openSocket("http://localhost:3001");

export default {
      // user connected to the app.
      getConnected: function (cb) {
            return socket.on('userConnected', cb);
      },
      updateUserSocket: function (socketId) {
            return axios.post("/api/user/updateSocket", { socketId });
      }
      // namespace connected
      // namespaceConnected: function () {
      //       socket.on('/cat')
      // }
}


