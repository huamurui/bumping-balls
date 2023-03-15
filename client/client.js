function startal () {
  let socket = io({
    query: {
      name: 'konodioda'
    }
  })
  let canvas = document.getElementById('game')
  let ctx = canvas.getContext('2d')
  // let players = {} // this is magically defined in game.js
  // 虽说 websocket 是对称的...但这样看，估计，啊...不知道怎么讲了。

  // 这里，可以看到，是后端调用的整个前端更新。
  socket.emit("hello", Math.random())
    
  socket.on('gameStateUpdate', updateGameState)

  function drawPlayers(players) {
    // draw players
    // the game world is 500x500, but we're downscaling 5x to smooth accel out
    Object.keys(players).forEach((playerId) => {
      let player = players[playerId]

      let playerSize = 100 // it's from game.js, but i want to decompose it, so i write it here.
      ctx.fillStyle = player.colour
      ctx.fillRect(player.x/5, player.y/5, playerSize/5, playerSize/5)
    })
  }

  function updateGameState(gameState) {
    // update local state to match state on server
    let players = gameState.players

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawPlayers(players)
  }


  window.addEventListener('keydown', function(e) {
  // key handling {
    // 这样搞是每次发送一个方向，后台的方向才会改... 而我们需要的，大概是每隔一段时间，服务器向前端获取一个方向。
    if (e.key == "ArrowDown") {
      socket.emit('accel', {x: 0, y: 1})
    } else if (e.key == "ArrowUp") {
      socket.emit('accel', {x: 0, y: -1})
    } else if (e.key == "ArrowLeft") {
      socket.emit('accel', {x: -1, y: 0})
    } else if (e.key == "ArrowRight") {
      socket.emit('accel', {x: 1, y: 0})
    }
  })
}

export default startal