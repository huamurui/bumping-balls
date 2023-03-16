import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import engine, { balls } from './server/index.js'

let app = express()
let server = http.createServer(app)
let io = new Server(server)

// ----------------------------------------
// Main server code
// ----------------------------------------

// serve css and js

app.use(express.static('client'))

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/index.html');
});



function emitUpdates() {
  // tell everyone what's up
  // emit 的时候把游戏所有人的状态发给所有人
  io.emit('gameStateUpdate', balls);
}


let gameInterval, updateInterval

io.on('connection', function(socket){
  console.log('User connected: ', socket.id)
  // https://stackoverflow.com/questions/56298481/how-to-fix-object-null-prototype-title-product
  // https://stackoverflow.com/questions/53636028/how-do-i-get-rid-of-object-null-prototype-in-node-js

  // i don't know why ... but i can't pass an object through the query, it will get empty props... it has to be a string or strings..

  // start game if not already started
  if(gameInterval == null){
    console.log('starting game')
    gameInterval = setInterval(engine.updateBall, 1000 / 60)
    updateInterval = setInterval(emitUpdates, 1000 / 30)
  }
  
  
  let ball = {
    id: socket.id,
    color: socket.handshake.query.color,
    radius: parseInt(socket.handshake.query.radius),
  }
  engine.addBall(ball) 

  // set socket listeners
  socket.on('disconnect', function() {
    engine.removeBall(socket.id)
    console.log('User disconnected: ', socket.id)
    // end game if no balls left
    if(balls.length == 0){
      clearInterval(gameInterval)
      clearInterval(updateInterval)
      gameInterval = null
      console.log('ending game')
    }
  })

  socket.on('accelerate', function(acceleration) {
    let ball = balls.find((ball) => ball.id == socket.id)
    engine.accelerateBall(ball, acceleration)
  })
});

server.listen(process.env.PORT || 8080, function(){
  console.log('listening on *:8080', process.env.PORT);
});
