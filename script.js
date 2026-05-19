const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");
const resetScoreButton = document.getElementById("reset-score");
const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");
const scoreX = document.getElementById("score-x");
const scoreO = document.getElementById("score-o");
const scoreDraw = document.getElementById("score-draw");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let isComputerThinking = false;
let scores = {
  X: 0,
  O: 0,
  draw: 0
};

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.cell);

  if (!gameActive || board[index] || isComputerThinking) {
    return;
  }

  makeMove(index, currentPlayer);

  if (finishTurn()) {
    return;
  }

  switchPlayer();

  if (isComputerMode() && currentPlayer === "O") {
    statusText.textContent = "Computador esta pensando...";
    playComputerTurn();
    return;
  }

  updateStatus();
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].disabled = true;
}

function getWinningLine(state = board) {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return line;
    }
  }

  return null;
}

function highlightWinningLine(line) {
  line.forEach((index) => {
    cells[index].classList.add("winner");
  });
}

function finishTurn() {
  const winningLine = getWinningLine();
  if (winningLine) {
    gameActive = false;
    isComputerThinking = false;
    scores[currentPlayer] += 1;
    updateScores();
    highlightWinningLine(winningLine);
    statusText.textContent = getWinnerMessage(currentPlayer);
    return true;
  }

  if (board.every((value) => value !== "")) {
    gameActive = false;
    isComputerThinking = false;
    scores.draw += 1;
    updateScores();
    statusText.textContent = "Deu velha!";
    return true;
  }

  return false;
}

function getWinnerMessage(player) {
  if (isComputerMode()) {
    return player === "X" ? "Voce venceu!" : "Computador venceu!";
  }

  return `Jogador ${player} venceu!`;
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function updateStatus() {
  if (isComputerMode()) {
    statusText.textContent = currentPlayer === "X" ? "Sua vez" : "Vez do computador";
    return;
  }

  statusText.textContent = `Vez do jogador ${currentPlayer}`;
}

function isComputerMode() {
  return modeSelect.value === "computer";
}

function syncControls() {
  difficultySelect.disabled = !isComputerMode();
}

function getAvailableMoves(state = board) {
  return state
    .map((value, index) => (value === "" ? index : null))
    .filter((value) => value !== null);
}

function playComputerTurn() {
  isComputerThinking = true;

  window.setTimeout(() => {
    if (!gameActive || currentPlayer !== "O") {
      isComputerThinking = false;
      return;
    }

    const moveIndex = difficultySelect.value === "expert"
      ? getBestMove(board)
      : getRandomMove(board);

    makeMove(moveIndex, "O");

    if (finishTurn()) {
      return;
    }

    switchPlayer();
    isComputerThinking = false;
    updateStatus();
  }, 350);
}

function getRandomMove(state) {
  const availableMoves = getAvailableMoves(state);
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

function getBestMove(state) {
  let bestScore = -Infinity;
  let bestMove = getAvailableMoves(state)[0];

  for (const move of getAvailableMoves(state)) {
    state[move] = "O";
    const score = minimax(state, false);
    state[move] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(state, isMaximizing) {
  const winningLine = getWinningLine(state);
  if (winningLine) {
    const winner = state[winningLine[0]];
    return winner === "O" ? 1 : -1;
  }

  if (state.every((value) => value !== "")) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (const move of getAvailableMoves(state)) {
      state[move] = "O";
      const score = minimax(state, false);
      state[move] = "";
      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const move of getAvailableMoves(state)) {
    state[move] = "X";
    const score = minimax(state, true);
    state[move] = "";
    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

function resetBoard() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  isComputerThinking = false;
  updateStatus();

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("winner");
  });
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScores();
  resetBoard();
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

restartButton.addEventListener("click", resetBoard);
resetScoreButton.addEventListener("click", resetScores);
modeSelect.addEventListener("change", () => {
  syncControls();
  resetBoard();
});
difficultySelect.addEventListener("change", resetBoard);

syncControls();
updateStatus();
