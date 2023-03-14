import Vector2D from './vector2d.js'
import Balls from './balls.js'

import { render,Joy3 } from './render-to-screen.js'



/**************
** CONSTANTS **
***************/

var fps = 60 // Note: if you change this, you'll need to adapt gravity and resistance logic in ball.js
var intervalMs = 1000 / fps
var localDimensions = {
    width: 100, // 1 localDimensions.width is 1 local unit
    height: 100 * (2/3) // the canvas ratio is always 3:2
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


        // https://juejin.cn/post/6844904159938887687
        // check collisions and update positions & velocities
        // O(N^2) but this can be much faster, O(N*LogN) searching in quadtree structure, (or sort the points and check the closest O(N*LogN))        
        for (var i=0 ;i<balls.length; i++)
            for (var j=i+1; j<balls.length ;j++)
                balls[i].collision(balls[j])          
    }


    // update ball position & velocity
    balls.forEach((ball) => {
      ball.move()
    })

    // 当初你为了方便，把用了同一个计时器...这里用户输入... 要emit...可能也差不多。
    // 调参，好玩~
    function accelerate(ball, accX, accY, maxV = 1.5) {
      if (ball.velocity.length() < maxV)
      {
        ball.velocity.X += accX
        ball.velocity.Y -= accY
      }
    }

    accelerate(balls.find((ball) => ball.id == 1), Joy3.GetX() *0.001, Joy3.GetY() *0.001)

    render(balls)
}

/*********************
** PUBLIC FUNCTIONS **
**********************/

function init(collisions) {
    // default values
    enabledCollisions = (typeof collisions != 'boolean') ? true : collisions

    ballType = Balls.HorizontalBall 
    balls = []

    var theBall = new ballType(
      1, // id
      '#00ffff', //color
      3, // radius
      new Vector2D(0, 0), // init position
      new Vector2D(0, 0), // init velocity
      localDimensions  // canvas dimensions
    )
    balls.push(theBall)

    var theBall2 = new ballType(
      2,
      '#000000',
      5,
      new Vector2D(0, 0),
      new Vector2D(0, 0),
      localDimensions
    )

    balls.push(theBall2)
    var theBall3 = new ballType(
      3,
      '#ff0000',
      10,
      new Vector2D(0, 0),
      new Vector2D(0, 0),
      localDimensions
    )
    balls.push(theBall3)

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