var socket = io();

// Query DOM
const message = document.getElementById("message"),
  handle = document.getElementById("handle"),
  btn = document.getElementById("send"),
  output = document.getElementById("output"),
  feedback = document.getElementById("feedback"),
  gameEntities = document.querySelectorAll(".game_entity"),
  resetbtn = document.getElementById("reset"),
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
    socket.emit("gameOver");
    resetbtn.style.visibility = "visible";
    status.style.visibility = "visible";
    if (winner == "DRAW")
      output.innerHTML =
        "<p><strong>Admin: </strong>Match draw</p>" + output.innerHTML;
    else if (winner == socket.id) {
      output.innerHTML =
        "<p><strong>Admin: </strong>You won the match</p>" + output.innerHTML;
    } else {
      output.innerHTML =
        "<p><strong>Admin: </strong>You lost the match</p>" + output.innerHTML;
    }
  }
});

socket.on("enable", function() {
  gameEntities.forEach(entty => {
    if (!entty.classList.contains("used_entity")) {
      entty.disabled = false;
    }
  });
});

function toggleGameEntites(status) {
  //look for a good variable name
  gameEntities.forEach(entty => {
    entty.disabled = status;
  });
}

socket.on("gameOver", function() {
  toggleGameEntites(true);
});

socket.on("wait", function() {
  toggleGameEntites(true);
  output.innerHTML =
    "<p><strong>Admin: </strong>waiting for other player.</p>" +
    output.innerHTML;
});

socket.on("start", function() {
  toggleGameEntites(false);
  output.innerHTML =
    "<p><strong>Admin: </strong>game started.</p>" + output.innerHTML;
});

socket.on("info", function(data) {
  output.innerHTML =
    `<p><strong>Admin: </strong>${data.msg}</p>` + output.innerHTML;
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
  output.innerHTML =
    "<p><strong>" +
    data.handle +
    ": </strong>" +
    data.message +
    "</p>" +
    output.innerHTML;
});

socket.on("typing", function(data) {
  feedback.innerHTML = "<p><em>" + data + " is typing a message...</em></p>";
});
