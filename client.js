/*
 * client.js
 *
 */

let socketClient = io();
let signin= document.forms.namedItem('signin');
signin.addEventListener("submit", (event) => {
    let nickname = signin.elements.namedItem("nickname").value;
    socketClient.emit('>signin', nickname);
    event.preventDefault();
    document.querySelector('div.toast-error').classList.add('hidden');
});
let sendMes= document.forms.namedItem('send');
sendMes.addEventListener("submit", (event) => {
    let message = sendMes.elements.namedItem("message");
    socketClient.emit('>message', message.value);
    message.value = '';
    event.preventDefault();
});
let sendPrv= document.forms.namedItem('private');
sendPrv.addEventListener("submit", (event) => {
    let message = sendPrv.elements.namedItem("message");
    socketClient.emit('>private',{recipient : modal.querySelector('#destinataire').innerHTML , text : message.value});
    message.value = '';
    modal.classList.remove('active');
    event.preventDefault();
});

let sendPic = document.querySelector('form[name="send"] input[type="file"]');
sendPic.addEventListener("change", (event) => {
    var input = event.target;

    var reader = new FileReader();
    
    reader.onload = function(){
      var dataURL = reader.result;
      socketClient.emit('>image',dataURL);
    };

    reader.readAsDataURL(input.files[0]);
});

let sendPrivPic = document.querySelector('form[name="private"] input[type="file"]');
sendPrivPic.addEventListener("change", (event) => {
    var input = event.target;

    var reader = new FileReader();
    
    reader.onload = function(){
      var dataURL = reader.result;
      modal.classList.remove('active');
      socketClient.emit('>private-image',{recipient : modal.querySelector('#destinataire').innerHTML, image : dataURL});
    };

    reader.readAsDataURL(input.files[0]);
});



//let sendForm = document.forms.namedItem('send');
let display = document.querySelector('div#display');
let modal = document.querySelector('div.modal-md');
let users = document.querySelector('div#user');
let taleauScore = document.querySelector(".container2")

/*
 * Emits an event to the server
 *
 * - The first parameter is the event name.
 * - The second parameter is the message content: it can be a number,
 *   a string or an object.
 *
socketClient.emit('hello', 'Olivier');


 * Registers event listeners
 *
 * - The first parameter is the event name
 * - The second parameter is a callback function that processes
 *   the message content.
 */
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
  //sendForm.setAttribute('class','mt-2');
  //sendForm.getElementsByTagName('span')[0].innerHTML = nickname;
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

socketClient.on('<message', (content) => {
  const event = new Date();
  let mes = document.createElement('div');
  mes.setAttribute('id','message');
  let sender = document.createElement('span');
  sender.setAttribute('class','bg-primary chip');
  sender.textContent = content["sender"];
  let date = document.createElement('date');
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' ,hour: 'numeric', minute: 'numeric', second: 'numeric' };
  date.style.color = 'grey';
  date.style.fontSize = 'smaller';
  date.textContent = event.toLocaleDateString('fr-FR',options);
  let p = document.createElement('p');
  p.textContent = content.text;
  mes.appendChild(sender);
  mes.appendChild(date);
  mes.appendChild(p);
  display.prepend(mes);
});


socketClient.on('<users',(liste) =>{
  console.log(liste)
  let playerBoard = document.querySelector(".player")
  let player1 = playerBoard.querySelector(".player-information1")
  let player2 = playerBoard.querySelector(".player-information2")
  player1.querySelector(".nom").innerHTML=liste[0]?.name??""
  player2.querySelector(".nom").innerHTML=liste[1]?.name??""
});

socketClient.on('<play',() =>{
  console.log("play")
  taleauScore.querySelector("tbody").innerHTML=""
});

socketClient.on('<urTurn',() =>{
  console.log("myturn")
  document.querySelector(".button-roll").classList.remove("d-none")
});

