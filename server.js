const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 80;
var verbose = 0;
// store everythin here for now:
var userData=[];

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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
function getUserList(arr) {
  /* 
   * returns a string with all usernames or user id 
   * that exist within userData (the input array)
   * 
   * NOTE:
   * arr must be in the form
   *    user.id
   *    user.data
   * 
   * if user.data.name does not exist, the user.id is appended instead
   * 
   */
  var userlist=[];
  for (var i=0; i<arr.length; i++) {
    var name=''
    if ( arr[i].data.hasOwnProperty('name') && arr[i].data.name) {
      name = arr[i].data.name;
    } else {
      name = arr[i].id;
    }
    userlist.push(name);
  }
  return userlist.join(" ");
}
function broadcast(socket,head,data) {
  socket.broadcast.emit(head,data); 
  if (verbose) console.log(head+": "+data);
}
function updateDict(socket,userData,prop,header,values) {
    const newStuff = {
      head: header,
      value: values,
      time: new Date().getTime()
    }
    // broadcasts a prop to all clients
    broadcast(socket, prop, newStuff);

    // if there is none, push a prop property to the object
    if (!userData.hasOwnProperty(prop)) userData.prop = [];

    userData[prop].push(newStuff);
}
/*
 *
 *
 *  Begin listening for client connections
 *
 *
 */
io.sockets.on('connection', function(socket) {
  var sid = socket.id;
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
   * Report how many users are online
   *
   */
  broadcast(socket,'users',userData.length);
  /*
   *
   * get user reference and index for later use
   *
   */
  var usr = getObjectReference(userData, 'id', sid);
  /*
   *
   * Handles user disconnecting
   *  - remove from list 
   *  - broadcast and post to console
   *  - report how many users are online
   *  
   */
  socket.on('disconnect', function() {
    var m = (usr[0].data.name?usr[0].data.name:usr[0].id) + " disconnected.";
    userData.splice(usr[1],1);
    broadcast(socket, 'console', m);
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
    if ( usr[0].data.hasOwnProperty('name') && usr[0].data.name) {
      // get the users old name
      var old=usr[0].data.name;

      // check if the old name is different from the new name (x)
      if (old.localeCompare(x)) {
        usr[0].data.name = x;
        m = old + " changed name to: " + x + ".";
      } else {
        // no need to change the name
        m = 0;
      }
    } else {
      // add a name property to the object with value x
      usr[0].data.name = x;
      m = "User '"+socket.id+"' now has a name. Welcome, "+x+"!";
    }
    // broadcast a name change if there was one
    if (m) {
      broadcast(socket,'console',m);
      broadcast(socket,'users',getUserList(userData));
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
    socket.emit('users',getUserList(userData));
  })
  socket.on('chats', function() {
    var m, x = arguments[1];
    switch (x) {
      case undefined:
        if (usr[0].data.hasOwnProperty('chat')) {
          m = usr[0].data.chat;
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
        if (!m) m = x + " has not been very talkative...";
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
    var   usrData = usr[0].data,
          prop = 'chat',
          header = ( usr[0].data.name?usr[0].data.name:usr.id ) +"_chats",
          values = x
    updateDict(socket, usrData, prop, header, values);
  });
  socket.on('event', function(head,...rest) {
    var   usrData = usr[0].data,
          prop = 'event',
          header = head,
          values = rest
    updateDict(socket, usrData, prop, header, values);
  });
  socket.on('control', function(head,...rest) {
    var   usrData = usr[0].data,
          prop = 'control',
          header = head,
          values = rest
    updateDict(socket, usrData, prop, header, values);
  });
  /*
   *
   *  'dump' message : gets all server-side data
   *
   */
  socket.on('dump', function() {
    // wipes out the server-side storage of user data
    var u = usr[0].data.name?usr[0].data.name:usr[0].id;
    var m = 'All user data dumped to ' + u;
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
    var u = usr[0].data.name?usr[0].data.name:usr[0].id;
    var m = 'All user data cleared by ' + u;
    broadcast(socket,'users',m);
    userData=[];
  });
  /*
   *
   *  'verbose' message : verbosity level for console posting
   *
   */
  socket.on('verbose', function(x) {
    verbose = x;
  });
});
/*
 *
 *
 *  Start listening
 *
 *
 */
http.listen(PORT, () => console.log(`Listening on ${ PORT }`))