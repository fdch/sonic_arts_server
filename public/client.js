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
  var event = {
    header : head,
    values : rest
  };
  socket.emit('event', event);
});
maxAPI.addHandler('control', (head,...rest) => {
  // update controls
  var control = {
    header : head,
    values : rest
  };
  socket.emit('control',  control);
});
maxAPI.addHandler('dump', () => {
  socket.emit('dump');
});
maxAPI.addHandler('clear', () => {
  socket.emit('clear');
});
maxAPI.addHandler('verbose', (x) => {
  socket.emit('verbose', x);
});
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
  maxAPI.outlet('event', data[0].head, ...data[0].value);
});
socket.on('control', function(data) {
  maxAPI.outlet(data);
});
socket.on('dump', function(data) {
  maxAPI.outlet(data);
});
