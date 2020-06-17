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
  socket.emit('event', head, rest);
});
maxAPI.addHandler('control', (head,...rest) => {
  // update controls
  socket.emit('control',  head, rest);
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
  // var event = {
  //   header : ,
  //   values : data.values,
  //   time : data.time
  // }
  maxAPI.outlet('event',data);
});
socket.on('control', function(data) {
  maxAPI.outlet(data);
});
socket.on('dump', function(data) {
  maxAPI.outlet(data);
});
