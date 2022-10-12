'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const PASSAGE = 'PASSAGE'

const BALL = 'BALL'
const GAMER = 'GAMER'
const HOLE = 'HOLE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const HOLE_IMG = '<img src="img/hole.png">'

// Model:
var gBoard
var gGamerPos
var gAddBallInterval
var gAddHoleInterval
var gCollectedBallsCounter = 0
var gNumOfBalls = 2
var isGamerInHole = false

function initGame() {
  gGamerPos = { i: 2, j: 9 }
  gBoard = buildBoard()
  renderBoard(gBoard)
  gCollectedBallsCounter = 0
  gNumOfBalls = 2

  gAddBallInterval = setInterval(addBall, 3000)
  gAddHoleInterval = setInterval(addHole, 5000)

  var elGameOver = document.querySelector('.game-over')
  elGameOver.classList.add('hide')

  var elBallsCounter = document.querySelector('.counter-balls')
  elBallsCounter.classList.remove('hide')

  var elBoard = document.querySelector('.board')
  elBoard.classList.remove('hide')

  var elH1 = document.querySelector('.title')
  elH1.classList.remove('hide')

  elBallsCounter.innerHTML = ''
}

function buildBoard() {
  // TODO: Create the Matrix 10 * 12
  const board = createMat(10, 12)

  // TODO: Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (
        i === 0 ||
        i === board.length - 1 ||
        j === 0 ||
        j === board[i].length - 1
      ) {
        if (
          (i === 0 && j === 5) ||
          (i === board.length - 1 && j === 5) ||
          (i === 5 && j === 0) ||
          (i === 5 && j === board[0].length - 1)
        ) {
          board[i][j] = { type: FLOOR, gameElement: null }
        } else {
          board[i][j] = { type: WALL, gameElement: null }
        }
      } else {
        board[i][j] = { type: FLOOR, gameElement: null }
      }
    }
  }
  // TODO: Place the gamer and two balls
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
  board[4][6].gameElement = BALL
  board[6][3].gameElement = BALL

  console.log(board)
  return board
}

// Render the board to an HTML table
function renderBoard(board) {
  const elBoard = document.querySelector('.board')
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n'
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j]

      var cellClass = getClassName({ i, j })

      if (currCell.type === FLOOR) cellClass += ' floor'
      else if (currCell.type === WALL) cellClass += ' wall'

      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '"  onclick="moveTo(' +
        i +
        ',' +
        j +
        ')" >\n'

      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG
      } else if (currCell.gameElement === HOLE) {
        strHTML += HOLE_IMG
      }

      strHTML += '\t</td>\n'
    }
    strHTML += '</tr>\n'
  }
  // console.log('strHTML is:')
  // console.log(strHTML)
  elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
  if (isGamerInHole) return

  const targetCell = gBoard[i][j]
  if (targetCell.type === WALL) return

  // Calculate distance to make sure we are moving to a neighbor cell
  const iAbsDiff = Math.abs(i - gGamerPos.i)
  const jAbsDiff = Math.abs(j - gGamerPos.j)

  // If the clicked Cell is one of the four allowed
  // if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
  if (
    iAbsDiff + jAbsDiff === 1 ||
    (iAbsDiff === 0 && jAbsDiff === 11) ||
    (iAbsDiff === 9 && jAbsDiff === 0)
	) {
		if (targetCell.gameElement === BALL) {
			gCollectedBallsCounter++
			if (gCollectedBallsCounter === gNumOfBalls) gameOver()

      var collectBallSound = new Audio('audio/collectSound.mp3')
      collectBallSound.play()

      var elBallsCounter = document.querySelector('.counter-balls')
      elBallsCounter.innerHTML = `Balls collected: <span>${gCollectedBallsCounter}</span>`
    }

    if (targetCell.gameElement === HOLE) {
      isGamerInHole = true
      setTimeout(changeGamerInHole, 3000)
    }

    // TODO: Move the gamer
    // Model
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null

    // DOM
    var selectorStr = getClassName(gGamerPos)
    var elCell = document.querySelector('.' + selectorStr)
    elCell.innerHTML = ''

    // Model
    gBoard[i][j].gameElement = GAMER
    gGamerPos = { i, j }

    // DOM
    selectorStr = getClassName(gGamerPos)
    elCell = document.querySelector('.' + selectorStr)
    elCell.innerHTML = GAMER_IMG
  } else console.log('Bad Move', iAbsDiff, jAbsDiff)

}

function changeGamerInHole() {
  return (isGamerInHole = false)
}

function gameOver() {
  var elGameOver = document.querySelector('.game-over')
  elGameOver.classList.remove('hide')

  var elBallsCounter = document.querySelector('.counter-balls')
  elBallsCounter.classList.add('hide')

  var elBoard = document.querySelector('.board')
  elBoard.classList.add('hide')

  var elH1 = document.querySelector('.title')
  elH1.classList.add('hide')

  clearInterval(gAddBallInterval)
  clearInterval(gAddHoleInterval)
}


function addBall() {
  var randomI = getRandomIntInclusive(1, gBoard.length - 2)
  var randomJ = getRandomIntInclusive(1, gBoard[0].length - 2)

  if (!gBoard[randomI][randomJ].gameElement === null) return
  else {
    // Model
    gBoard[randomI][randomJ].gameElement = BALL
    gNumOfBalls++

    // Dom
    var selectorStr = getClassName({ i: randomI, j: randomJ })
    var elCell = document.querySelector('.' + selectorStr)
    elCell.innerHTML = BALL_IMG
  }
}

function addHole() {
  var randomI = getRandomIntInclusive(1, gBoard.length - 2)
  var randomJ = getRandomIntInclusive(1, gBoard[0].length - 2)

  if (!gBoard[randomI][randomJ].gameElement === null) return
  else {
    // Model
    gBoard[randomI][randomJ].gameElement = HOLE

    // Dom
    var selectorStr = getClassName({ i: randomI, j: randomJ })
    var elCell = document.querySelector('.' + selectorStr)
    elCell.innerHTML = HOLE_IMG

	setTimeout(removeHole, 3000)
  }
}

function removeHole() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].gameElement === HOLE) {
        // Model
        gBoard[i][j].gameElement = null

        // Dom
        var selectorStr = getClassName({ i, j })
        var elCell = document.querySelector('.' + selectorStr)
        elCell.innerHTML = ''
      }
    }
  }
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

// Move the player by keyboard arrows
function handleKey(event) {
  const i = gGamerPos.i
  const j = gGamerPos.j

  switch (event.key) {
    case 'ArrowLeft':
      if (i === 5 && j === 0) moveTo(i, gBoard[0].length - 1)
      else moveTo(i, j - 1)
      break
    case 'ArrowRight':
      if (i === 5 && j === gBoard[0].length - 1) moveTo(i, 0)
      else moveTo(i, j + 1)
      break
    case 'ArrowUp':
      if (i === 0 && j === 5) moveTo(gBoard.length - 1, 5)
      else moveTo(i - 1, j)
      break
    case 'ArrowDown':
      if (i === gBoard.length - 1 && j === 5) moveTo(0, 5)
      else moveTo(i + 1, j)
      break
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  const cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}
