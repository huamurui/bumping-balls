import myStick from './joy-stick.js'
import render from './render-to-screen.js'



function start(myBall, dimensions, canvas) {
  let myBallStick = new myStick('myBallStick', {
    title: 'myBallStick',
    internalFillColor: myBall.color,
    internalStrokeColor: "#aaaaaa",
    externalStrokeColor: myBall.color,
  })

  let socket = io({
    query: {
      color: myBall.color,
      radius: myBall.radius,
    },
    transports: [ "websocket" ]
  })

  socket.emit("hello", Math.random())
  socket.on('gameStateUpdate', updateGameState)

  function updateGameState(balls) {
    render(balls, dimensions, canvas)
  }



  function sendStickPosition() {
    socket.emit('accelerate', { X: myBallStick.GetX()*0.001, Y: - myBallStick.GetY()*0.001 })
  }
  setInterval(sendStickPosition, 1000 / 60)
}

export default start