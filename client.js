/*
 * client.js
 *
 */

////////////////////////////  Elements du dom et variable global //////////////////////////////

let display = document.querySelector('div#display');
let modal = document.querySelector('div.modal-md');
let users = document.querySelector('div#user');
let dice1 = document.querySelector("#dice1")
let dice2 = document.querySelector("#dice2")
let dice3 = document.querySelector("#dice3")
let dice4 = document.querySelector("#dice4")
let dice5 = document.querySelector("#dice5")
let dices=[dice1,dice2,dice3,dice4,dice5]
let rolltBtn= document.querySelector('.button-roll');
let collectBtn= document.querySelector('.button-collect');
let socketClient = io();
let nickname = ""
let playerBoard = document.querySelector(".player")
let player1 = playerBoard.querySelector(".player-information1")
let player2 = playerBoard.querySelector(".player-information2")
let infoGame = document.querySelector("#infoGame").querySelector(".toast")
let currentPlayer = ''
let selectDiceBoard = document.querySelector(".card-zone-distribution")
let scoreTemp = document.querySelector("#scoreTemp").querySelector(".toast")
let turnScore = []
let fixedDice = []
let fixedScore = 0
let tabScore= document.querySelector('.table-score')
////////////////////////////  Fonctions  //////////////////////////////

function generateRandomInt(min,max){
  return Math.floor((Math.random() * (max-min)) +min);
}

function generateRandomIntWithout(min,max,notThisNumber){
  let number = generateRandomInt(min,max)
  console.log(number)
  if(notThisNumber.includes(number)){
    number=generateRandomIntWithout(min,max,notThisNumber)
  }
  return number
}

function loadButton(bool){
  if(bool){
    rolltBtn.classList.add('loading');
    collectBtn.classList.add('loading');
  }else{
    rolltBtn.classList.remove('loading');
    collectBtn.classList.remove('loading');
  }
}

async function asyncRollDice(nbTurn,dice){
  let index=0
  let number = 0
  while (index<nbTurn){
    await new Promise(resolve => setTimeout(resolve, 50));
    number=generateRandomInt(1,6)
    setDiceNumber(dices.indexOf(dice),number)
    index+=1
  }
  return dice
}

function setDiceNumber(idDice,number){
  dices[idDice].src=`./img/Vectorexit${number}.png`
  dices[idDice].setAttribute("value", number)
}

function getDiceAlreadySet(){
  let roll = [...dices]
  return roll.map((dice,id)=>{
    if(dice.classList.contains('selected')){
      return id
    }
  }).filter((id) => id !== undefined)
}

function setDicesFromRoll(roll){
  let nbDiceRestant=roll.length-1
  let diceAlreadySet = getDiceAlreadySet()
  roll.map((number,id)=>{
    while(number>0){
      console.log(roll,diceAlreadySet,nbDiceRestant)
      idDice=generateRandomIntWithout(0,nbDiceRestant,diceAlreadySet)
      diceAlreadySet.push(idDice)
      setDiceNumber(idDice,id+1)
      number-=1
    }
  })
}

function changeCurrentPlayer(players){
  players.map((player)=>{
    if(player.current){
      playerBoard.querySelector(`#${player.name}`).querySelector(".player-information-score").classList.add("bg-primary")
    }else{
      playerBoard.querySelector(`#${player.name}`).querySelector(".player-information-score").classList.remove("bg-primary")
    }
  })
}


function hideButton(){
  document.querySelector(".button-collect").classList.add("d-none")
  document.querySelector(".button-roll").classList.add("d-none")
}

function showButton(){
  document.querySelector(".button-collect").classList.remove("d-none")
  document.querySelector(".button-roll").classList.remove("d-none")
}

function hideScoreTemp(){
  scoreTemp.classList.add("d-none")
}

function showScoreTemp(){
  scoreTemp.classList.remove("d-none")
}

function changeButtonState(bool){
  if(bool){
    showButton()
  }else{
    hideButton()
  }
}

function changeScoreTempState(bool){
  if(bool){
    showScoreTemp()
  }else{
    hideScoreTemp()
  }
}

function changeLayoutOnTurn(bool){
  changeButtonState(bool)
  changeScoreTempState(bool)
}

function addDiceToSelectBoard(dice){
  let index=0
  while (index<selectDiceBoard.children.length){
    if(selectDiceBoard.children[index].innerHTML=="")
    {
      selectDiceBoard.children[index].appendChild(dice)
      index=selectDiceBoard.children.length
    }else{
      index+=1
    }
  }
  if(selectDiceBoard.children.length===5){
    rolltBtn.disabled=true
  }
  let roll=calculeScoreSelected(true)
  emitAnalyseScore(roll)

}

function removeDiceToSelectBoard(dice){
  dice.classList.remove('selected')
  selectDiceBoard.querySelector(`#${dice.id}`).parentNode.innerHTML = ''
  let roll=calculeScoreSelected(true)
  emitAnalyseScore(roll)

}

function emitAnalyseScore(roll){
  console.log(roll)
  socketClient.emit('>analyseScore',roll)
}

function calculeScoreSelected(fixed=false){
  let roll = new Array(6).fill(0)
  let index=0
  while (index<selectDiceBoard.children.length){
     if (selectDiceBoard.children[index].innerHTML !== "" && (!fixed || !fixedDice.includes(selectDiceBoard.children[index].firstChild.id))) {
      let indexDice=parseInt(selectDiceBoard.children[index].firstChild.getAttribute("value"))-1
      roll[indexDice]+=1
    }
    index+=1
  }
  return roll
}

function afficheInInfoGame(text,save=false){
  console.log(text)
  infoGame.textContent=text
  if(save){
    infoGame.setAttribute("saveTurn",text)
  }
  
}

function getSaveInfoGame(){
  return infoGame.getAttribute("saveTurn")
}

function sum(array)
{
    return array.reduce(function (a, b) { return a + b; }, 0)
}

function clearBoard(){
  let index=0
  while (index<selectDiceBoard.children.length){
    if(selectDiceBoard.children[index].innerHTML!==""){
      selectDiceBoard.children[index].innerHTML=""
    }
    index+=1
  }
  dices.map((dice)=>{dice.classList.remove("selected")})
}

function clearCounter(){
  scoreTemp.innerHTML=0
}

function setFixedDice(){
  dices.map((dice)=>{
    if(dice.classList.contains('selected')){
      fixedDice.push(dice.id)
    }
  })
}

function setFixedScore(){
  fixedScore=parseInt(scoreTemp.textContent)
}

////////////////////////////  Ecouteur du client //////////////////////////////

let signin= document.forms.namedItem('signin');
signin.addEventListener("submit", (event) => {
  nickname = signin.elements.namedItem("nickname").value;
  socketClient.emit('>signin', nickname);
  event.preventDefault();
  document.querySelector('div.toast-error').classList.add('hidden');
});

rolltBtn.addEventListener('click',(event) => {
  console.log('test clique')
  loadButton(true)
  let scored = calculeScoreSelected()
  let sumScored = sum(scored)
  let nbDice = (scored.length-1) - sumScored
  if(sumScored===0){
    scored=null
  }
  console.log(scored,nbDice,sumScored)
  setFixedDice()
  setFixedScore()
  socketClient.emit('>roll',nickname,nbDice,scored)
});

collectBtn.addEventListener('click',(event) => {
  console.log('test clique collect ')
  socketClient.emit('>collect')
});

dices.map((dice)=>{
  dice.addEventListener('click',(event) => {
    console.log(turnScore)
    if(turnScore.length>0){
      console.log(turnScore[dice.getAttribute("value")-1],turnScore[dice.getAttribute("value")-1]!==0)
      if(turnScore[dice.getAttribute("value")-1]!==0){
        dice.classList.toggle('selected')
        if(dice.classList.contains('selected'))
        {
          let diceClone =dice.cloneNode(true)
          diceClone.addEventListener('click',(event) => {
            removeDiceToSelectBoard(dice)
          });
          addDiceToSelectBoard(diceClone)
        }else{
          removeDiceToSelectBoard(dice)
        }
      }else{
        let saveHelperText = getSaveInfoGame()
        afficheInInfoGame(`${dice.getAttribute("value")} n'a pas scoré de points`)
        setTimeout(function() {
          afficheInInfoGame(saveHelperText);
        }, 5000);
      }
    }
    
  
  });
});


////////////////////////////  Ecouteur de socket //////////////////////////////

socketClient.on('<notification', (content) => {
  let notif = document.createElement('div');
  notif.setAttribute('id','notif');
  notif.textContent = content;
  notif.style.color = 'grey';
  notif.style.fontStyle = 'italic';
  display.prepend(notif);
});

/*
socketClient.on('hello', (content) => {
  console.log(content);
});*/

socketClient.on('<connected',(nickname) =>{
  document.querySelector('body').style.justifyContent = "flex-start";
  document.querySelector('body').style.backgroundColor ="#fff";
  document.querySelector('div.empty').classList.add('hidden');
  document.querySelector('div.container').classList.remove('hidden')
  modal.querySelector('.input-group-addon').innerHTML = nickname;
});


socketClient.on('<error',(nickname) =>{
  let divError = document.querySelector('div.toast-error');
  console.log(divError)
  let name = document.createElement('span');
  name.textContent = nickname;
  console.log(nickname)
  let p = document.createElement('p');
  p.innerHTML =  'the nickname ';
  p.appendChild(name);
  p.innerHTML = p.innerHTML+' is already used.';
  p.style.borderRadius = '.25rem';
  p.style.fontWeight = '600';
  p.style.padding = '.25em .5em .25em';

  divError.innerHTML="";
  divError.appendChild(p);
  divError.classList.remove('hidden');
});

socketClient.on('<roll',(roll,score,currentRoll) =>{
  console.log(roll,score,currentRoll)
  let promises=[]
    dices.map((dice)=>{
      if(!dice.classList.contains("selected"))
      {
        let random =generateRandomInt(6,10)
        promises.push(asyncRollDice(random,dice))
      }
    })
    Promise.all(promises).then((res)=>{
      loadButton(false)
      setDicesFromRoll(roll)
      console.log(currentPlayer,nickname)
      if(currentPlayer.name===nickname)
      {
        if(turnScore.length>0){
          rolltBtn.disabled=true
          collectBtn.disabled=true
        }
        let helperText='Vos possibilités : '
        turnScore=score.scoring_dice
        score.scoring_dice.map((dice,index)=>{
          if(dice>0){
            helperText+=new Array(dice).fill(index+1).join('-')+" "
          }
        })
        afficheInInfoGame(helperText,true)
        
      }else{
        if(currentRoll){
          setDicesFromRoll(currentRoll)
        }
      }
    })
});

socketClient.on('<analyseScore',(score) =>{
  console.log(score)
  scoreTemp.textContent=fixedScore+parseInt(score.score)
  if(score.score>0){
    rolltBtn.disabled=false
    collectBtn.disabled=false
  }else{
    rolltBtn.disabled=true
  }
});



socketClient.on('<users',(liste) =>{
  console.log(liste)
  let p1Name=liste[0]?.name??""
  let p2Name=liste[1]?.name??""
  let you= "You"
  player1.id=liste[0]?.name??""
  player1.querySelector(".nom").innerHTML=p1Name===nickname?you:p1Name
  player2.id=liste[1]?.name??""
  player2.querySelector(".nom").innerHTML=p2Name===nickname?you:p2Name
});

socketClient.on('<play',() =>{
  console.log("play")
  tabScore.querySelector("tbody").innerHTML=""
  afficheInInfoGame("Lancement du jeu")
  infoGame.classList.remove("d-none")
});

socketClient.on('<Turn',(players) =>{
  console.log(players)
  let id=players.findIndex(obj => obj.name === nickname);
  let idCurrent = players.findIndex(obj => obj.current );
  changeCurrentPlayer(players)
  currentPlayer=players[idCurrent]
  changeLayoutOnTurn(players[id].current)
  clearBoard()
  clearCounter()
  turnScore=[]
  fixedDice=[]
  rolltBtn.disabled=false
  if(players[id].current){
    console.log("myturn")
    afficheInInfoGame("C'est votre tour",true)
  }else{
    console.log(players[1-id].name+" turn")
    afficheInInfoGame(`Tour de ${players[1-id].name}`,true)
  }
  
});

socketClient.on('<collect',(turn) =>{
  console.log(turn)
  let score = playerBoard.querySelector(`#${turn.player}`).querySelector(".player-information-score").querySelector('.score')
  score.innerHTML=parseInt(score.innerHTML)+turn.score

  if(nickname===turn.player){
    let tbody = tabScore.querySelector('tbody')
    let tr = document.createElement('tr');
    let thTurn = document.createElement('th');
    thTurn.innerHTML=tbody.children.length+1
    let thScore = document.createElement('th');
    thScore.innerHTML=turn.score
    tr.appendChild(thTurn)
    tr.appendChild(thScore)
    tbody.appendChild(tr)
  }
});


socketClient.on('<Win',(winner) =>{
  if(nickname===winner){
    afficheInInfoGame(`Vous avez gagné la partie`,true)
  }else{
    afficheInInfoGame(`${winner} gagne la partie`,true)
  }
  infoGame.classList.add("bg-secondary")
  infoGame.classList.add("bg-success")
  turnScore=[]
  fixedDice=[]
  clearBoard()
  clearCounter()
  changeLayoutOnTurn(false)
});

