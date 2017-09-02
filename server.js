var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var util = require('util');
users = [];
connections = [];

server.listen(process.env.PORT || 3000);

console.log("server runnning");

app.get('/', function(req,res){
   res.sendFile(__dirname + "/index.html"); 
});

io.sockets.on('connection', function(socket){(socket)
    console.log(/*util.inspect(socket),*/ socket.handshake.headers.cookie);
    connections.push(socket);     
    console.log('Connected : %s sockets connected ', connections.length);
    
    //disconnect
    socket.on("disconnect", function(data){        
        users.splice(users.indexOf(socket.username),1);
        updateUserNames();
                connections.splice(connections.indexOf(socket), 1);    
                console.log('disconnected: %s sockets connected',  connections.length);
        });
    
    // send message
    socket.on("send message", function(data){
        console.log(util.inspect(socket));
       io.sockets.emit("new message", {msg: data, user: socket.userName}); 
    });
    
   socket.on('is typing', function(data){
     socket.broadcast.emit('typing', {userName: data.userName});
    });
                                             
    // New user
    socket.on("new user", function(data, callback){
        console.log(data);
        callback(true);
        socket.userName = data;
        users.push(socket.userName);
        updateUserNames();
    });
    
    // update user list in the screen
    function updateUserNames(){
        io.sockets.emit("get users", users);
    }
});

