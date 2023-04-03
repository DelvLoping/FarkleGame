/*
 * server.js
 *
 */

// impportation des moduls installés
// const express = require("express");
// const morgan = require("morgan");
// // const favicon = require("serve-favicon");
// const cors = require("cors");
require("dotenv/config");
const DB = require("./db/db.config");

// const app = express();

// // middlewares
// app.use(cors());
// app.options("*", cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// // app.use(favicon("./favicon.ico"));
// app.use(morgan("dev"));

// // les routes
// app.use("/api/v1/gamers", require("./src/routes/gamersRouter"));
// app.use("/api/v1/turn", require("./src/routes/turnRouter"));
// app.use("/api/v1/player", require("./src/routes/playersRouter"));

// test
// app.get("/", (req, res) => {
//   res.status(200).send("Hello World!");
// });
// app.get("*", (req, res) =>
//   res.status(501).send("What the hell are you doing !?!")
// );

/********************************/
/*** Start serveur avec test DB */
DB.sequelize
  .authenticate()
  .then(() => console.log("Database connection OK"))
  .catch((err) => console.log("Database Error", err));

////////////////////////////  Class  //////////////////////////////
class FarkleGame {
  // ----------------------< Game rules constants >-----------------------------------------------------------------------
  // Rules can be parametrized by this globals constants
  //
  // Standard Farkle rules :
  // 5 dices with 6 faces
  // 1 & 5 are scoring
  // 1 is scoring 100 pts
  // 5 is scoring 50 pts
  //
  // Bonus for 3 dices with the same value
  // 3 ace is scoring 1000 pts
  // 3 time the same dice value is scoring 100 pts x the dice value
  constructor() {
    this.NB_DICE_SIDE = 6; // Nb of side of the Dices
    this.SCORING_DICE_VALUE = [1, 5]; // list_value of the side values of the dice who trigger a standard score
    this.SCORING_MULTIPLIER = [100, 50]; // list_value of multiplier for standard score

    this.THRESHOLD_BONUS = 3; // Threshold of the triggering for bonus in term of occurrence of the same slide value
    this.STD_BONUS_MULTIPLIER = 100; // Standard multiplier for bonus
    this.ACE_BONUS_MULTIPLIER = 1000; // Special multiplier for aces bonus
    this.WIN = 10000;

    this.DEFAULT_DICES_NB = 5; // Number of dices by default in the set
    this.current_player = "";
    this.player1 = "";
    this.player2 = "";
    this.score = {};
    this.turn = [];
    this.winner = "";
    this.roll = {};
  }

  initialize_game(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.score = {
      [player1]: [],
      [player2]: [],
    };
    this.roll = {
      [player1]: [],
      [player2]: [],
    };
    this.winner = "";
    this.turn = [];
    this.current_player = "";
  }

  start() {
    this.current_player = this.player1;
  }

  roll_turn(nbDice = null) {
    let roll = this.roll_dice_set(nbDice);
    this.roll[this.player1] = roll;
    this.score[this.current_player].push({
      roll: roll,
      score: this.analyse_score([...roll]),
    });
    let taille_score_current_player =
      this.score[this.current_player].length - 1;
    if (
      this.score[this.current_player][taille_score_current_player].score
        .score === 0
    ) {
      this.change_turn(0);
    }
  }

  change_turn(score) {
    this.turn.push({ player: this.current_player, score: score });
    this.score = {
      [this.player1]: [],
      [this.player2]: [],
    };
    this.is_winner();
    let new_current_player = this.player1;
    if (this.current_player === this.player1) {
      new_current_player = this.player2;
    }
    this.current_player = new_current_player;
  }

  collect() {
    let score_collected = this.score[this.current_player].reduce(function (
      a,
      b
    ) {
      return a + b.score.score;
    },
    0);
    this.change_turn(score_collected);
  }

  set_current_player(nickname) {
    this.current_player = nickname;
  }

  get_current_player() {
    return this.current_player;
  }

  get_current_player_last_score() {
    return this.get_player_last_score(this.current_player);
  }

  get_player_last_score(nickname) {
    let last = this.score[nickname].length - 1;
    return this.score[nickname][last];
  }

  get_current_player_score() {
    return this.get_player_score(this.current_player);
  }

  get_player_score(nickname) {
    return this.score[nickname];
  }

  set_player_last_score(nickname, roll) {
    let last = this.score[nickname].length - 1;
    return (this.score[nickname][last] = roll);
  }

  get_turn() {
    return this.turn;
  }

  get_last_turn() {
    let last = this.turn.length - 1;
    return this.turn[last];
  }

  get_player_turn(player) {
    return this.turn.filter((turn) => {
      if (turn.player === player) {
        return turn;
      }
    });
  }

  get_current_player_turn() {
    return this.get_player_turn(this.current_player);
  }

  get_player_roll(player) {
    return this.roll[player];
  }

  is_winner() {
    let player_score = {
      [this.player1]: 0,
      [this.player2]: 0,
    };

    this.turn.map((turn) => {
      player_score[turn.player] += turn.score;
    });
    if (player_score[this.player1] >= this.WIN) {
      this.winner = this.player1;
    }
    if (player_score[this.player2] >= this.WIN) {
      this.winner = this.player2;
    }
  }

  get_winner() {
    return this.winner;
  }

  roll_dice_set(nb_dice_to_roll = null) {
    /** Generate the occurrence list of dice value for nb_dice_to_roll throw
        :parameters nb_dice_to_roll the number of dice to throw
        :return: occurrence list of dice value
        */

    const dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);
    let dice_index = 0;
    while (dice_index < (nb_dice_to_roll ?? this.DEFAULT_DICES_NB)) {
      const dice_value = Math.floor(Math.random() * this.NB_DICE_SIDE + 1);
      dice_value_occurrence[dice_value - 1] += 1;
      dice_index += 1;
    }
    return dice_value_occurrence;
  }

  analyse_bonus_score(dice_value_occurrence) {
    /** Compute the score for bonus rules and update occurrence list
        :parameters dice_value_occurrence occurrence list of dice value
        :return: a dictionary with
        - 'score' the score from bonus rules
        - 'scoring_dice' occurrence list of scoring dice value
        - 'non_scoring_dice' occurrence list of non scoring dice value
        */
    const scoring_dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);

    let bonus_score = 0;
    let side_value_index = 0;
    while (side_value_index < dice_value_occurrence.length) {
      const side_value_occurrence = dice_value_occurrence[side_value_index];
      const nb_of_bonus = Math.floor(
        side_value_occurrence / this.THRESHOLD_BONUS
      );
      if (nb_of_bonus > 0) {
        const bonus_multiplier =
          side_value_index === 0
            ? this.ACE_BONUS_MULTIPLIER
            : this.STD_BONUS_MULTIPLIER;
        bonus_score += nb_of_bonus * bonus_multiplier * (side_value_index + 1);
        // update the occurrence list after bonus rules for scoring dices and non scoring dices
        dice_value_occurrence[side_value_index] %= this.THRESHOLD_BONUS;
        scoring_dice_value_occurrence[side_value_index] =
          nb_of_bonus * this.THRESHOLD_BONUS;
      }
      side_value_index += 1;
    }

    return {
      score: bonus_score,
      scoring_dice: scoring_dice_value_occurrence,
      non_scoring_dice: dice_value_occurrence,
    };
  }

  analyse_standard_score(dice_value_occurrence) {
    const scoring_dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);
    let standard_score = 0;
    let scoring_dice_value_index = 0;
    while (scoring_dice_value_index < this.SCORING_DICE_VALUE.length) {
      const scoring_value = this.SCORING_DICE_VALUE[scoring_dice_value_index];
      const scoring_multiplier =
        this.SCORING_MULTIPLIER[scoring_dice_value_index];
      standard_score +=
        dice_value_occurrence[scoring_value - 1] * scoring_multiplier;

      scoring_dice_value_occurrence[scoring_value - 1] =
        dice_value_occurrence[scoring_value - 1];
      dice_value_occurrence[scoring_value - 1] = 0;

      scoring_dice_value_index++;
    }
    return {
      score: standard_score,
      scoring_dice: scoring_dice_value_occurrence,
      non_scoring_dice: dice_value_occurrence,
    };
  }

  analyse_score(dice_value_occurrence) {
    const analyse_score_bonus = this.analyse_bonus_score(dice_value_occurrence);
    const score_bonus = analyse_score_bonus["score"];
    const scoring_dice_from_bonus = analyse_score_bonus["scoring_dice"];
    const non_scoring_dice_from_bonus = analyse_score_bonus["non_scoring_dice"];

    const analyse_score_std = this.analyse_standard_score(
      non_scoring_dice_from_bonus
    );
    const score_std = analyse_score_std["score"];
    const scoring_dice_from_std = analyse_score_std["scoring_dice"];
    const non_scoring_dice_from_std = analyse_score_std["non_scoring_dice"];

    const scoring_dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);
    let side_value_index = 0;
    while (side_value_index < this.NB_DICE_SIDE) {
      scoring_dice_value_occurrence[side_value_index] =
        scoring_dice_from_bonus[side_value_index] +
        scoring_dice_from_std[side_value_index];
      side_value_index++;
    }

    return {
      score: score_std + score_bonus,
      scoring_dice: scoring_dice_value_occurrence,
      non_scoring_dice: non_scoring_dice_from_std,
    };
  }
}

////////////////////////////  Variables global   //////////////////////////////

let app = require("express");
let express = app();
let http = require("http").createServer(express);
let fs = require("fs").promises;
var ent = require("ent");
var encode = require("ent/encode");
var decode = require("ent/decode");
let socketServer = require("socket.io")(http);
let registeredSockets = {};
let acceptMessagesBy = {};
const Game = new FarkleGame();
let scoreHistory = {};

////////////////////////////   socket/serveur   //////////////////////////////

express.use(app.static("public"));

express.get("/", (request, response) => {
  fs.readFile("./index.html")
    .then((content) => {
      // Writes response header
      response.writeHead(200, { "Content-Type": "text/html" });
      // Writes response content
      response.end(content);
    })
    .catch((error) => {
      // Returns 404 error: page not found
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Page not found.");
    });
});

express.get("/client.js", (request, response) => {
  fs.readFile("./client.js")
    .then((content) => {
      // Writes response header
      response.writeHead(200, { "Content-Type": "application/javascript" });
      // Writes response content
      response.end(content);
    })
    .catch((error) => {
      // Returns 404 error: page not found
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Page not found.");
    });
});

////////////////////////////  Registers event listener  //////////////////////////////

socketServer.on("connection", (socket) => {
  console.log("A new user is connected...");

  socket.on(">signin", (nickname) => {
    if (isAvaible(nickname) == true) {
      if (Object.keys(registeredSockets).length < 2) {
        registeredSockets[nickname] = socket;
        scoreHistory[nickname] = {};
        socket.emit("<connected", nickname);
        let list = [];
        for (let key in registeredSockets) {
          list.push({
            name: getNicknameBy(registeredSockets[key]),
            current: false,
          });
        }
        socketServer.emit("<users", list);
        if (Object.keys(registeredSockets).length == 2) {
          Game.initialize_game(...list.map((player) => player.name));
          Game.start();
          list = list.map((player) => {
            player.current = player.name == Game.get_current_player();
            return player;
          });
          console.log("il y a 2 joeur on lance le jeu");
          socket.broadcast.emit("<play");
          socket.emit("<play");
          socket.emit("<Turn", list);
          socket.broadcast.emit("<Turn", list);
        }
      } else {
        socket.emit("<error", "room full");
      }
    } else {
      socket.emit("<error", nickname);
    }
  });

  socket.on(">roll", (player, nbDice, currentRoll) => {
    let currentPlayer = Game.get_current_player();
    if (currentRoll) {
      let currentRollSave = Game.get_player_last_score(currentPlayer);
      let isModify = false;
      currentRoll.map((dice, index) => {
        if (dice > currentRollSave?.roll[index]) {
          isModify = true;
        }
      });
      if (isModify) {
        //vire le joueur sale tricheur
      } else {
        if (currentRoll !== currentRollSave?.roll) {
          Game.set_player_last_score(currentPlayer, {
            roll: [...currentRoll],
            score: Game.analyse_score([...currentRoll]),
          });
        }
      }
    }
    let currentPlayerBefore = Game.get_current_player();
    Game.roll_turn(nbDice);
    let currentPlayerAfter = Game.get_current_player();
    let lastRoll = Game.get_player_roll(currentPlayer);
    let score = {
      roll: lastRoll,
      score: {
        score: 0,
        non_scoring_dice: lastRoll,
        scoring_dice: new Array(lastRoll.length).fill(0),
      },
    };
    if (currentPlayerBefore === currentPlayerAfter) {
      score = Game.get_player_last_score(currentPlayer);
    }
    if (currentRoll) {
      currentRoll.map((dice, index) => (dice += score.roll[index]));
    }
    socket.emit("<roll", score.roll, score.score, currentRoll);
    socket.broadcast.emit("<roll", score.roll, score.score, currentRoll);
    if (score.score.score === 0) {
      let list = [];
      for (let key in registeredSockets) {
        list.push({
          name: getNicknameBy(registeredSockets[key]),
          current:
            getNicknameBy(registeredSockets[key]) === Game.get_current_player(),
        });
      }
      let lastTurn = Game.get_last_turn();
      socket.emit("<collect", lastTurn);
      socket.broadcast.emit("<collect", lastTurn);
      socket.emit("<Turn", list);
      socket.broadcast.emit("<Turn", list);
    }
  });

  socket.on(">collect", () => {
    Game.collect();
    let list = [];
    let lastTurn = Game.get_last_turn();
    socket.emit("<collect", lastTurn);
    socket.broadcast.emit("<collect", lastTurn);
    let winner = Game.get_winner();
    if (winner !== "") {
      socket.emit("<Win", winner);
      socket.broadcast.emit("<Win", winner);
    } else {
      for (let key in registeredSockets) {
        list.push({
          name: getNicknameBy(registeredSockets[key]),
          current:
            getNicknameBy(registeredSockets[key]) === Game.get_current_player(),
        });
      }
      socket.emit("<Turn", list);
      socket.broadcast.emit("<Turn", list);
    }
  });

  socket.on(">analyseScore", (roll) => {
    let score = Game.analyse_score([...roll]);
    socket.emit("<analyseScore", score);
  });

  socket.on("disconnect", () => {
    if (getNicknameBy(socket) !== undefined) {
      console.log(getNicknameBy(socket) + " est déconnecté");
      delete registeredSockets[getNicknameBy(socket)];
      let list = [];
      for (let key in registeredSockets) {
        list.push({ name: getNicknameBy(registeredSockets[key]) });
      }
      socket.broadcast.emit("<users", list);
    }
  });
});

////////////////////////////  Fonctions  //////////////////////////////

function isAvaible(nickname) {
  var bool = true;
  if (registeredSockets[nickname] != undefined) {
    bool = false;
  }
  return bool;
}

function getNicknameBy(socket) {
  for (let i in registeredSockets) {
    if (registeredSockets[i] === socket) {
      return i;
    }
  }
}

function getAllNicknames() {
  let list = new Array();
  for (let i in registeredSockets) {
    list.push(i);
  }
  return list;
}

function sum(array) {
  return array.reduce(function (a, b) {
    return a + b;
  }, 0);
}

// Server listens on port 8080

http.listen(8080);
