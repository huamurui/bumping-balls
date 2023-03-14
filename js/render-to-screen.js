/* 
this is the file that renders the balls to the screen
which is the only thing that the client needs to know about
 */



import myStick from './joy-stick.js'

let theColor = '#00ffff'

var joy3Param = { 
  title: "joystick3",
  internalFillColor: theColor,
  // 目前这个joy stick 还有个问题..主要在移动端，横屏的时候，它全乱套了。
  internalStrokeColor: "#00aaaa",
  externalStrokeColor: theColor,
}

export const Joy3 =  new myStick('joy3Div', joy3Param)





// global variables
let canvas =  document.getElementById('canvas')
let context = canvas.getContext('2d')
let canvasDimensions = document.getElementById('dimensions')

let dimensions = getCanvasDimensions(canvasDimensions)
let scaleRatio = dimensions.scaleRatio
// ...setCanvasSize... so fucking stupid...
function setCanvasSize(dimensions) {
  canvas.width = dimensions.width
  canvas.height = dimensions.height
}
setCanvasSize(dimensions) 




export function render( balls, theBallProperties) {
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
  let scaledCoords = ball.position.mult(scaleRatio); // convert the coordinates in CANVAS size
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
