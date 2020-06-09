/*
 * 
 * A heroku server based on 
 * https://github.com/rioter00/Collab-Hub
 *
 */
const server = "https://sonic-arts-server.herokuapp.com";
const maxAPI = require('max-api');
const io     = require('socket.io-client');
const socket = io.connect(server);

socket.on('connect', () => {
    maxAPI.outlet("connected");
});
/*
 *
 * From Max
 *
 */
maxAPI.addHandler('name', (x) => {
  // name change
  socket.emit('name', x);
});
maxAPI.addHandler('users', () => {
  // users list
  socket.emit('users');
});
maxAPI.addHandler('chats', (x) => {
  // chats message
  socket.emit('chats', x);
});
maxAPI.addHandler('chat', (x) => {
  // add a chat
  socket.emit('chat', x);
});
maxAPI.addHandler('event', (head,...rest) => {
  // add an event
  socket.emit('event', {header:head, values:rest});
});
maxAPI.addHandler('control', (head,...rest) => {
  // update controls
  socket.emit('control',  {header:head, values:rest});
});
maxAPI.addHandler('dump', () => {
  socket.emit('dump');
});
maxAPI.addHandler('clear', () => {
  socket.emit('clear');
});
// maxAPI.addHandler('event', (y, ...z) => {
//   // add an event
//   const x = {
//     head: y,
//     value: z 
//   }
//   socket.emit('event', x);
// });

// maxAPI.addHandler('control', (head, ...vals) => {
//   console.log("val length: " + vals.length);
//   const newControl = {
//     header: head,
//     values: vals
//   };
//   console.log(newControl);
//   socket.emit('control', newControl);
//   console.log('sending control: ' + head + " - " + vals);
// });


/*
 *
 * To Max
 *
 */

socket.on('users', function(data) {
  maxAPI.outlet(data);
});
socket.on('console', function(data) {
  maxAPI.outlet(data);
});
socket.on('chat', function(data) {
  maxAPI.outlet(data);
});
socket.on('event', function(data) {
  maxAPI.outlet(data);
});
socket.on('control', function(data) {
  maxAPI.outlet(data);
});
socket.on('dump', function(data) {
  maxAPI.outlet(data);
});
// socket.on('control', function(head, vals) {
//   console.log('control ' + head + " " + vals);
//   // use spread operator regardless if single or multiple datum.
//   // console.log('val length: ' + vals);
//   if (vals == null || vals == 'undefined') {
//     console.log('header undefined');
//     maxAPI.outlet(["control", head, "noHeader"]);
//   } else {
//     maxAPI.outlet(["control", head, ...vals]);
//   }
// });
