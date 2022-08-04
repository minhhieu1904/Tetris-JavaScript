const cvs = document.getElementById('tetris')
const cvsNext = document.getElementById('next-tetris')
const ctx = cvs.getContext('2d')
const ctxNext = cvsNext.getContext('2d')

const scoreElement = document.getElementById('score')

const ROW = 20
const NextRow = (NextCol =  10)


const COL = (COLUMN = 10)
const SQ = (squareSize = 20)

const VACANT = 'WHITE' // color of an empty square
let delayDefault = 1000
let delay = delayDefault
let restart = false;
const difficults = ['Easy', 'Normal', 'Hard']

function changeDifficult () {
  let e = document.getElementById('difficults')
  let text = e.options[e.selectedIndex].text
  switch (text) {
    case 'Normal':
      delayDefault = 500
      break
    case 'Hard':
      delayDefault = 150
      break
    default:
      delayDefault = 1000
      break
  }
}

// draw a square
function drawSquare (x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ)

  ctx.strokeStyle = 'BLACK'
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ)
}

function drawNextSquare(x, y, color){
  ctxNext.fillStyle = color
  ctxNext.fillRect(x * SQ, y * SQ, SQ, SQ)

  ctxNext.strokeStyle = 'BLACK'
  ctxNext.strokeRect(x * SQ, y * SQ, SQ, SQ)
}

// create the board

let board = []
let boardNext = []
function createBoard () {
  for (r = 0; r < ROW; r++) {
    board[r] = []
    for (c = 0; c < COL; c++) {
      board[r][c] = VACANT
    }
  }
}
function createBoardNext () {
  for (r = 0; r < NextRow; r++) {
    boardNext[r] = []
    for (c = 0; c < NextCol; c++) {
      boardNext[r][c] = VACANT
    }
  }
}

createBoard()
createBoardNext()

// draw the board
function drawBoard () {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c])
    }
  }
}

function drawBoardNext () {
  for (r = 0; r < NextRow; r++) {
    for (c = 0; c < NextCol; c++) {
      drawNextSquare(c, r, boardNext[r][c])
    }
  }
}

drawBoard()
drawBoardNext()

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

function randomPiece () {
  delay = delayDefault
  let r = (randomN = Math.floor(Math.random() * PIECES.length)) // 0 -> 6
  return new Piece(PIECES[r][0], PIECES[r][1])
}

let p = randomPiece()
let pNext = randomPiece();

// The Object Piece

function Piece (tetromino, color) {
  this.tetromino = tetromino
  this.color = color

  this.tetrominoN = 0 // we start from the first pattern
  this.activeTetromino = this.tetromino[this.tetrominoN]

  // we need to control the pieces
  this.x = 3
  this.y = -2
}

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

Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw()
    this.y++
    this.draw()
  } else {
    // we lock the piece and generate a new one
    this.lock()
    debugger
    p = pNext;
    pNext = randomPiece()
    // Hiển thị ở csvNext 

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
  delay = 0
  drop()
}

let pause = false
Piece.prototype.togglePause = function () {
  pause = !pause

}

let score = 0

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
      let audio = new Audio('sound/pop.ogg')
      audio.play()
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

Piece.prototype.collision = function (x, y, piece) {
  // debugger
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // if the square is empty, we skip it
      if (!piece[r][c]) {
        continue
      }
      // coordinates of the piece after movement
      let newX = this.x + c + x
      let newY = this.y + r + y

      // conditions
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true
      }
      // skip newY < 0; board[-1] will crush our game
      if (newY < 0) {
        continue
      }
      // check if there is a locked piece alrady in place
      if (board[newY][newX] != VACANT) {
        return true
      }
    }
  }
  return false
}

// CONTROL the piece

document.addEventListener('keydown', CONTROL)

function CONTROL (event) {
  switch (event.keyCode) {
    // key Enter
    case 13:
      dropStart = Date.now()
      play()
      break
    // key space
    case 32:
      p.fall()
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
    case 80:
      p.togglePause()
      break
    default:
      break
  }
}

// drop the piece every {delay}

let dropStart = Date.now()
let gameOver = false
function drop () {
  let now = Date.now()
  let delta = now - dropStart
  // delay desc - difficult asc
  if (delta > delay && !pause && !restart) {
    p.moveDown()
    dropStart = Date.now()
  }
  if (!gameOver) {
    requestAnimationFrame(drop)
  }
}

// play function
function play () {
  restart = false;
  if (gameOver) {
    gameOver = false
    board = []
    createBoard()
    drawBoard()
    // drop()
  }
  
}


$('#btnStart').click(()=>{
  console.log('start');
  drop()
})

$('#btnReset').click(() => {
  console.log('reset');
  play();
})


