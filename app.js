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

let io = socket(server);
io.on("connection", socket => {
  console.info("made socket connection", socket.id);
  let room_name = "";

  if (waiting_rooms.length == 0) {
    room_name = CONST_ROOM_PREFIX + room_suffix;
    waiting_rooms.push(room_name);
    socket.color = "crimson"; //for first user
    room_suffix++;
  } else {
    room_name = waiting_rooms.pop();
    connected_rooms.push(room_name);
    socket.color = "cadetblue"; //for second user
  }

  socket.join(room_name);
  socket.room = room_name;
  if (waiting_rooms.length != 0) io.sockets.to(room_name).emit("wait");
  else io.sockets.to(room_name).emit("start"); //later change the event name

  socket.on("click", function(data) {
    //ToDo: find another better solution for passing unique color to a socket

    data.color = socket.color;

    io.sockets.to(socket.room).emit("click", data);
    socket.broadcast.to(socket.room).emit("enable");
  });

  socket.on("reset", function() {
    io.sockets.to(socket.room).emit("reset");
  });

  socket.on("gameOver", function() {
    io.sockets.to(socket.room).emit("gameOver");
  });

  socket.on("chat", function(data) {
    io.sockets.to(socket.room).emit("chat", data);
  });

  socket.on("typing", function(data) {
    socket.broadcast.to(socket.room).emit("typing", data);
  });

  socket.on("disconnect", () => {
    let wtngRoomIndex = waiting_rooms.indexOf(socket.room);
    let isWaitingRoom = wtngRoomIndex == -1 ? "NO" : "YES";

    if (isWaitingRoom === "YES") {
      waiting_rooms.splice(wtngRoomIndex, 1);
    } else {
      socket.broadcast.to(socket.room).emit("info", {
        msg:
          socket.id +
          " has left! Match ended with no result. Resetting the game"
      }); //later update ID with the name

      //      console.log(Object.keys(io.sockets.adapter.rooms[socket.room].sockets)); //returns array of socketId's//not used in the code

      let sockets1 = io.sockets.sockets; //clean this clumsy code
      for (let socketId in sockets1) {
        let socket1 = sockets1[socketId];
        socket1.color = "crimson"; //make the remaining user as first user
      }

      socket.broadcast.to(socket.room).emit("reset");
      socket.broadcast.to(socket.room).emit("wait");
      // socket.color = "crimson";
      connected_rooms.splice(connected_rooms.indexOf(socket.room), 1);
      waiting_rooms.push(socket.room);
    }

    //check whether it is a waiting room or connected
    //if it is connected room
    //reset the game wait for other user
    //send info message
    //remove the entry from connected room
    //add an entry to waiting room

    //if it is a waitng room
    //no need to send any info message
    //remove the entry from waiting room
  });
});

//ToDO at server side
//try to get all the event names from one constant file

//ToDo at client side
//enable disable button even if the matach ends with draw
//enter button should send the message
