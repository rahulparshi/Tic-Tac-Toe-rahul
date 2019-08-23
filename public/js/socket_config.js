// Make connection
// var socket = io.connect("http://10.235.221.236:5500");
var socket = io();
//("http://localhost:5500");

// Query DOM
const message = document.getElementById("message"),
  handle = document.getElementById("handle"),
  btn = document.getElementById("send"),
  output = document.getElementById("output"),
  feedback = document.getElementById("feedback");
const gameEntities = document.querySelectorAll(".game_entity");
const resetbtn = document.getElementById("reset"),
  status = document.getElementById("status");

resetbtn.style.visibility = "hidden";

status.style.visibility = "hidden";

resetbtn.addEventListener("click", function() {
  socket.emit("reset");
});

socket.on("reset", function() {
  resetGame();
  resetbtn.style.visibility = "hidden";
  status.style.visibility = "hidden";
});

gameEntities.forEach(entty =>
  entty.addEventListener("click", function() {
    const id = { _id: this.id, _socketId: socket.id };
    socket.emit("click", id);
  })
);

socket.on("click", function(data) {
  const entty = document.getElementById(data._id);
  const [row, col] = data._id.split("_");

  entty.style.backgroundColor = data.color;
  entty.classList.add("used_entity");

  //disabling all the buttoons for the player
  gameEntities.forEach(entty => (entty.disabled = true));
  game_array[row][col] = data._socketId;

  const winner = isGameOver();

  if (winner) {
    socket.emit("gameOver", { winner: winner });
    resetbtn.style.visibility = "visible";
    status.style.visibility = "visible";
    if (winner == socket.id) status.innerText = "You won the match";
    else status.innerText = "You loose the match";
  }
});

socket.on("enable", function() {
  gameEntities.forEach(entty => {
    if (!entty.classList.contains("used_entity")) {
      entty.disabled = false;
    }
  });
});

socket.on("gameOver", function() {
  gameEntities.forEach(entty => {
    entty.disabled = true;
  });
});

socket.on("wait", function() {
  //Think of reusability creat a function based on parameter enable or disable the board
  gameEntities.forEach(entty => {
    entty.disabled = true;
  });
  //console.log("waiting for other user");
  output.innerHTML += "<p><strong>Admin: </strong>waiting for other user</p>";
});

socket.on("start", function() {
  //Think of reusability creat a function based on parameter enable or disable the board
  gameEntities.forEach(entty => {
    entty.disabled = false;
  });
  output.innerHTML += "<p><strong>Admin: </strong>game started</p>";
});

socket.on("info", function(data) {
  console.log("info " + data);
  output.innerHTML += `<p><strong>Admin: </strong>${data.msg}</p>`;
});

// Emit events
btn.addEventListener("click", function() {
  socket.emit("chat", {
    message: message.value,
    handle: handle.value
  });
  message.value = "";
});

message.addEventListener("keypress", function() {
  socket.emit("typing", handle.value);
});

// Listen for events
socket.on("chat", function(data) {
  feedback.innerHTML = "";
  output.innerHTML +=
    "<p><strong>" + data.handle + ": </strong>" + data.message + "</p>";
});

socket.on("typing", function(data) {
  feedback.innerHTML = "<p><em>" + data + " is typing a message...</em></p>";
});
