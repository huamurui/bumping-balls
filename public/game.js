var players = {}

const gameSize = 2500; // will be downscaled 5x to 500x500 when we draw

const playerSize = 100; // (downscaled to 20x20)
const maxAccel = 10



// emmm 要说可能这俩都算碰撞检测
function checkCollision(obj1, obj2) {
  return(Math.abs(obj1.x - obj2.x) <= playerSize && Math.abs(obj1.y - obj2.y) <= playerSize)
}

function isValidPosition(newPosition, playerId) {
  // bounds check
  if (newPosition.x < 0 || newPosition.x + playerSize > gameSize) {
    return false
  }
  if (newPosition.y < 0 || newPosition.y + playerSize > gameSize) {
    return false
  }
  // collision check
  var hasCollided = false


  Object.keys(players).forEach((key) => {
    if (key == playerId) { return } // ignore current player in collision check
    player = players[key]
    // if the players overlap. hope this works
    if (checkCollision(player, newPosition)) {
      hasCollided = true
      return // don't bother checking other stuff
    }
  })
  if (hasCollided) {
    return false
  }

  return true
}

function movePlayer(id) {

  var player = players[id]

  var newPosition = {
    x: player.x + player.accel.x,
    y: player.y + player.accel.y
  }
  if (isValidPosition(newPosition, id)) {
    // move the player and increment score
    player.x = newPosition.x
    player.y = newPosition.y
  } else {
    // don't move the player
    // kill accel
    player.accel.x = 0
    player.accel.y = 0
  }
}

function accelPlayer(id, x, y) {
  var player = players[id]
  var currentX = player.accel.x
  var currentY = player.accel.y

  if (Math.abs(currentX + x) < maxAccel) {
    player.accel.x += x
  }
  if (Math.abs(currentY + y) < maxAccel) {
    player.accel.y += y
  }
}

// thanks SO
function stringToColour(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

if (!this.navigator) { // super hacky thing to determine whether this is a node module or inlined via script tag
  module.exports = {
    players: players,
    stringToColour: stringToColour,
    accelPlayer: accelPlayer,
    movePlayer: movePlayer,
    gameSize: gameSize,
    isValidPosition: isValidPosition,
  }
}
