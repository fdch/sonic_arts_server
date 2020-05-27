const maxAPI = require('max-api'),
    io = require('socket.io-client'),
    socket = io.connect('https://sonic-arts-server.herokuapp.com/');
// Report connection status to Max outlet.
socket.on('connect', () => {
    maxAPI.outlet("Connected to server.");
    maxAPI.outlet("connected");
});

// --- Incoming from patch, out to server

maxAPI.addHandler('event', (header) => {
  socket.emit('event', header);
  console.log('event sent: ' + header);
  maxAPI.outlet(["event", header]);
})

maxAPI.addHandler('chat', (data) => {
  socket.emit('chat', data);
  console.log('chat sent: ' + data);
})


maxAPI.addHandler('getEvents', () => {
  socket.emit('getEvents');
  console.log('getList of Events');
})

maxAPI.addHandler('clearEvents', () => {
  socket.emit('clearEvents');
  console.log('clearing list of Events');
})


maxAPI.addHandler('control', (head, ...vals) => {
  console.log("val length: " + vals.length);
  const newControl = {
    header: head,
    values: vals
  };
  console.log(newControl);
  socket.emit('control', newControl);
  console.log('sending control: ' + head + " - " + vals);
});

maxAPI.addHandler('clearControls', () => {
  socket.emit('clearControls');
  console.log('clearControls called');
});

maxAPI.addHandler('getControl', (header) => {
  socket.emit('getControl', header);
  console.log('requesting control: ' + header);
});

maxAPI.addHandler('addUsername', (name) => {
  socket.emit('addUsername', name);
  console.log('addUsername called');
});

maxAPI.addHandler('getUsers', () => {
  socket.emit('getUsers');
  console.log('getUsers called');
});

maxAPI.addHandler('clearUsers', () => {
  socket.emit('clearUsers');
  console.log('clearUsers called');
});

maxAPI.addHandler('setServerConsole', (val) =>{
  socket.emit('setConsoleDisplay', val);
});



// --- Incoming from server

socket.on('connectionEstabilishedGlobal',function(data) {
    console.log("connections established");
    maxAPI.outlet(["connections",data]);
})

//// INCOMING FROM SERVER - WEB BROWSER CLIENT OUT TO MAX PATCH CLIENT

socket.on('inc', function(data) {
    maxAPI.outlet(["inc",data]);
    console.log("received increase event...");
});

socket.on('dec', function(data) {
    maxAPI.outlet(["dec",data]);
    console.log("received increase event...");
});

socket.on('spawnCollectible', function(){
    maxAPI.outlet('spawnCollectible');
    console.log("spawning new collectible");
});

socket.on('increaseTempo', function(data) {
    maxAPI.outlet(["increaseTempo", data]);
    console.log("received tempo change: increase...");
});

socket.on('decreaseTempo', function(data) {
    maxAPI.outlet(["decreaseTempo", data]);
    console.log("received tempo change: decrease...");
});

//// INCOMING FROM SERVER - MAX CLIENT OUT TO MAX PATCH CLIENT

socket.on('chat', function(data){
  console.log('chat message received');
  maxAPI.outlet(["chat", data]);
})

socket.on('serverMessage', function(data) {
  console.log('Message from Server: ' + data);
  maxAPI.outlet(["serverMessage", data]);
});

socket.on('users', function(data) {
  console.log('lists of users: ' + data);
  // maxAPI.outlet(["users", ...data]);
  maxAPI.outlet(["users", data]);
});

socket.on('event', function(header) {
  console.log('received event: ' + header);
  maxAPI.outlet(["event", header]);
});

socket.on('events', function(events) {
  console.log('lists of events: ' + events);
  maxAPI.outlet(["events", events]);
})

// socket.on('seconds', (data) => {
//   console.log('seconds logged?');
//   // maxAPI(outl)
// })

socket.on('control', function(head, vals) {
  console.log('control ' + head + " " + vals);
  // use spread operator regardless if single or multiple datum.
  // console.log('val length: ' + vals);
  if (vals == null || vals == 'undefined') {
    console.log('header undefined');
    maxAPI.outlet(["control", head, "noHeader"]);
  } else {
    maxAPI.outlet(["control", head, ...vals]);
  }
});

socket.on('controlDump', function(obj) {
  console.log('controlDump ' + obj);
  //let newDict = {head k
  //maxAPI.outlet(["control", head + " " + vals]);
  maxAPI.outlet(["controlDump", obj]);
});
