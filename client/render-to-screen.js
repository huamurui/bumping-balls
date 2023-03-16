/* 
this is the file that renders the balls to the screen
which is the only thing that the client needs to know about
 */


// global variables
let canvas
let context
let canvasDimensions

let dimensions
let scaleRatio




export default function render(balls, dimensions0, canvas) {
  context = canvas.getContext('2d')
  canvasDimensions = getCanvasDimensions(dimensions0)
  dimensions = canvasDimensions
  scaleRatio = canvasDimensions.scaleRatio
  canvas.width = dimensions.width
  canvas.height = dimensions.height

  context.clearRect(0, 0, dimensions.width, dimensions.width)

  drawCanvasBorder(context, dimensions)
  balls.forEach(function(ball) {
    drawTheBall(context, ball)
  })
}

function drawCanvasBorder  (context, dimensions) {
  context.strokeStyle = '#000000';
  context.strokeRect(0, 0, dimensions.width, dimensions.height);
}


function drawTheBall  (context, ball){
  let scaledCoords = {
      X: ball.position.X * scaleRatio,
      Y: ball.position.Y * scaleRatio
  } // convert the coordinates in CANVAS size
  context.beginPath()
  context.arc(scaledCoords.X, scaledCoords.Y, ball.radius * scaleRatio, // convert the radius too
      0, Math.PI * 2)
  context.closePath()

  context.fillStyle = ball.color
  context.fill()
}




/************
** HELPERS **
*************/
// 这个函数要完全拆出来... 有一部分不会再直接的在那个主文件里调用，而是，前端...

function getCanvasDimensions(canvasDimensions) {
  let localDimensionsWidth = 100
  return {
      width: canvasDimensions.offsetWidth,
      height: canvasDimensions.offsetHeight,
      top: canvasDimensions.offsetTop,
      left: canvasDimensions.offsetLeft,
      scaleRatio: canvasDimensions.offsetWidth / localDimensionsWidth
      // 这里做的计算只有一个，就是scaleRatio？？？
      // localDimensions 是服务端计算所用的，canvasDimensions 则用于渲染。
  } 
}
