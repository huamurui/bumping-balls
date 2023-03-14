var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var engine = require('./public/game')

var gameInterval, updateInterval

function pirateName() {
  var names = [
    'Blackbeard',
    'Jimmy',
    'Roger',
    'Carlos',
    'Juanita',
    'Sophie',
    'Boris',
    'Jenny',
    'Doris',
    'Philippe',
    'Jack'
  ]
  return names[Math.floor(Math.random()*names.length)]
}

// TODO: extract below

function gameLoop() {
  // move everyone around
  Object.keys(engine.players).forEach((playerId) => {
    engine.movePlayer(playerId)
  })
}

// ----------------------------------------
// Main server code
// ----------------------------------------

// serve css and js
app.use(express.static('public'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});



function emitUpdates() {
  // tell everyone what's up
  // emit 的时候把游戏所有人的状态发给所有人
  io.emit('gameStateUpdate', { players: engine.players, doubloon: engine.doubloon });
}

io.on('connection', function(socket){
  console.log('User connected: ', socket.id)
  // start game if this is the first player
  if (Object.keys(engine.players).length == 0) {

    // 这个是游戏服务器的主循环，每 25ms 调用一次 gameLoop
  	gameInterval = setInterval(gameLoop, 25)
    // 这个是发送数据或者说客户端更新的主循环，每 40ms 调用一次 emitUpdates...很鬼才。可是现在可能没啥用了，我把客户端那边的自循环都删了。。。
    updateInterval = setInterval(emitUpdates, 40)
	}

  // get open position
  var posX = 0
  var posY = 0
  while (!engine.isValidPosition({ x: posX, y: posY }, socket.id)) {
    posX = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
    posY = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
  }

  // add player to engine.players obj
  engine.players[socket.id] = {
  	accel: {
  		x: 0,
  		y: 0
  	},
  	x: posX,
    y: posY,
  	colour: engine.stringToColour(socket.id),
  	score: 0,
    name: pirateName()
  }

  // set socket listeners

  socket.on('disconnect', function() {
  	delete engine.players[socket.id]
  	// end game if there are no engine.players left
  	if (Object.keys(engine.players).length > 0) {

    	io.emit('gameStateUpdate', engine.players);
  	} else {
  		clearInterval(gameInterval)
      clearInterval(updateInterval)
  	}
  })

  // 这里可能也是苦恼的一部分... 或者，...分那个啥，前端还是也个计时器好了，每个人每隔 40ms 发一次数据到服务器，而不是键盘按键发送事件。
  socket.on('up', function(msg){
    engine.accelPlayer(socket.id, 0, -1)
  });

  socket.on('down', function(msg) {
    engine.accelPlayer(socket.id, 0, 1)
  })

  socket.on('left', function(msg){
    engine.accelPlayer(socket.id, -1, 0)
  });

  socket.on('right', function(msg) {
    engine.accelPlayer(socket.id, 1, 0)
  })
});

http.listen(process.env.PORT || 8081, function(){
  console.log('listening on *:8081', process.env.PORT);
});
