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
const socketIds = [];
var io = socket(server);
io.on("connection", socket => {
  console.info("made socket connection", socket.id);
  socketIds.push(socket.id); //try to remove the socket id if the user is dis connected

  socket.on("click", function(data) {    
    //ToDo: find another better solution for passing unique color to a socket
    if (socketIds.indexOf(socket.id) % 2 == 0) data.color = "crimson";
    else data.color = "cadetblue";
    console.log(data);

    io.sockets.emit("click", data);
    socket.broadcast.emit("enable");
  });

  socket.on("reset", function() {
    io.sockets.emit("reset");
  });

  socket.on("gameOver", function(data) {
    io.sockets.emit("gameOver", data);
  });
  // Handle chat event
  socket.on("chat", function(data) {    
    io.sockets.emit("chat", data);
  });

  // Handle typing event
  socket.on("typing", function(data) {
    socket.broadcast.emit("typing", data);
  });
});
