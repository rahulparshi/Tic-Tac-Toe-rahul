const express = require("express");
const socket = require("socket.io");

const app = express();
//express app set up
//ToDo: try to do it with http instead of express as we are using only one html page
//Try to Use webpack later
const PORT_NUMBER = process.env.PORT || 5500;
const server = app.listen(PORT_NUMBER, function() {
  console.log("Connected listening for requests on port " + PORT_NUMBER);
});

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render("index");
});

// Socket setup & pass server
let waiting_rooms = [];
let connected_rooms = [];
const CONST_ROOM_PREFIX = "lobby_";
let room_suffix = 0;

const socketIds = [];

let io = socket(server);
io.on("connection", socket => {
  console.info("made socket connection", socket.id);
  let room_name = "";
  if (waiting_rooms.length == 0) {
    room_name = CONST_ROOM_PREFIX + room_suffix;
    waiting_rooms.push(room_name);
    room_suffix++;
  } else {
    room_name = waiting_rooms.pop();
    connected_rooms.push(room_name);
  }

  socket.join(room_name);
  socket.room = room_name;
  //ToDo: emit disable event for waiting rooms
  //and send admin messages
  if (waiting_rooms.length != 0) io.sockets.to(room_name).emit("wait");
  else io.sockets.to(room_name).emit("start"); //later change the event name

  socketIds.push(socket.id); //try to remove the socket id if the user is dis connected

  socket.on("click", function(data) {
    //ToDo: find another better solution for passing unique color to a socket
    if (socketIds.indexOf(socket.id) % 2 == 0) data.color = "crimson";
    else data.color = "cadetblue";
    console.log(data);

    io.sockets.to(socket.room).emit("click", data);
    socket.broadcast.to(socket.room).emit("enable");
  });

  socket.on("reset", function() {
    io.sockets.to(socket.room).emit("reset");
  });

  socket.on("gameOver", function(data) {
    io.sockets.to(socket.room).emit("gameOver", data);
  });
  // Handle chat event
  socket.on("chat", function(data) {
    io.sockets.to(socket.room).emit("chat", data);
  });

  // Handle typing event
  socket.on("typing", function(data) {
    socket.broadcast.to(socket.room).emit("typing", data);
  });
});

//ToDO: work on discoonect event[Handle waiting room functionality also.]
//try to get all the event names from one constant file

//Client sude TOdo:
//Wait until 2 players join the game
