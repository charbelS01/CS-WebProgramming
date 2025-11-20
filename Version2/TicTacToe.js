/**
 * Tic Tac Toe Game Logic
 * Fully client-side implementation with win detection and score tracking
 */

// Game state variables
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let scores = {
  x: 0,
  o: 0,
  draw: 0,
};

// Winning combinations (indices of board array)
const winningConditions = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

// DOM elements
const cells = document.querySelectorAll(".cell");
const statusDisplay = document.getElementById("game-status");
const resetButton = document.getElementById("reset-btn");
const resetScoreButton = document.getElementById("reset-score-btn");
const scoreXDisplay = document.getElementById("score-x");
const scoreODisplay = document.getElementById("score-o");
const scoreDrawDisplay = document.getElementById("score-draw");

/**
 * Initialize the game
 */
function initGame() {
  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
    cell.addEventListener("keydown", handleCellKeydown);
  });

  resetButton.addEventListener("click", resetGame);
  resetScoreButton.addEventListener("click", resetScore);

  // Reset scores on page load
  resetScoresOnLoad();
  updateScoreDisplay();
}

/**
 * Reset scores to zero on page load
 */
function resetScoresOnLoad() {
  scores = { x: 0, o: 0, draw: 0 };
  // Clear any saved scores from localStorage
  try {
    localStorage.removeItem("tictactoe-scores");
  } catch (e) {
    console.warn("Could not clear scores from localStorage:", e);
  }
}

/**
 * Handle cell click event
 */
function handleCellClick(event) {
  const clickedCell = event.target;
  const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));

  // Validate move
  if (board[clickedCellIndex] !== "" || !gameActive) {
    return; // Cell already taken or game is over
  }

  // Make the move
  makeMove(clickedCell, clickedCellIndex);
}

/**
 * Handle keyboard navigation for accessibility
 */
function handleCellKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleCellClick(event);
  }
}

/**
 * Execute a move on the board
 */
function makeMove(cell, index) {
  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(`player-${currentPlayer.toLowerCase()}`);
  cell.setAttribute("aria-label", `Cell ${index + 1}, ${currentPlayer}`);

  checkResult();
}

/**
 * Check for win or draw
 */
function checkResult() {
  let roundWon = false;
  let winningCombination = null;

  // Check all winning conditions
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];

    if (board[a] === "" || board[b] === "" || board[c] === "") {
      continue;
    }

    if (board[a] === board[b] && board[b] === board[c]) {
      roundWon = true;
      winningCombination = [a, b, c];
      break;
    }
  }

  if (roundWon) {
    handleWin(winningCombination);
    return;
  }

  // Check for draw
  if (!board.includes("")) {
    handleDraw();
    return;
  }

  // Continue game - switch player
  switchPlayer();
}

/**
 * Handle winning state
 */
function handleWin(winningCombination) {
  gameActive = false;
  statusDisplay.textContent = `Player ${currentPlayer} wins!`;
  statusDisplay.classList.add("winner");

  // Highlight winning cells
  winningCombination.forEach((index) => {
    cells[index].classList.add("winning-cell");
  });

  // Update score
  if (currentPlayer === "X") {
    scores.x++;
    scoreXDisplay.textContent = scores.x;
  } else {
    scores.o++;
    scoreODisplay.textContent = scores.o;
  }

  saveScores();

  // Disable all cells
  cells.forEach((cell) => {
    cell.disabled = true;
  });
}

/**
 * Handle draw state
 */
function handleDraw() {
  gameActive = false;
  statusDisplay.textContent = "It's a draw!";
  statusDisplay.classList.add("draw");

  // Update score
  scores.draw++;
  scoreDrawDisplay.textContent = scores.draw;
  saveScores();

  // Disable all cells
  cells.forEach((cell) => {
    cell.disabled = true;
  });
}

/**
 * Switch to the other player
 */
function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
  statusDisplay.classList.remove("winner", "draw");
}

/**
 * Reset the game board for a new game
 */
function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  statusDisplay.textContent = "Player X's turn";
  statusDisplay.classList.remove("winner", "draw");

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("player-x", "player-o", "winning-cell");
    cell.disabled = false;
    const index = cell.getAttribute("data-index");
    cell.setAttribute("aria-label", `Cell ${parseInt(index) + 1}`);
  });

  // Focus on first cell for accessibility
  cells[0].focus();
}

/**
 * Reset all scores
 */
function resetScore() {
  if (confirm("Are you sure you want to reset all scores?")) {
    scores = { x: 0, o: 0, draw: 0 };
    updateScoreDisplay();
    saveScores();
  }
}

/**
 * Update score display
 */
function updateScoreDisplay() {
  scoreXDisplay.textContent = scores.x;
  scoreODisplay.textContent = scores.o;
  scoreDrawDisplay.textContent = scores.draw;
}

/**
 * Save scores to localStorage
 */
function saveScores() {
  try {
    localStorage.setItem("tictactoe-scores", JSON.stringify(scores));
  } catch (e) {
    console.warn("Could not save scores to localStorage:", e);
  }
}

/**
 * Load scores from localStorage
 */
function loadScores() {
  try {
    const savedScores = localStorage.getItem("tictactoe-scores");
    if (savedScores) {
      scores = JSON.parse(savedScores);
    }
  } catch (e) {
    console.warn("Could not load scores from localStorage:", e);
  }
}

// Initialize game when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}
