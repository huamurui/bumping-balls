import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import engine from './server/game.js'

let app = express()
let server = http.createServer(app)
let io = new Server(server)

let gameInterval, updateInterval

// TODO: extract below

function gameLoop() {
  // move everyone around
  engine.players.forEach((player) => {
    engine.movePlayer(player.id)
  })
}

// ----------------------------------------
// Main server code
// ----------------------------------------

// serve css and js

app.use(express.static('client'))

app.get('/', function(req, res){
  //https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
  res.sendFile(process.cwd() + '/index.html');
});



function emitUpdates() {
  // tell everyone what's up
  // emit 的时候把游戏所有人的状态发给所有人
  io.emit('gameStateUpdate', { players: engine.players});
}

io.on('connection', function(socket){
  console.log('User connected: ', socket.id, socket.handshake.query)
  socket.on('hello', function(msg){
  })
  // start game if this is the first player
  if (engine.players.length == 0) {

    // 这个是游戏服务器的主循环，每 25ms 调用一次 gameLoop
  	gameInterval = setInterval(gameLoop, 25)
    // 这个是发送数据或者说客户端更新的主循环，每 40ms 调用一次 emitUpdates...很鬼才。可是现在可能没啥用了，我把客户端那边的自循环都删了。。。
    updateInterval = setInterval(emitUpdates, 40)
	}

  // get open position
  let posX = 0
  let posY = 0
  while (!engine.isValidPosition({ x: posX, y: posY }, socket.id)) {
    posX = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
    posY = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
  }

  // add player to engine.players obj
  engine.players.push({
    id: socket.id,
  	accel: {
  		x: 0,
  		y: 0
  	},
  	x: posX,
    y: posY,
  	colour: engine.stringToColour(socket.id),
  	score: 0,
  })

  // set socket listeners

  socket.on('disconnect', function() {
    engine.players = engine.players.filter((player) => player.id !== socket.id)
  	// end game if there are no engine.players left
  	if (engine.players.length > 0) {

    	io.emit('gameStateUpdate', engine.players);
  	} else {
  		clearInterval(gameInterval)
      clearInterval(updateInterval)
  	}
  })

  socket.on('accel', function(msg) {
    // console.log('accel', msg)
    engine.accelPlayer(socket.id, msg.x, msg.y)
  })
});

server.listen(process.env.PORT || 8081, function(){
  console.log('listening on *:8081', process.env.PORT);
});
