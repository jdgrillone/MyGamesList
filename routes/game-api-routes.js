// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");
const igdb = require('igdb-api-node').default;
const client = igdb('ffb3b6c1f815074d1a524717c119e142');

// Routes
// =============================================================
module.exports = function(app) {

  // GET route for getting all of the games
  app.get("/api/games", function(req, res) {
    var query = {};
    if (req.query.player_id) {
      query.PlayerId = req.query.player_id;
    }
    // 1. Add a join here to include all of the Players to these games
    db.Game.findAll({ 
      include: [db.Player],
      where: query
    }).then(function(dbGame) {
      res.json(dbGame);
    });
  });

  // Get rotue for retrieving a single game
  app.get("/api/games/:id", function(req, res) {
    // 2. Add a join here to include the Player who wrote the Game
    db.Game.findOne({ 
      include: [db.Player],
      where: {
        id: req.params.id
      }
    }).then(function(dbGame) {
      console.log(dbGame);
      res.json(dbGame);
    });
  });

  // POST route for saving a new game
  app.post("/api/games", function(req, res) {
    db.Game.create(req.body).then(function(dbGame) {
      res.json(dbGame);
    });
  });

  // DELETE route for deleting games
  app.delete("/api/games/:id", function(req, res) {
    db.Game.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbGame) {
      res.json(dbGame);
    });
  });

  // PUT route for updating games
  app.put("/api/games", function(req, res) {
    db.Game.update(
      req.body,
      {
        where: {
          id: req.body.id
        }
      }).then(function(dbGame) {
        res.json(dbGame);
      });
  });
};
