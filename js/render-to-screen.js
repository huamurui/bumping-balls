

const drawCanvasBorder =  function (context, dimensions) {
  context.strokeStyle = '#000000';
  context.strokeRect(0, 0, dimensions.width, dimensions.height);
}


const drawTheBall =  function (context, ballCoords, scaleRatio, theBallProperties){
  let scaledCoords = ballCoords.mult(scaleRatio); // convert the coordinates in CANVAS size
  // console.log(ballCoords,scaleRatio)
  context.beginPath()
  context.arc(scaledCoords.X, scaledCoords.Y, theBallProperties.radius * scaleRatio, // convert the radius too
      theBallProperties.startAngle, theBallProperties.endAngle)
  context.closePath()

  context.fillStyle = theBallProperties.color
  context.fill()
}


export default function render(context, balls, canvas, dimensions, theBallProperties) {
  context.clearRect(0, 0, canvas.width, canvas.height)

  drawCanvasBorder(context, canvas)
  balls.forEach(function(ball) {
    drawTheBall(context, ball.position, dimensions.scaleRatio, theBallProperties)
  })
}




/************
** HELPERS **
*************/
// 这个函数要完全拆出来... 有一部分不会再直接的在那个主文件里调用，而是，前端...

// canvas =  document.getElementById(canvasId)
// context = canvas.getContext('2d')
// canvasDimensions = document.getElementById(dimensionsId)


// var dimensions = getCanvasDimensions(canvasDimensions);
// canvas.width = dimensions.width;
// canvas.height = dimensions.height;

function getCanvasDimensions(localDimensions) {
  return {
      width: canvasDimensions.offsetWidth,
      height: canvasDimensions.offsetHeight,
      top: canvasDimensions.offsetTop,
      left: canvasDimensions.offsetLeft,
      scaleRatio: canvasDimensions.offsetWidth / localDimensions.width

      // localDimensions 是服务端计算所用的，canvasDimensions 则用于渲染。
  } 
}
