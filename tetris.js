const cvs = document.getElementById('tetris')
const ctx = cvs.getContext('2d')
const cvs_next_piece = document.getElementById('next_piece')
const ctx_next_piece = cvs_next_piece.getContext('2d')
const scoreElement = document.getElementById('score')
const playElement = document.getElementById('btn-play')
const pauseElement = document.getElementById('btn-pause')
const restartElement = document.getElementById('btn-restart')
const easyElement = document.getElementById('btn-easy')
const normalElement = document.getElementById('btn-normal')
const hardElement = document.getElementById('btn-hard')
const buttons = document.getElementsByTagName('button')
const text = document.getElementById('pause-text')
const backdrop = document.getElementById('backdrop')
const note = document.getElementById('myModal')
const modalBackbrop = document.getElementById('modal-backdrop')

const ROW = 20
const COL = (COLUMN = 10)
const ROW_NEXT_PIECE = 6
const COL_NEXT_PIECE = 6
const SQ = (squareSize = 20)
const VACANT = '#49361E' // color of an empty square
let delayDefault = 1000
let delay = delayDefault
let pause = false
const difficults = ['Easy', 'Normal', 'Hard']

function showModal() {
  pause = true
  note.style.display = 'block'
  modalBackbrop.classList.remove('hidden')
  this.blur()
}

function closeModal() {
  pause = false
  note.style.display = 'none'
  modalBackbrop.classList.add('hidden')
  this.blur()
}

function changeDifficult (text) {
  for (let i = 0; i < buttons.length; i++) buttons[i].classList.remove('active')

  switch (text) {
    case 'Normal':
      delayDefault = 500
      normalElement.classList.add('active')
      normalElement.blur()
      break
    case 'Hard':
      delayDefault = 150
      hardElement.classList.add('active')
      hardElement.blur()
      break
    default:
      delayDefault = 1000
      easyElement.classList.add('active')
      easyElement.blur()
      break
  }
  delay = delayDefault
}

// draw a square
function drawSquare (x, y, color, ctx) {
  ctx.fillStyle = color
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ)

  ctx.strokeStyle = '#3A2A17'
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ)
}

// create the board

let board = []
let board_Next_Piece = []
function createBoard () {
  for (r = 0; r < ROW; r++) {
    board[r] = []
    for (c = 0; c < COL; c++) {
      board[r][c] = VACANT
    }
  }
}

createBoard()

function createBoard_Next_Piece () {
  for (r = 0; r < ROW_NEXT_PIECE; r++) {
    board_Next_Piece[r] = []
    for (c = 0; c < COL_NEXT_PIECE; c++) {
      board_Next_Piece[r][c] = VACANT
    }
  }
}

createBoard_Next_Piece()

// draw the board
function drawBoard () {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c], ctx)
    }
  }
}

drawBoard()

function drawBoard_Next_Piece () {
  for (r = 0; r < ROW_NEXT_PIECE; r++) {
    for (c = 0; c < COL_NEXT_PIECE; c++) {
      drawSquare(c, r, board_Next_Piece[r][c], ctx_next_piece)
    }
  }
}

drawBoard_Next_Piece()

// the pieces and their colors

const PIECES = [
  [Z, '#01B4DE'],
  [S, '#F98531'],
  [T, '#34CE2A'],
  [O, '#C16FF8'],
  [L, '#FED767'],
  [I, '#FE244A'],
  [J, '#97AFFE']
]

// generate random pieces

function randomPiece () {
  delay = delayDefault
  let r = (randomN = Math.floor(Math.random() * PIECES.length)) // 0 -> 6
  return new Piece(PIECES[r][0], PIECES[r][1])
}

let p = randomPiece()
let p_next = randomPiece()

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
        drawSquare(this.x + c, this.y + r, color, ctx)
      }
    }
  }
}

Piece.prototype.fillNext = function (color) {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // we draw only occupied squares
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color, ctx_next_piece)
      }
    }
  }
}

// draw a piece to the board

Piece.prototype.draw = function () {
  this.fill(this.color)
}

Piece.prototype.drawNext = function () {
  this.x = 1
  this.y = 2
  this.fillNext(this.color)
  this.x = 3
  this.y = -2
}

// p_next.drawNext()
// undraw a piece

Piece.prototype.unDraw = function () {
  this.fill(VACANT)
}

Piece.prototype.unDrawNext = function () {
  this.fillNext(VACANT)
  this.x = 3
  this.y = -2
}

// move Down the piece

Piece.prototype.moveDown = function () {
  if (this.y == -2) p_next.drawNext()
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw()
    this.y++
    this.draw()
  } else {
    // we lock the piece and generate a new one
    this.lock()
    p = p_next
    board_Next_Piece = []
    createBoard_Next_Piece()
    drawBoard_Next_Piece()
    p_next = randomPiece()
    p_next.unDraw()
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
  if (!gameOver) {
    delay = 0
    drop()
  }
}

Piece.prototype.restart = function () {
  if (!pause) {
    text.classList.add('hidden')
    backdrop.classList.remove('backdrop')
    score = 0
    gameOver = false
    // reset 
    board = []
    createBoard()
    drawBoard()
    p = randomPiece()
    // reset next
    board_Next_Piece = []
    createBoard_Next_Piece()
    drawBoard_Next_Piece()
    p_next = randomPiece()

    dropStart = Date.now()
    drop()
  }
}

Piece.prototype.togglePause = function () {
  pause = !pause
  text.innerHTML = `Pause`
  text.classList.toggle('hidden')
  backdrop.classList.toggle('backdrop')
}

backdrop.addEventListener('click', function () {
  pause = false
  text.classList.add('hidden')
  backdrop.classList.remove('backdrop')
})

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
        // stop request animation frame
        gameOver = true
        text.innerHTML = `Game over`
        text.classList.remove('hidden')
        backdrop.classList.add('backdrop')
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
  scoreElement.innerHTML = score.toLocaleString('en-US')
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

playElement.addEventListener('click', function () {
  dropStart = Date.now()
  play()
  this.blur()
})

pauseElement.addEventListener('click', function () {
  p.togglePause()
  this.blur()
})

restartElement.addEventListener('click', function () {
  p.restart()
  this.blur()
})

function CONTROL (event) {
  switch (event.keyCode) {
    // key Enter
    case 13:
      if (!pause) {
        dropStart = Date.now()
        play()
      }
      break
    // key space
    case 32:
      if (!pause && gameStart && !gameOver) p.fall()
      break
    case 37:
      if (!pause && gameStart && !gameOver) {
        p.moveLeft()
        dropStart = Date.now()
      }
      break
    case 38:
      if (!pause && gameStart && !gameOver) {
        p.rotate()
        dropStart = Date.now()
      }
      break
    case 39:
      if (!pause && gameStart && !gameOver) {
        p.moveRight()
        dropStart = Date.now()
      }
      break
    case 40:
      if (!pause && gameStart && !gameOver) p.moveDown()
      break
    // key P
    case 80:
      p.togglePause()
      break
    // key R
    case 82:
      if (!pause) p.restart()
      break
    default:
      break
  }
}

// drop the piece every {delay}

let dropStart = Date.now()
let gameOver = false
let gameStart = false
function drop () {
  let now = Date.now()
  let delta = now - dropStart
  // delay desc - difficult asc
  if (delta > delay && !pause && !gameOver && gameStart) {
    p.moveDown()
    dropStart = Date.now()
  }
  if (!gameOver) {
    requestAnimationFrame(drop)
  }
}

// play function
function play () {
  gameStart = true
  if (gameOver) {
    text.classList.add('hidden')
    backdrop.classList.remove('backdrop')
    gameOver = false
    board = []
    createBoard()
    drawBoard()
    drop()
  } else {
    drop()
  }
}
