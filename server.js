const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;
const passport = require('./config/passport.js')
const { google } = require("googleapis")
const session = require('express-session')
const path = require("path");
const chalk = require('chalk');

app.use(session({ secret: process.env.SESSION_SECRET || "the cat ate my keyboard", resave: true, saveUninitialized: true }))
app.use(passport.initialize());
app.use(passport.session());

const db = require("./models")

// Added by jyoti for scoket connection 
var server = require('http').Server(app);
var io = require('socket.io')(server);
//Added by jyoti

//OAuth
//============================================================================
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirect: process.env.GOOGLE_REDIRECT_URI
}

const defaultScope = [
  'https://www.googleapis.com/auth/userinfo.email'
]

function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  )
}
function getConnectionUrl() {
  return createConnection().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  })
}

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Add routes, both API and view
app.use(routes);

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/trivia_masters");

//SOCKET AND GAME STATES START HERE
// ===========================================================================================
//Player Data on Server
const playerArr = [];

const makePlayer = (socket) => {
  console.log(chalk.blue("Making new player for: ", socket.id));
  return {
    id: socket.id,
    email: "",
    authorized: false,
    socket: socket
  }
}

const getPlayerById = (id) => {
  return playerArr.find(p => p.id === id)
}
//Session Data on Server
let sessionId = 1;

const sessions = [];

const makeSession = (id, creator, category) => {
  return {
    id,
    category: category,
    playerOne: creator,
    playerTwo: null,
    playerOneSelect: false,
    playerTwoSelect: false,
    playerOneScore: 0,
    playerTwoScore: 0
  }
}

// const searchSessions = (socket, category) => {

const searchSessions = (id, category) => {
  return sessions.find(s => s.id === id)
}


io.on('connection', function (player) {
  //On connection, create a new player that's now authorized.
  const newPlayer = makePlayer(player);
  playerArr.push(newPlayer)

  //Tell all the other sockets that there's a new player
  playerArr.filter(p => p.id !== newPlayer.id).forEach(p => {
    p.socket.emit("message", "somebody else connected")
  });

  player.on('disconnect', () => {
    console.log("Player " + player.id + "is disconnecting");
    const index = playerArr.findIndex(p => p.id === player.id);
    playerArr.splice(index, 1);
    // Look for any games they are a part of and kill them
  })


  player.on("setuser", (data) => {
    console.log('==================================================================');
    // console.log(chalk.green("Data from Server's SetUser ", JSON.stringify(data)));

    const index = playerArr.find(p => p.id === player.id);

    if (index) {
      console.log("User found in playersArr, adding email:", data);
      index.email = data;
      index.authorized = true;
      index.socket.emit("addedEmail", "We added your email to your user ID");
      index.socket.emit('authorized', true);
    } else {
      console.log(chalk.red("User not found"));
    }
  });


  player.on("seekGame", (category) => {

    let p1Info = {
      position: "",
      opponent: "",
      sessionId: ""
    }

    let p2Info = {
      position: "",
      opponent: "",
      sessionId: ""
    }

    // Try and find them a game, if we can, great!
    // Otherwise just make a new one and put them in it
    if (sessions.length === 0) {
      sessions.push(makeSession(sessionId++, newPlayer));
      newPlayer.position = "p1";
      console.log("Server says: New game joined by" + newPlayer);
      newPlayer.socket.emit("matchmaking", "Server says: 'You've created a game. Waiting for another player to join.'");
    } else {
      // Look for a game without a playerTwo
      const s = sessions.find(s => s.playerTwo === null);
      if (s) {
        //Add this player as the session's player 2
        s.playerTwo = newPlayer;
        newPlayer.position = "p2";

        //Finish filling out the objects to be sent back to the page
        p1Info.position = "p1";
        p1Info.opponent = s.playerTwo.email;
        p1Info.sessionId = s.id;
        p2Info.position = "p2";
        p2Info.opponent = s.playerOne.email;
        p2Info.sessionId = s.id;

        //Tell each user that the other person joined
        // s.playerOne.socket.emit("joinedSession", newPlayer.email);
        // s.playerTwo.socket.emit("joinedSession", s.playerOne.email);

        s.playerOne.socket.emit("startGame", p1Info);
        s.playerTwo.socket.emit("startGame", p2Info);

        //Console logging to make sure they're connected:
        console.log("Server says: New game joined! GameId =" + s.id)
        console.log("Server says: PlayerOne Email =" + s.playerOne.email);
        console.log("Server says: PlayerOne SI =" + s.playerOne.id);
        console.log("Server says: PlayerTwo Email =" + s.playerTwo.email);
        console.log("Server says: PlayerTwo SI =" + s.playerTwo.id);
      } else {
        //If there are no games to join, make your own
        sessions.push(makeSession(sessionId++, newPlayer));

        newPlayer.position = "p1";

        newPlayer.socket.emit("matchmaking", "Server says: 'You've created a game. Waiting for another player to join.'");
      }
    }
  });


  player.on('playerChoice', result => {
    const s = sessions.find((s) => (s.playerOne.id === newPlayer.id || s.playerTwo.id === newPlayer.id))
    if (s) {
      // console.log("Session Found! This player is in the session # " + s.id);
      // console.log("This player is " + newPlayer.position);

      if (newPlayer.email === s.playerOne.email) {
        s.playerOneSelect = true;
        if (result === "correct") {
          s.playerOneScore++
        }
        // console.log("Player One Selected an Answer");
      } else if (newPlayer.email === s.playerTwo.email) {
        s.playerTwoSelect = true;
        if (result === "correct") {
          s.playerTwoScore++
        }
        // console.log("Player Two Selected an Answer");
      }

      if (s.playerOneSelect === false || s.playerTwoSelect === false) {
        if (s.playerOneSelect === true) {
          s.playerOne.socket.emit('scoreUpdate', "You've Selected an Answer");
          s.playerTwo.socket.emit('scoreUpdate', "Your Opponent has Selected their Answer");
        } else if (s.playerTwoSelect === true) {
          s.playerTwo.socket.emit('scoreUpdate', "You've Selected an Answer");
          s.playerOne.socket.emit('scoreUpdate', "Your Opponent has Selected their Answer");
        }
      } else if (s.playerOneSelect === true && s.playerTwoSelect === true) {
        console.log("Both users have answered");
        s.playerOneSelect = false;
        s.playerTwoSelect = false;

        let updatedScore = {
          playerOne: s.playerOneScore,
          playerTwo: s.playerTwoScore
        }

        s.playerOne.socket.emit('nextQuestion', updatedScore);
        s.playerTwo.socket.emit('nextQuestion', updatedScore);
      }
    } else {
      console.log("No session found");
    }
  });

  player.on('player-endGame', gameData => {
    io.emit('player-endGame', gameData)
  });
});



// ROUTES FOR GOOGLE AUTHENTICATION
//=======================================================================
app.get('/api/google/url', (req, res) => {
  res.json({ url: getConnectionUrl() })
})

function getGoogleAccountFromCode(code) {
  // console.log("CODE");
  // console.log(code);
  return createConnection().getToken(code).then(data => {
    // console.log("DATA");
    // console.log(data.tokens)
    return Promise.resolve(data.tokens)
  })
}

app.post('/api/google/code', (req, res) => {
  const { code } = req.body;
  getGoogleAccountFromCode(code).then(tokens => {
    console.log(tokens)
    const userConnection = createConnection()
    userConnection.setCredentials(tokens)
    userConnection.getTokenInfo(tokens.access_token).then(data => {
      // console.log("TOKEN INFO");
      // console.log(data);
      const { email, sub } = data;

      db.User.findOne({ email }).then(dbUser => {
        if (!dbUser) {
          // create a new user!
          db.User.create({
            email,
            authType: "google",
            googleId: sub
          }).then(finalDbUser => {
            req.login(finalDbUser, () => {
              res.json(true)
            })
          }).catch(err => {
            console.log(err)
            res.sendStatus(500)
          })

        } else {
          // Check the type and googleId
          // if it matches, great! Login the user!
          // if not, something odd is up, reject it
          // console.log(dbUser);
          if (dbUser.authType === "google" && dbUser.googleId === sub + "") {
            req.login(dbUser, () => {
              res.json(true)
            });

          } else {
            res.sendStatus(500)
          }
        }
      })

    }).catch(() => {
      res.sendStatus(500)
    })
  })
})

app.get('/api/google/callback', function (req, res) {
  const code = req.query.code
  getGoogleAccountFromCode(code).then(tokens => {
    const userConnection = createConnection()
    userConnection.setCredentials(tokens)
    userConnection.getTokenInfo(tokens.access_token).then(data => {
      const { email, sub } = data;
      db.User.findOne({ email }).then(dbUser => {
        // console.log(dbUser);
        if (!dbUser) {
          // console.log("NEW USER");
          // create a new user!
          db.User.create({
            email,
            authType: "google",
            googleId: sub
          }).then(finalDbUser => {
            req.login(finalDbUser, () => {
              res.redirect(process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000/");
            })
          }).catch(err => {
            console.log(err)
            res.sendStatus(500)
          })

        } else {
          if (dbUser.authType === "google" && dbUser.googleId === sub + "") {
            req.login(dbUser, () => {
              res.redirect(process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000/");
            })
          } else {
            res.sendStatus(500)
          }
        }
      }).catch(err => console.log(err))

    }).catch(err => {
      console.log(err)
      res.sendStatus(500)
    })
  })
})

// Start the API server
server.listen(PORT, function () {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});

//Make sure Mongoose connection is disconnected
process.on('SIGINT', () => {
  mongoose.connection.close().then(() => {
    console.log("Mongoose disconnected");
    process.exit(0);
  })
})


