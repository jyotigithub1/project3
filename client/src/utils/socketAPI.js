import openSocket from 'socket.io-client';

const socket = openSocket(process.env.SOCKET_URL || 'http://localhost:3001')

//As soon as a user connects, add them to the UsersArray
socket.on("message", message => console.log(message));
socket.on("joinedGame", message => console.log(message));
socket.on("addedEmail", message => console.log(message));

export default {
    subscribeTimer: (callback) => {
        socket.on("timer", time => callback(time))
    },

    //Authenticating User and Adding to playersArray in server
    publishLogin: userData => {
        socket.emit("setuser", userData)
    },
    subscribeAuthorized: callback => {
        socket.on("authorized", message => callback(message))
    },

    publishSeekGame: () => {
        socket.emit("seekGame")
    },
    subscribeJoinedGame: (callback) => {
        socket.on("joinedGame", info => callback(info))
    },

    subscribeSeekError: callback => {
        socket.on("seekError", message => {
            callback(message)
        })
    },
    subscribeGameStarted: callback => {
        socket.on("gameStarted", info => callback(info))
    },
    
    disconnect(){
        socket.disconnect()
    }
}