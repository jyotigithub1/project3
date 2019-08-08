require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;
var socketArr = [];
const passport = require('./config/passport.js')
const { google } = require("googleapis")
const session = require('express-session')
const path = require("path");
app.use(session({ secret: process.env.SESSION_SECRET || "the cat ate my keyboard", resave: true, saveUninitialized: true }))
app.use(passport.initialize());
app.use(passport.session());

const db = require("./models")
// Added by jyoti for scoket connection 

var server = require('http').Server(app);
var io = require('socket.io')(server);
//Added by jyoti


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
var clients = 0;
io.on('connection', function (socket) {
    clients++;
    console.log('A user connected!', socket.id);
    io.sockets.emit('broadcast', { description: clients + ' clients connected!' });
    socket.emit('userConnected', { socketId: socket.id });
    socket.emit('newclientconnect', { description: 'Hey, welcome!' });
    socket.broadcast.emit('newclientconnect', { description: clients + ' clients connected!' });
    socketArr.push(socket.id);
    console.log("Socket id  added :" + socketArr);
    socket.on('clicked', function (data) {
        console.log(data);
        io.sockets.emit('clicked', { data: socket.id });
    });


});


//OAuth
const googleConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirect: process.env.GOOGLE_REDIRECT_URI
};

const defaultScope = [
    'https://www.googleapis.com/auth/userinfo.email'
];

function createConnection() {
    return new google.auth.OAuth2(
        googleConfig.clientId,
        googleConfig.clientSecret,
        googleConfig.redirect
    );
}
function getConnectionUrl() {
    return createConnection().generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: defaultScope
    });
}



// API ROUTES GO HERE


app.get('/api/google/url', (req, res) => {
    res.json({ url: getConnectionUrl() });
});

function getGoogleAccountFromCode(code) {
    console.log("CODE");
    console.log(code);
    return createConnection().getToken(code).then(data => {
        console.log("DATA");
        console.log(data.tokens);
        return Promise.resolve(data.tokens);
    });
}

app.post('/api/google/code', (req, res) => {
    const { code } = req.body;
    getGoogleAccountFromCode(code).then(tokens => {
        console.log(tokens)
        const userConnection = createConnection();
        userConnection.setCredentials(tokens);
        userConnection.getTokenInfo(tokens.access_token).then(data => {
            console.log("TOKEN INFO");
            console.log(data);
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
                            res.json(true);
                        })
                    }).catch(err => {
                        console.log(err);
                        res.sendStatus(500);
                    })

                } else {
                    // Check the type and googleId
                    // if it matches, great! Login the user!
                    // if not, something odd is up, reject it
                    console.log(dbUser);
                    if (dbUser.authType === "google" && dbUser.googleId === sub + "") {
                        req.login(dbUser, () => {
                            res.json(true);
                        });

                    } else {
                        res.sendStatus(500);
                    }
                }
            });

        }).catch(() => {
            res.sendStatus(500);
        });
    });
});

app.get('/api/google/callback', function (req, res) {
    const code = req.query.code
    getGoogleAccountFromCode(code).then(tokens => {
        const userConnection = createConnection();
        userConnection.setCredentials(tokens);
        userConnection.getTokenInfo(tokens.access_token).then(data => {
            const { email, sub } = data;
            db.User.findOne({ email }).then(dbUser => {
                console.log(dbUser);
                if (!dbUser) {
                    console.log("NEW USER");
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
                        console.log(err);
                        res.sendStatus(500);
                    });

                } else {
                    if (dbUser.authType === "google" && dbUser.googleId === sub + "") {
                        req.login(dbUser, () => {
                            res.redirect(process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000/");
                        });
                    } else {
                        res.sendStatus(500);
                    }
                }
            }).catch(err => console.log(err));

        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    });
});

// Start the API server
server.listen(PORT, function () {
    console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
    // <<<<<<< HEAD
});

//Make sure Mongoose connection is disconnected
process.on('SIGINT', () => {
    mongoose.connection.close().then(() => {
        console.log("Mongoose disconnected");
        process.exit(0);
    });
});


