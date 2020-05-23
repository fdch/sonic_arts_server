const myport=(process.env.PORT || 80);

// console.log(`defined port at: ${myport}`);

// console.log("require 'express' package");

const express = require('express');

// console.log("start app...");

const app     = express();

// console.log("create server...");

const server  = require('http').createServer(app);

console.log(`begin listening on port: ${myport}`);

const io      = require('socket.io').listen(server); 

// console.log("launch the server");
// launch the server
server.listen(myport); // start listening for socket connections


console.log("begin socket connection...");

io.on('connection', (socket) => {
    
    // --- intial connection messages

    // post new connection message to server console
    console.log('A client has connected.');

    // send a confirmation message to a new client when they have connected
    socket.emit('messageFromServer', "Welcome from the server!"); 

    // let the other clients know about the new particpant
    socket.broadcast.emit('messageFromServer', "Someone else has joined!");
    
    // ---

    // --- client to client communications

    // chat messages
    socket.on('chatToServer', (chat) => {
        socket.broadcast.emit('chatFromServer', chat);
    })

    // data
    socket.on('dataToServer', (data) => {
        socket.broadcast.emit('dataFromServer', data);
    })
});
