import Vector2D from './vector2d.js'
import Balls from './balls.js'

import render from './render-to-screen.js'
import myStick from './joy-stick.js'


/**************
** CONSTANTS **
***************/
let theColor = '#00ffff'

var joy3Param = { 
  title: "joystick3",
  internalFillColor: theColor,
  // 目前这个joy stick 还有个问题..主要在移动端，横屏的时候，它全乱套了。
  internalStrokeColor: "#00aaaa",
  externalStrokeColor: theColor,
}
var Joy3 = new myStick('joy3Div', joy3Param)

var fps = 60 // Note: if you change this, you'll need to adapt gravity and resistance logic in ball.js
var intervalMs = 1000 / fps
var localDimensions = {
    width: 100, // 1 localDimensions.width is 1 local unit
    height: 100 * (2/3) // the canvas ratio is always 3:2
}

// 按理说... 这里主要是给渲染用的，但是，碰撞检测好像也用到了...所以很烦。
var theBallProperties = {
  radius: 3, // local units
  startAngle: 0,
  endAngle: 2 * Math.PI,
  color: theColor
}

/******************************************************************************************
** PROPERTIES USED FOR COMMUNICATION BETWEEN HELPERS, EVENTS, UPDATE AND PUBLIC FUNCTIONS **
*******************************************************************************************/
var updateInterval, balls, ballType, enabledCollisions


/******************
** MAIN FUNCTION **
*******************/
function update (){
    if (enabledCollisions){
        // check collisions and update positions & velocities
        // O(N^2) but this can be much faster, O(N*LogN) searching in quadtree structure, (or sort the points and check the closest O(N*LogN))        
        for (var i=0 ;i<balls.length; i++)
            for (var j=i+1; j<balls.length ;j++)
                balls[i].collision(balls[j])          
    }

    // https://juejin.cn/post/6844904159938887687

    // update ball position & velocity
    balls.forEach((ball) => {
      ball.move()
    })

    // 当初你为了方便，把用了同一个计时器...这里用户输入... 要emit...可能也差不多。
    // 调参，好玩~
    let accX = Joy3.GetX() *0.001
    let accY = Joy3.GetY() *0.001
    let maxV = 1.5

    if (balls[0].velocity.length() < maxV)
    {
      balls[0].velocity.X += accX
      balls[0].velocity.Y -= accY
    }
    render(balls, theBallProperties)
}

/*********************
** PUBLIC FUNCTIONS **
**********************/

function init(canvasId, dimensionsId, collisions) {
    // default values
    enabledCollisions = (typeof collisions != 'boolean') ? true : collisions

    ballType = Balls.HorizontalBall 
    //好吧。。。初始化函数也在这里...balls就是维护ball的数组。如果要做多端...持久化储存...下线了怎么办...
    balls = []

    // add a special ball at first place
    var theBall = new ballType(
      new Vector2D(0, 0),
      new Vector2D(0, 0),
      // 对的...碰撞检测的时候，是用的这个radius...但是也只用到了这个而已... 这里如果能要交给用户去定义那最好，选择位置和大小，最下边的是什么...
      theBallProperties.radius,
      localDimensions
    )
    balls.push(theBall)

    var theBall2 = new ballType(
      new Vector2D(10, 10),
      new Vector2D(10, 10),
      theBallProperties.radius,
      localDimensions
    )
    balls.push(theBall2)

    // set interval
    updateInterval = setInterval(update, intervalMs)
}

function clear() {

    // clear interval
    clearInterval(updateInterval)

    // clear canvas
    canvas.width = canvas.height = 0
}


let BouncingBalls = {
    init: init,
    clear: clear
}

export default BouncingBalls