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

socketClient.on('<private', (content) => {
  const event = new Date();
  let mes = document.createElement('div');
  mes.setAttribute('id','message');
  let sender = document.createElement('span');
  sender.setAttribute('class','bg-success chip');
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

socketClient.on('<image', (content) => {
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
  let img = document.createElement('img');
  img.classList.add('img-responsive');
  img.src = content.image;
  mes.appendChild(sender);
  mes.appendChild(date);
  mes.appendChild(img);
  display.prepend(mes);
});

socketClient.on('<private-image', (content) => {
  const event = new Date();
  let mes = document.createElement('div');
  mes.setAttribute('id','message');
  let sender = document.createElement('span');
  sender.setAttribute('class','bg-success chip');
  sender.textContent = content["sender"];
  let date = document.createElement('date');
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' ,hour: 'numeric', minute: 'numeric', second: 'numeric' };
  date.style.color = 'grey';
  date.style.fontSize = 'smaller';
  date.textContent = event.toLocaleDateString('fr-FR',options);
  let img = document.createElement('img');
  img.classList.add('img-responsive');
  img.src = content.image;
  mes.appendChild(sender);
  mes.appendChild(date);
  mes.appendChild(img);
  display.prepend(mes);
});

socketClient.on('<users',(liste) =>{
  let dom = users.querySelector('thead');
  dom.innerHTML = "<tr><th>"+liste.length+" utilisateurs connecté </th></tr>";;
  let tbody = users.querySelector('tbody');
  tbody.innerHTML = '';
  liste.map((user,i) => {
    var td = document.createElement("td");
    td.setAttribute('id',i);
    var name = document.createElement('span');
    name.setAttribute('class','form-inline');
    name.innerHTML = user.name;
    name.onclick = function () {
      event.preventDefault();
      modal.querySelector('#destinataire').innerHTML= user.name;
      modal.classList.toggle('active');
    }
    var label = document.createElement('label');
    label.classList.toggle('form-switch');
    var input = document.createElement('input');
    input.setAttribute("type", "checkbox");
    if(user.accept===true)
    {
      input.checked = true;
    }else{
      name.style.color = 'grey';
    }
    input.addEventListener("change", (event) => {
      if(event.target.checked===true)
      {
        event.target.parentNode.querySelector('span').style.color = null;
        socketClient.emit('>accept',event.target.parentNode.querySelector('span').innerHTML);
      }
      else
      {
        event.target.parentNode.querySelector('span').style.color = 'grey';
        socketClient.emit('>block',event.target.parentNode.querySelector('span').innerHTML);
      }
    });
    var i = document.createElement('i');
    i.classList.toggle('form-icon');
    name.disabled = true;
    label.appendChild(input);
    label.appendChild(i);
    label.appendChild(name);
    td.appendChild(label);
    var ligne = document.createElement('tr');
    ligne.appendChild(td);
    tbody.appendChild(ligne);
  });
  let close = document.querySelector("a.btn-clear");
  close.addEventListener("click", () => {
    modal.classList.remove('active');
  });
});
