$(document).ready(function() {
  /* global moment */

  // listContainer holds all of our games
  var listContainer = $(".list-container");
  var inProgress = $(".in-progress");
  var completed = $(".completed");
  var wishList = $(".wishlist");
  var gameCategorySelect = $("#category");
  // Click events for the edit and delete buttons
  $(".list-container").on("click", "button.delete", handleGameDelete);
  $(".list-container").on("change", "select.edit", handleGameEdit);
  $("#popcorn").on("click", "button.steam", handleSteamStuff);
  // Variable to hold our games
  var games;

  // The code below handles the case where we want to get list games for a specific player
  // Looks for a query param in the url for player_id
  var url = window.location.search;
  var playerId;
  var rawPlayerId;
  var steamID;

  if (url.indexOf("?player_id=") !== -1) {
    playerId = url.split("=")[1];
    rawPlayerId = playerId;
    $("#specific-player").attr("href", "/cms?player_id=" + playerId);
    getGames(playerId);
    console.log(playerId);
  }
  // If there's no playerId we just get all games as usual
  else {
    getGames();
  }

  // This function grabs games from the database and updates the view
  function getGames(player) {
    playerId = player || "";
    if (playerId) {
      playerId = "/?player_id=" + playerId;
    }
    $.get("/api/games" + playerId, function(data) {
      console.log("Games", data);
      games = data;
      if (!games || !games.length) {
        displayEmpty(player);
      }
      else {
        initializeRows();
      }
    });
  }

  // This function does an API call to delete games
  function deleteGame(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/games/" + id
    })
    .done(function() {
      getGames(gameCategorySelect.val());
    });
  }

  // InitializeRows handles appending all of our constructed game HTML inside listContainer
  function initializeRows() {
    //listContainer.empty();
    inProgress.empty();
    completed.empty();
    wishList.empty();
    var inProgressGames = [];
    var completedGames = [];
    var wishListGames = [];
    $(".playerHeading").text(games[0].Player.name + "'s List");
    console.log(games);
    console.log(games[0].Player.steamID);
    if (games[0].Player.steamID != "") {
      steamID = games[0].Player.steamID;
      var steamBtn = $("<button>");
      steamBtn.text("Add Steam Games");
      steamBtn.addClass("steam btn btn-default");
      steamBtn.attr("value", games[0].Player.steamID);
      $("#popcorn").append(steamBtn);
    }
    for (var i = 0; i < games.length; i++) {
      if (games[i].status === "in-progress") {
        inProgressGames.push(createNewRow(games[i]));
      } else if (games[i].status === "completed") {
        completedGames.push(createNewRow(games[i]));
      } else {
        wishListGames.push(createNewRow(games[i]));
      }
      //gamesToAdd.push(createNewRow(games[i]));
    }
    inProgress.append(inProgressGames);
    completed.append(completedGames);
    wishList.append(wishListGames);
  }

  // This function constructs a game's HTML
  function createNewRow(game) {
    var formattedDate = new Date(game.createdAt);
    formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
    var newGamePanel = $("<div>");
    newGamePanel.addClass("panel panel-default");
    var newGamePanelHeading = $("<div>");
    newGamePanelHeading.addClass("panel-heading");
    var deleteBtn = $("<button>");
    deleteBtn.text("x");
    deleteBtn.addClass("delete btn btn-danger");
    var statusSlct = $("<select>");
    if (game.status === "in-progress") {
      statusSlct.append('<option value="in-progress" selected="selected">In-Progress</option>');
      statusSlct.append('<option value="completed">Completed</option>');
      statusSlct.append('<option value="wishlist">Wishlist</option>');
    } else if (game.status === "completed") {
      statusSlct.append('<option value="in-progress">In-Progress</option>');
      statusSlct.append('<option value="completed" selected="selected">Completed</option>');
      statusSlct.append('<option value="wishlist">Wishlist</option>');
    } else {
      statusSlct.append('<option value="in-progress">In-Progress</option>');
      statusSlct.append('<option value="completed">Completed</option>');
      statusSlct.append('<option value="wishlist" selected="selected">Wishlist</option>');
    }
    statusSlct.addClass("edit btn btn-info");
    var newGameTitle = $("<h3>");
    var newGameDate = $("<small>");
    var newGamePlayer = $("<h5>");
    // newGamePlayer.text("Written by: " + game.Player.name);
    newGamePlayer.css({
      float: "right",
      color: "blue",
      "margin-top":
      "-10px"
    });
    var newUrl = $("<a>");
    var newImg = $("<img>");
    newImg.attr("src", game.cover);
    newUrl.attr("href", game.url);
    newGameTitle.append(newUrl);
    newUrl.text(game.title + " ");
    newGameDate.text(formattedDate);
    newGameTitle.append(newGameDate);
    newGamePanelHeading.append(deleteBtn);
    newGamePanelHeading.append(statusSlct);
    newGamePanelHeading.append(newGameTitle);
    newGamePanelHeading.append(newGamePlayer);
    newUrl.prepend(newImg);
    newGamePanel.append(newGamePanelHeading);
    newGamePanel.data("game", game);
    return newGamePanel;
  }

  // This function figures out which game we want to delete and then calls deleteGame
  function handleGameDelete() {
    var currentGame = $(this)
      .parent()
      .parent()
      .data("game");
    deleteGame(currentGame.id);
  }

  // This function figures out which game we want to edit and takes it to the appropriate url
  function handleGameEdit() {
    console.log($(this));
    var currentGame = $(this)
      .parent()
      .parent()
      .data("game");
    console.log(currentGame.id);
    console.log(this.value);
    $.ajax({
      method: "PUT",
      url: "/api/games",
      data: {
        status: this.value,
        id: currentGame.id
      }
    })
    .done(function() {
      window.location.href = window.location.search;
    });
  }

  function handleSteamStuff() {
    console.log($(this));
    $.get("/api/steam/" + steamID + "/games/recent/" + rawPlayerId)
    .done(function(response) {
      //console.log(response.response.games[0].name)
      // for (var i = 0; i < response.response.games.length; i++) {
      //   client.games({
      //     fields: ['id', 'name', 'url', 'cover'], // Return all fields
      //     limit: 3, // Limit to 5 results
      //     search: response.response.games[0].name
      //   }).then(response => {
      // // response.body contains the parsed JSON response to this query

      //     db.Game.create({
      //     title: response.name,
      //     game_id: response.id,
      //     url: response.url,
      //     cover: response.cover.url,
      //     status: "in-progress",
      //     PlayerId: rawPlayerId
      //   }
      //       ).then(function(dbGame) {
      //       res.json(dbGame);
      //     });
      //   }).catch(error => {
      //     throw error;
      //   });
      // }
      window.location.href = window.location.search;
  });
}

  // This function displays a messgae when there are no games
  function displayEmpty(id) {
    var query = window.location.search;
    var partial = "";
    if (id) {
      partial = " for Player #" + id;
    }
    //listContainer.empty();
    inProgress.empty();
    completed.empty();
    wishList.empty();
    var messageh2 = $("<h2>");
    messageh2.css({ "text-align": "center", "margin-top": "50px" });
    messageh2.html("No games yet" + partial + ", navigate <a href='/cms" + query +
    "'>here</a> in order to get started.");
    listContainer.append(messageh2);
  }

});
