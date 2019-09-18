let game_array = [[], [], []];

function isGameOver() {
  //ToDo: if possible re write the logic by decalring row, col variables outside then there is no
  //need of using isMatchOver thing

  let isMatchOver = true;

  //new left diagonal logic
  for (let i = 1; i < 3; i++) {
    if (
      game_array[i][i] == undefined ||
      game_array[i][i] != game_array[i - 1][i - 1]
    ) {
      isMatchOver = false;
      break;
    }
  }
  if (isMatchOver) return game_array[1][1];

  isMatchOver = true;
  //new right diagonal logic
  for (let i = 1; i < 3; i++) {
    if (
      game_array[i][3 - i - 1] == undefined ||
      game_array[i][3 - i - 1] != game_array[i - 1][3 - i]
    ) {
      isMatchOver = false;
      break;
    }
  }
  if (isMatchOver) return game_array[1][1];
  //new rows logic
  for (let row = 0; row < 3; row++) {
    isMatchOver = true;
    for (let col = 1; col < 3; col++) {
      if (
        game_array[row][col] == undefined ||
        game_array[row][col] != game_array[row][col - 1]
      ) {
        isMatchOver = false;
        break;
      }
    }
    if (isMatchOver) return game_array[row][row];
  }

  //new cols logic
  for (let col = 0; col < 3; col++) {
    isMatchOver = true;
    for (let row = 1; row < 3; row++) {
      if (
        game_array[row][col] == undefined ||
        game_array[row][col] != game_array[row - 1][col]
      ) {
        isMatchOver = false;
        break;
      }
    }
    if (isMatchOver) return game_array[col][col];
  }

  //checking Draw condition:
  isMatchOver = true;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (game_array[row][col] == undefined) {
        isMatchOver = false;
        break;
      }
    }
  }
  if (isMatchOver) return "DRAW";

  return null;
}

function resetGame() {
  gameEntities.forEach(entty => {
    entty.style.backgroundColor = "grey";
    entty.classList.remove("used_entity");
    game_array = [[], [], []];
    entty.disabled = false;
  });
}
