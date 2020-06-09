const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 80;
const date = new Date();

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
  // returns an array of two elements with 
  //  - the reference to an entry inside the array of objects 'arr'
  //  - the index to the array (arr) of objects
  // where 'key' matches with value 'val'
  var i=0;
  for (entry in arr) {
    if (!entry.key.localeCompare(val))
      // get the entry that matches our id
      return [entry,i];
    i++;
  }
}
function getUserList(userData) {
  // returns a string with all usernames or user id 
  // that exist within userData (the input array)
  // 
  // NOTE:
  // userData must be in the form
  //    user.id
  //    user.data
  // 
  // if user.data.name does not exist, the user.id is appended instead
  var userlist=[];
  for (user in userData) {
    userlist.push(user.data.name || user.id);
  }
  return userlist.join(" ");
}
function broadcast(socket,head,data) {
  socket.broadcast.emit(head,data);
  console.log(head+": "+data);
}
function updateDictionary(socket,user,data) {
  if (user.data.hasOwnProperty('chat')) {
      socket.emit('chat',user.data.chat);
  }
}
function updateDict(socket,userData,prop,header,values) {
    const newStuff = {
      head: header,
      value: values,
      time: date.getTime()
    }
    // broadcasts a prop to all clients
    broadcast(socket, prop, newStuff);

    // if there is none, push a prop property to the object
    if (!userData.hasOwnProperty(prop)) {
      userData.push({
        prop:[]
      });
    }
    userData.prop.push(newStuff);
}
/*
 *
 *
 *  Begin listening for client connections
 *
 *
 */
io.sockets.on('connection', function(socket) {
  /*
   *   
   *  Update the userData with the new socket id 
   *  and with the basic data structure for each user:
   *    an object with id,data, and time keys within an array of objects
   *    
   */
  userData.push({ 
    id: socket.id, 
    data: {},  
    time: date.getTime()
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
  var usr = getObjectReference(userData,'id',socket.id);
  /*
   *
   * Handles user disconnecting
   *  - remove from list 
   *  - broadcast and post to console
   *  - report how many users are online
   *  
   */
  socket.on('disconnect', function() {
    var message = (usr[0].data.name || usr[0].id) + " disconnected.";
    userData.splice(usr[1],1);
    broadcast(socket, 'console', message);
    broadcast(socket, 'users', userData.length);
  });
  /*
   *
   * 'name' updates the name on the current user
   *  - adds or updates a name property to the userData array
   *  
   */
  socket.on('name',function(x) {
    // check if user object has a 'name' property
    if ( usr[0].data.hasOwnProperty('name') ) {
      // get the users old name
      var old=usr[0].data.name;

      // check if the old name is different from the new name (x)
      if (old.localeCompare(x)) {
        usr[0].data.name = x;
        var message = old + " changed name to: " + x + ".";
      } else {
        // no need to change the name
        var message = 0;
      }
    } else {
      // push a name property to the object with value x
      usr[0].data.push({
        name: x
      });
      var message = "User '"+socket.id+"' now has a name. Welcome, "+x+"!";
    }
    // broadcast a name change if there was one
    if (message) {
      broadcast(socket,'console',message);
      broadcast(socket,'users',getUserList(userData));
    }
  });
  /*
   *
   *  'get' messages:
   *  - 'getUsers' returns a list of all users
   *  - 'getChats' returns a list of all chats of the:
   *   -- no arguments: current user 
   *   -- 'user1': the specified user
   *   -- 'all': all the chats that have ever occured
   *
   */
  socket.on('getUsers', function(data) {
    // emits a list of user names or ids to the caller
    socket.emit('users',getUserList(userData));
  })
  socket.on('getChats', function() {
    var message;
    if (!arguments.length) {
      if (usr[0].data.hasOwnProperty('chat')) {
        message = usr[0].data.chat;
      } else {
        message = "You have not chatted.";
      }
    } else {
      var who = arguments[1];
      switch (who) {
        case: "all":
          for (user in userData) {
            if (user.data.hasOwnProperty('chat')) {
              message.push(user.data.chat);
            }
          }
          if (!message) message = "Noone said a word.";
          break;
        default:      
          for (user in userData) {
            if (!user.data.name.localeCompare(who) && 
                  user.data.hasOwnProperty('chat')) {
              message=user.data.chat;
            }
          }
          if (!message) message = who + " has not been very talkative...";
      }
      socket.emit('chat', message);
    }
  });
  /*
   *
   *  'chat', 'event', and 'control' messages:
   *  - broadcast messages to all clients with this structure
   *    - head (string)
   *    - value (array of values)
   *    - time (msec since Jan 1,1970)
   *  - update the userData dictionary with same structure
   *  
   *  see updateDict() routine.
   *
   */
  socket.on('chat', function(data) {
    var   userData = usr[0].data,
          prop = 'chat',
          header = ( usr[0].data.name || usr.id ) +"_chats",
          values = data
    updateDict(socket, userData, prop, header, values);
  });
  socket.on('event', function(data) {
    var   userData = usr[0].data,
          prop = 'event',
          header = data[0],
          values = data.slice(1)
    updateDict(socket, userData, prop, header, values);
  });
  socket.on('control', function(data) {
    var   userData = usr[0].data,
          prop = 'control',
          header = data[0],
          values = data.slice(1)
    updateDict(socket, userData, prop, header, values);
  });
  /*
   *
   *  'clear' message : removes all server-side data
   *
   */
  socket.on('clear', function() {
    // wipes out the server-side storage of user data
    var message = 'All user data cleared by ' + usr[0].data.name || usr[0].id;
    broadcast(socket,'users',message);
    userData=[];
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