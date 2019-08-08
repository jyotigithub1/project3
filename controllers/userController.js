const db = require("../models");

module.exports = {
  //TODO Check if these are working
  findAll: function (req, res) {
    db.User
      .find(req.query).sort({ totalWins: -1 })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findById: function (req, res) {
    db.User
      .findById(req.params.Id)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  updateSocket: function (req, res) {
    if (req.user) {
      req.user.socketId = req.body.socketId;
      res.json({ message: "socket updated successfully", id: req.user.socketId });
    }
    else {
      res.status(401).json({ message: "user not logged in" })
    }
  }
};