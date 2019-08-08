const db = require("../models");

module.exports = {
    //TODO Check if these are working
    findAll: function(req, res) {
        db.User
          .find(req.query).sort({totalWins: -1})
          .then(dbModel => res.json(dbModel))
          .catch(err => res.status(422).json(err));
      },
      findById: function(req, res) {
        db.User
          .findById(req.params.Id)
          .then(dbModel => res.json(dbModel))
          .catch(err => res.status(422).json(err));
      }
};