import Vector2D from './vector2d.js'
import Balls from './balls.js'


/**************
** CONSTANTS **
***************/

let fps = 60 // Note: if you change this, you'll need to adapt gravity and resistance logic in ball.js
let intervalMs = 1000 / fps
let localDimensions = {
    width: 100, // 1 localDimensions.width is 1 local unit
    height: 100 * (2/3) // the canvas ratio is always 3:2
}

/**************
** PLAYERS **
***************/
var balls = []

function addBall(ball) {
  let newBall = new Balls.HorizontalBall(
    ball.id, // id
    ball.color, //color
    ball.radius, // radius
    new Vector2D(0, 0), // init position
    new Vector2D(0, 0), // init velocity
    // new Vector2D(0, 0), // init acceleration... we need one ... ahhh... no need to add it to the ball, it can be done out of the ball class.
    localDimensions  // canvas dimensions
  )
  balls.push(newBall)
}
function removeBall(ballId) {
  balls = balls.filter(ball => ball.id !== ballId)
}

function updateBall(){
  for (var i=0 ;i<balls.length; i++){
    for (var j=i+1; j<balls.length ;j++){
      balls[i].collision(balls[j])   
    }
  }
  balls.forEach(ball => {
    ball.move()
  })
}

function accelerateBall(ball, acceleration) {
  ball.accelerate(acceleration)
}

export default {
  addBall,
  removeBall,
  updateBall,
  accelerateBall,
}

// Es Module 的运行机制与 CommonJS 不一样。JS引擎 对脚本静态分析的时候，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。换句话说，import就是一个连接管道，原始值变了，import 加载的值也会跟着变。因此，Es Module 是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。
// ↑↑↑↑ 但是我把 balls 使用默认导出的时候，就 tmd 没有这效果...里面引用的 balls 第一次有值了之后就不再变了。
export  { balls }