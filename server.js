const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 80;
const IP = process.env.IP;
var verbose = 0, store = 0, url = '';
// store everythin here for now:
var userData=[];

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  url = req.ip;
  // url = `${req.headers['X-Forwarded-Proto'] || req.connection.info.protocol}://${req.info.host}${req.url.path}`;
  // console.log('begin request ---------------------');
  // for (i in Object.keys(req)) {
    // console.log(i + ": " + req[i]);
  // }
  // console.log('end request   ---------------------');
});
/* 
 * 
 * Helper routines
 * 
 */
function getObjectReference(arr, key, val) {
  /* 
   * returns an array of two elements with 
   *  - the reference to an entry inside the array of objects 'arr'
   *  - the index to the array (arr) of objects
   * where 'key' matches with value 'val'
   * 
   */
  var i=0, entry;
  for (var i=0; i<arr.length; i++) {
    if (!arr[i][key].localeCompare(val)) {
      // get the entry that matches our id
      entry = arr[i];
      break;
    }
  }
  if (entry) {
    return [ entry, i ];
  }
  else {
    console.error(arr, "Could not find reference.");
  }
}
function getUsername(u) {
  /*
   * returns a string with the user name 
   * if user.data.name does not exist, the user.id is appended instead
   * 
   * NOTE:
   * u must be a dict with the form
   *    user.id
   *    user.data
   *    user.data.name
   * 
   */
  if ( u.data.hasOwnProperty('name') && u.data.name) {
    return u.data.name;
  } else {
    return u.id;
  }
}
function getUserList(arr) {
  /* 
   * returns a string with all usernames or user id 
   * that exist within userData (the input array)
   * 
   */
  var userlist=[];
  for (var i=0; i<arr.length; i++) userlist.push(getUsername(arr[i]));
  return userlist.join(" ");
}
function broadcast(socket,head,...data) {
  socket.broadcast.emit(head,data); 
  if (verbose) console.log(head+": "+data);
}
function updateDict(socket,userData,prop,header,values,f) {
    const newStuff = {
      head: header,
      value: values,
      time: new Date().getTime()
    }
    // broadcasts a prop to all clients
    broadcast(socket, prop, newStuff);

    if (store || f) { // override store flag
      // if there is none, push a prop property to the object
      if (!userData.hasOwnProperty(prop)) userData.prop = [];

      userData[prop].push(newStuff);
    }
}
/*
 *
 *
 *  Begin listening for client connections
 *
 *
 */
io.sockets.on('connection', function(socket) {
  var usr=[], u, ui, sid = socket.id;
  /*
   *   
   *  Update the userData with the new socket id 
   *  and with the basic data structure for each user:
   *    an object with id,data, and time keys within an array of objects
   *    
   */
  userData.push({ 
    id: sid, 
    data: {
      name: '',
      event: [],
      control: [],
      chat: []
    },  
    time: new Date().getTime()
  })
  /*
   *
   * Report connection and how many users are online
   *
   */
  socket.emit('connected');
  broadcast(socket,'users',userData.length);
  /*
   *
   * get user reference and index for later use
   *
   */
  usr = getObjectReference(userData, 'id', sid);
  u   = usr[0];
  ui  = usr[1];
  /*
   *
   * Handles user disconnecting
   *  - remove from list 
   *  - broadcast and post to console
   *  - report how many users are online
   *  
   */
  socket.on('disconnect', function() {
    userData.splice(ui,1);
    broadcast(socket, 'console', getUsername(u) + " disconnected.");
    broadcast(socket, 'users', userData.length);
  });
  /*
   *
   * 'name' updates the name on the current user
   *  - adds or updates a name property to the userData array
   *  
   */
  socket.on('name',function(x) {
    var m;
    // check if user object has a 'name' property
    if ( u.data.hasOwnProperty('name') && u.data.name) {
      // get the users old name
      var old=u.data.name;

      // check if the old name is different from the new name (x)
      if (old.localeCompare(x)) {
        u.data.name = x;
        m = old + " changed name to: " + x + ".";
      } else {
        // no need to change the name
        m = 0;
      }
    } else {
      // add a name property to the object with value x
      u.data.name = x;
      m = "User '"+socket.id+"' now has a name. Welcome, "+x+"!";
    }
    if (m) {
      // broadcast a name change if there was one
      // and send the new user the list of all users
      broadcast(socket,'users',m);
      socket.emit('users', getUserList(userData));
    }
  });
  /*
   *
   *  get-type ms:
   *  - 'users' returns a list of all users
   *  - 'chats' returns a list of all chats of the:
   *   -- no arguments: current user 
   *   -- 'user1': the specified user
   *   -- 'all': all the chats that have ever occured
   *
   */
  socket.on('users', function() {
    // emits a list of user names or ids to the caller
    socket.emit('users', getUserList(userData));
  })
  socket.on('chats', function() {
    var m, x = arguments[1];
    switch (x) {
      case undefined:
        if (u.data.hasOwnProperty('chat')) {
          m = u.data.chat;
        } else {
          m = "You have not chatted.";
        }
        break;
      case "all":
        for (user in userData) {
          if (user.data.hasOwnProperty('chat')) {
            m.push(user.data.chat);
          }
        }
        if (!m) m = "Noone said a word.";
        break;
      default:      
        for (user in userData) {
          if (!user.data.name.localeCompare(x) && 
                user.data.hasOwnProperty('chat')) {
            m=user.data.chat;
          }
        }
        if (!m) m = x + " has not been very talkative... No chats found.";
    }
    socket.emit('chat', m);
  });
  /*
   *
   *  'chat', 'event', and 'control' ms:
   *  - broadcast ms to all clients with this structure
   *    - head (string)
   *    - value (array of values)
   *    - time (msec since Jan 1,1970)
   *  - update the userData dictionary with same structure
   *  
   *  see updateDict() routine.
   *
   */
  socket.on('chat', function(x) {
    var   usrData = u.data,
          prop = 'chat',
          values = x;
    updateDict(socket, usrData, prop, getUsername(u), values, 1);
  });
  socket.on('event', function(data) {
    updateDict(socket, u.data, "event", data.header, data.values);
  });
  socket.on('control', function(data) {
    updateDict(socket, u.data, 'control', data.header, data.values);
  });
  /*
   *
   *  'dump' message : gets all server-side data
   *
   */
  socket.on('dump', function() {
    // wipes out the server-side storage of user data
    var m = 'All user data dumped to ' + getUsername(u);
    broadcast(socket,'users',m);
    socket.emit('dump',userData);
  });
  /*
   *
   *  'clear' message : removes all server-side data
   *
   */
  socket.on('clear', function() {
    // wipes out the server-side storage of user data
    var m = 'All user data cleared by ' + getUsername(u);
    broadcast(socket,'users',m);
    userData=[];
  });
  /*
   *
   *  'verbose' message : verbosity level for console posting
   *  'store' message : flag for storing score data 
   *
   */
  socket.on('verbose', function(x) {
    verbose = x;
  });
  socket.on('store', function(x) {
    store = x;
  });
});
/*
 *
 *
 *  Start listening
 *
 *
 */
 console.log("process ip is: "+IP);
 console.log("process url is: "+url);
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));