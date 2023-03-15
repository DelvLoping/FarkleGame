/*
 * server.js
 *
 */
const prompt=require("prompt-sync")({sigint:true});  

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
    constructor(){
        this.NB_DICE_SIDE = 6; // Nb of side of the Dices
        this.SCORING_DICE_VALUE = [1, 5]; // list_value of the side values of the dice who trigger a standard score
        this.SCORING_MULTIPLIER = [100, 50]; // list_value of multiplier for standard score

        this.THRESHOLD_BONUS = 3; // Threshold of the triggering for bonus in term of occurrence of the same slide value
        this.STD_BONUS_MULTIPLIER = 100; // Standard multiplier for bonus
        this.ACE_BONUS_MULTIPLIER = 1000; // Special multiplier for aces bonus

        this.DEFAULT_DICES_NB = 5; // Number of dices by default in the set
    }

    roll_dice_set(nb_dice_to_roll) {
        /** Generate the occurrence list of dice value for nb_dice_to_roll throw
        :parameters nb_dice_to_roll the number of dice to throw
        :return: occurrence list of dice value
        */

        const dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);
        let dice_index = 0;
        while (dice_index < nb_dice_to_roll) {
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
            const nb_of_bonus = Math.floor(side_value_occurrence / this.THRESHOLD_BONUS);
            if (nb_of_bonus > 0) {
                const bonus_multiplier = side_value_index === 0 ? this.ACE_BONUS_MULTIPLIER : this.STD_BONUS_MULTIPLIER;
                bonus_score += nb_of_bonus * bonus_multiplier * (side_value_index + 1);
                // update the occurrence list after bonus rules for scoring dices and non scoring dices
                dice_value_occurrence[side_value_index] %= this.THRESHOLD_BONUS;
                scoring_dice_value_occurrence[side_value_index] = nb_of_bonus * this.THRESHOLD_BONUS;
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
            const scoring_multiplier = this.SCORING_MULTIPLIER[scoring_dice_value_index];
            standard_score += dice_value_occurrence[scoring_value - 1] * scoring_multiplier;

            scoring_dice_value_occurrence[scoring_value - 1] = dice_value_occurrence[scoring_value - 1];
            dice_value_occurrence[scoring_value - 1] = 0;

            scoring_dice_value_index++;
        }
        return {
            'score': standard_score,
            'scoring_dice': scoring_dice_value_occurrence,
            'non_scoring_dice': dice_value_occurrence
        };
    }

    analyse_score(dice_value_occurrence) {
        const analyse_score_bonus = this.analyse_bonus_score(dice_value_occurrence);
        const score_bonus = analyse_score_bonus['score'];
        const scoring_dice_from_bonus = analyse_score_bonus['scoring_dice'];
        const non_scoring_dice_from_bonus = analyse_score_bonus['non_scoring_dice'];
        
        const analyse_score_std = this.analyse_standard_score(non_scoring_dice_from_bonus);
        const score_std = analyse_score_std['score'];
        const scoring_dice_from_std = analyse_score_std['scoring_dice'];
        const non_scoring_dice_from_std = analyse_score_std['non_scoring_dice'];
        
        const scoring_dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);
        let side_value_index = 0;
        while (side_value_index < this.NB_DICE_SIDE) {
            scoring_dice_value_occurrence[side_value_index] = scoring_dice_from_bonus[side_value_index] +
                scoring_dice_from_std[side_value_index];
            side_value_index++;
        }
        
        return {
            'score': score_std + score_bonus,
            'scoring_dice': scoring_dice_value_occurrence,
            'non_scoring_dice': non_scoring_dice_from_std
        };
    }  
}

function sum(array)
{
    return array.reduce(function (a, b) { return a + b; }, 0)
}


let app = require('express')
let express = app()
let http = require('http').createServer(express);
let fs = require('fs').promises;
var ent = require('ent');
var encode = require('ent/encode');
var decode = require('ent/decode');
express.use(app.static('public'));

express.get('/', (request, response) => {
  fs.readFile('./index.html')
    .then((content) => {
      // Writes response header
      response.writeHead(200, { 'Content-Type': 'text/html' });
      // Writes response content
      response.end(content);
    })
    .catch((error) => {
      // Returns 404 error: page not found
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Page not found.');
    });
});

express.get('/client.js', (request, response) => {
  fs.readFile('./client.js')
    .then((content) => {
      // Writes response header
      response.writeHead(200, { 'Content-Type': 'application/javascript' });
      // Writes response content
      response.end(content);
    })
    .catch((error) => {
      // Returns 404 error: page not found
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Page not found.');
    });
});

/*
 * Binds a socket server to the current HTTP server
 *
 */
let socketServer = require('socket.io')(http);
let registeredSockets = {};
let acceptMessagesBy = {};
let Game=new FarkleGame();

// Registers an event listener ('connection' event)
socketServer.on('connection', (socket) => {
  console.log('A new user is connected...');

  


  /*
   * Registers an event listener
   *
   * - The first parameter is the event name
   * - The second parameter is a callback function that processes
   *   the message content.
   *
  socket.on('hello', (content) => {
    console.log(content + ' says hello!');

    // Pushes an event to all the connected clients
    socketServer.emit('notification', content + ' says hello!');

    // Pushes an event to the client related to the socket object
    socket.emit('hello', 'Hi ' + content + ', wassup mate?');
  });*/

  socket.on('>signin', (nickname) => {
      if (isAvaible(nickname) == true ) {
        if(Object.keys(registeredSockets).length<2)
        {
          registeredSockets[nickname] = socket;

          // console.log(nickname + ' est connecté');
          socket.emit('<connected', nickname);
          // socket.broadcast.emit('<notification', nickname + " à rejoins le chat");
          let list = [];
          for(let key in registeredSockets)
          {
            list.push({name : getNicknameBy(registeredSockets[key])});
          }
          socketServer.emit('<users', list);
          console.log(Object.keys(registeredSockets).length)
          if(Object.keys(registeredSockets).length==2)
          {
            console.log("il y a 2 joeur on lance le jeu")
            socket.broadcast.emit('<play' );
            socket.emit('<play' );
            socket.to(registeredSockets[list[0].name].id).emit('<urTurn');
          }
        }else {
          socket.emit('<error', 'room full');
        }
      }
      else {
        socket.emit('<error', nickname);
      }
  });

  socket.on('>message',(content) =>{
  });


  socket.on('disconnect', () => {
    if(getNicknameBy(socket)!==undefined){
      console.log(getNicknameBy(socket) + ' est déconnecté');
      delete registeredSockets[getNicknameBy(socket)];
      let list = [];
      for(let key in registeredSockets)
      {
        list.push({name : getNicknameBy(registeredSockets[key])});
      }
      socket.broadcast.emit('<users',list);
    }
  });
});

function isAvaible(nickname) {
  var bool = true;
  if (registeredSockets[nickname] != undefined) {
    bool = false;
  }
  return bool;
}

function getNicknameBy(socket) {
  for(let i in registeredSockets)
  {
    if(registeredSockets[i] === socket)
    {
      return i
    }
  }
}

function getAllNicknames(){
  let list = new Array();
  for (let i in registeredSockets) {
    list.push(i);
  }
  return list;
}
// Server listens on port 8080
http.listen(8080);