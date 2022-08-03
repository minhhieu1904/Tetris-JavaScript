const cvs = document.getElementById('tetris')
const btnStart = document.getElementById('btn-start');
const ctx = cvs.getContext('2d')
const scoreElement = document.getElementById('score')

const ROW = 20
const COL = (COLUMN = 10)
const SQ = (squareSize = 20)
const VACANT = 'WHITE' // Màu mặc định của ô vuông
const delay = 1000



//#region Variables
let score = 0
// create the board
let board = []
let dropStart = Date.now()
let gameOver = false
let pause = false;
//#endregion



createBoard()

// draw the board


drawBoard()

// the pieces and their colors

const PIECES = [
  [Z, 'red'],
  [S, 'green'],
  [T, 'yellow'],
  [O, 'blue'],
  [L, 'purple'],
  [I, 'cyan'],
  [J, 'orange']
]

// generate random pieces



let p = randomPiece()

// The Object Piece

function Piece(tetromino, color) {
  this.tetromino = tetromino
  this.color = color

  this.tetrominoN = 0 // we start from the first pattern
  this.activeTetromino = this.tetromino[this.tetrominoN]

  // we need to control the pieces
  this.x = 3
  this.y = -2
}

//#region Static Methods
// fill function
Piece.prototype.fill = function (color) {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // we draw only occupied squares
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color)
      }
    }
  }
}

// draw a piece to the board
Piece.prototype.draw = function () {
  this.fill(this.color)
}

// undraw a piece

Piece.prototype.unDraw = function () {
  this.fill(VACANT)
}

// move Down the piece
// Mỗi lần piece rớt xuống 1 ô thì gọi hàm này 
Piece.prototype.moveDown = function () {
  // Nếu như dòng cuối cùng có đủ các màu, thì xoá dòng cuối cùng đi và vẽ lại
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw()
    this.y++
    this.draw()
  } else {
    // we lock the piece and generate a new one
    this.lock()
    p = randomPiece()
  }
}

// move Right the piece
Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw()
    this.x++
    this.draw()
  }
}

// move Left the piece
Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw()
    this.x--
    this.draw()
  }
}

// rotate the piece
Piece.prototype.rotate = function () {
  let nextPattern = this.tetromino[
    (this.tetrominoN + 1) % this.tetromino.length
  ]
  let kick = 0

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > COL / 2) {
      // it's the right wall
      kick = -1 // we need to move the piece to the left
    } else {
      // it's the left wall
      kick = 1 // we need to move the piece to the right
    }
  }

  if (!this.collision(kick, 0, nextPattern)) {
    this.unDraw()
    this.x += kick
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length // (0+1)%4 => 1
    this.activeTetromino = this.tetromino[this.tetrominoN]
    this.draw()
  }
}

Piece.prototype.fall = function () {

}

Piece.prototype.lock = function () {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // we skip the vacant squares
      if (!this.activeTetromino[r][c]) {
        continue
      }
      // pieces to lock on top = game over
      if (this.y + r < 0) {
        alert('Game Over')
        // stop request animation frame
        gameOver = true
        break
      }
      // we lock the piece
      board[this.y + r][this.x + c] = this.color
    }
  }
  // remove full rows
  for (r = 0; r < ROW; r++) {
    let isRowFull = true
    for (c = 0; c < COL; c++) {
      isRowFull = isRowFull && board[r][c] != VACANT
    }
    if (isRowFull) {
      // if the row is full
      // we move down all the rows above it
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) {
          board[y][c] = board[y - 1][c]
        }
      }
      // the top row board[0][..] has no row above it
      for (c = 0; c < COL; c++) {
        board[0][c] = VACANT
      }
      // increment the score
      score += 10
    }
  }
  // update the board
  drawBoard()

  // update the score
  scoreElement.innerHTML = score
}

// collision fucntion
//  Hàm xử lí lúc va chạm
Piece.prototype.collision = function (x, y, piece) {
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // Nếu ô vuông trống thì bỏ qua
      if (!piece[r][c]) {
        continue
      }
      // Toạ độ của piece sau khi chuyển động
      let newX = this.x + c + x
      let newY = this.y + r + y

      // conditions // Nếu đầy row thì trả về True
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true
      }
      // skip newY < 0; board[-1] will crush our game
      if (newY < 0) {
        continue
      }
      // check if there is a locked piece already in place
      if (board[newY][newX] != VACANT) {
        return true
      }
    }
  }
  return false
}

//#endregion

//#region Methods
function randomPiece() {
  let r = (randomN = Math.floor(Math.random() * PIECES.length)) // 0 -> 6
  return new Piece(PIECES[r][0], PIECES[r][1])
}

function drawBoard() {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c])
    }
  }
}

function createBoard() {
  for (r = 0; r < ROW; r++) {
    board[r] = []
    for (c = 0; c < COL; c++) {
      board[r][c] = VACANT
    }
  }
}

// draw a square
function drawSquare(x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ)

  ctx.strokeStyle = 'BLACK'
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ)
}

function CONTROL(event) {
  switch (event.keyCode) {
    // key Enter
    case 13:
      dropStart = Date.now()
      play()
      break
    case 37:
      p.moveLeft()
      dropStart = Date.now()
      break
    case 38:
      p.rotate()
      dropStart = Date.now()
      break
    case 39:
      p.moveRight()
      dropStart = Date.now()
      break
    case 40:
      p.moveDown()
      break
    case 32: // SPACE
      p.fall()
      break
    case 80: // Bấm nút P
      pause = !pause;
      break
    default:
      break
  }
}

//#endregion


// CONTROL the piece

document.addEventListener('keydown', CONTROL)



// Hạ ô xuống sau mỗi 1 giây
function drop() {
  let now = Date.now()
  let delta = now - dropStart

  if (delta > delay && !pause) {
    p.moveDown()
    dropStart = Date.now()
  } 

  if (!gameOver) {
    requestAnimationFrame(drop)
  }
}

// Hàm xử lí chạy
function play() {
  if (gameOver) {
    gameOver = false
    board = []
    createBoard()
    drawBoard()
    drop()
  } else {
    drop()
  }
}


play();