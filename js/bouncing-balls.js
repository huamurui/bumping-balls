import  Vector2D  from './vector2d.js';
import  Balls  from './balls.js';

/**************
** CONSTANTS **
***************/

// 全局变量真的是个很愚蠢的操作...
let up = false;
let down = false;
let left = false;
let right = false;

var fps = 60; // Note: if you change this, you'll need to addapt gravity and resistance logic in ball.js
var intervalMs = 1000 / fps;
var localDimensions = {
    width: 100, // 1 localDimensions.width is 1 local unit
    height: 100 * (2/3) // the canvas ratio is always 3:2
};
var ballProperties = {
    radius: 1, // local units
    startAngle: 0,
    endAngle: 2 * Math.PI,
    color: '#000000'
};
var theBallProperties = {
  radius: 3, // local units
  // 碰撞体积变大了但渲染没变大...颜色也不对...可见，又是被抛弃的代码
  startAngle: 0,
  endAngle: 2 * Math.PI,
  color: '#ff0000'
};
var aimProperties = {
    shrink: 0.6,
    maxSpeed: 30, // local units
    headPart: 0.2,
    strokeAngle: Math.PI / 5,
    color: '#000000'
};

/******************************************************************************************
** PROPERTIES USED FOR COMUNICATION BETWEEN HELPERS, EVENTS, UPDATE AND PUBLIC FUNCTIONS **
*******************************************************************************************/
var updateInterval, canvas, context, canvasDimensions, isAiming, balls,
    ballType, enabledCollisions, mousePosition, newBallPosition, newBallDirection;

/************
** HELPERS **
*************/
function getCanvasDimensions() {
    return {
        width: canvasDimensions.offsetWidth,
        height: canvasDimensions.offsetHeight,
        top: canvasDimensions.offsetTop,
        left: canvasDimensions.offsetLeft,
        scaleRatio: canvasDimensions.offsetWidth / localDimensions.width
        // 嗯...放缩，不同屏幕上玩...如果要做多端适配，也是一个，不能少的地方
        // 真实的数据如果是...localDimensions，那canvas上画的，只是一个，可以根据实际屏幕大小进行放缩的，一个虚拟的。虽然它是实际展示的，但是我们在代码中，操作的更多的会是 localDimensions
    }
}

function addNewBall() {
    isAiming = false;

    // save the new ball
    var newBall = new ballType(
        newBallPosition.clone(),
        newBallDirection.clone(),
        ballProperties.radius,
        localDimensions
    );
    balls.push(newBall);

    // reset values
    newBallDirection = Vector2D.zero();
    newBallPosition = new Vector2D();
}

/************
** DRAWING **
*************/
function drawCanvasBorder(dimensions) {
    context.strokeStyle = '#000000';
    context.strokeRect(0, 0, dimensions.width, dimensions.height);
}

function drawBall(ballCoords, scaleRatio) {
    var scaledCoords = ballCoords.mult(scaleRatio); // convert the coordinates in CANVAS size

    context.beginPath();
    context.arc(scaledCoords.X, scaledCoords.Y, ballProperties.radius * scaleRatio, // convert the radius too
        ballProperties.startAngle, ballProperties.endAngle);
    context.closePath();

    context.fillStyle = ballProperties.color;

    // 好吧...是所有的一块定义了，在一个抽象对象上定义...而不是具体的balls。
    context.fill();
}

function drawTheBall(ballCoords, scaleRatio){
  var scaledCoords = ballCoords.mult(scaleRatio); // convert the coordinates in CANVAS size

  context.beginPath();
  context.arc(scaledCoords.X, scaledCoords.Y, theBallProperties.radius * scaleRatio, // convert the radius too
      ballProperties.startAngle, ballProperties.endAngle);
  context.closePath();

  context.fillStyle = theBallProperties.color;

  // 好吧...是所有的一块定义了，在一个抽象对象上定义...而不是具体的balls。
  context.fill();
}

function drawAim(scaleRatio) {
    if (newBallDirection.isNearZero())
        return; // no direction, the mouse is in the start position

    var directionLength = newBallDirection.length();
    var radiusRatio = ballProperties.radius / directionLength;
    var scaledShrink = aimProperties.shrink * scaleRatio;

    // convert start and end points in CANVAS coordinates (using scaleRatio)
    // move the start point on the ball border (using the ball direction)
    // and adjust end point (using the start point)
    var startPoint = newBallPosition.add(newBallDirection.mult(radiusRatio)).mult(scaleRatio);
    var endPoint = startPoint.add(newBallDirection.mult(scaledShrink));

    // calculate head strokes angle
    var headLength = directionLength * scaledShrink * aimProperties.headPart;
    var arrowAngle = newBallDirection.angle(); // angle between Y axis and the arrow direction
    var leftStrokeAngle = arrowAngle - aimProperties.strokeAngle;
    var rightStrokeAngle = arrowAngle + aimProperties.strokeAngle;

    context.beginPath();
    // draw the body
    context.moveTo(startPoint.X, startPoint.Y);
    context.lineTo(endPoint.X, endPoint.Y);
    // draw the head strokes
    context.lineTo(endPoint.X - headLength * Math.sin(leftStrokeAngle),
                    endPoint.Y - headLength * Math.cos(leftStrokeAngle));
    context.moveTo(endPoint.X, endPoint.Y);
    context.lineTo(endPoint.X - headLength * Math.sin(rightStrokeAngle),
                    endPoint.Y - headLength * Math.cos(rightStrokeAngle));

    context.strokeStyle = aimProperties.color;
    context.stroke();
}

/********************
** EVENT LISTENERS **
*********************/
function onMouseMove(event) {
    if (isAiming) {
        var eventDoc, doc, body;
        event = event || window.event; // IE-ism

        // if pageX/Y aren't available and clientX/Y are, calculate pageX/Y - logic taken from jQuery.
        // (this is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
            (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
            (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        // convert mouse coordinates to local coordinates
        var dimensions = getCanvasDimensions();
        mousePosition = new Vector2D(event.pageX, event.pageY).convertToLocal(dimensions);
        if (newBallPosition.isUndefined())
            newBallPosition = mousePosition.clone(); // start aiming

        // check where the pointer is located
        if (mousePosition.X <= 0 || mousePosition.X >= localDimensions.width
            || mousePosition.Y <= 0 || mousePosition.Y >= localDimensions.height) {
            addNewBall();
        } else {
            // calculate aim direction
            newBallDirection = mousePosition.direction(newBallPosition);

            // directionLength shoud be smaller or equal to aimProperties.maxSpeed
            var directionLength = newBallDirection.length();
            if (directionLength > aimProperties.maxSpeed)
                newBallDirection = newBallDirection.mult(aimProperties.maxSpeed / directionLength);
        }
    }
}

function onMouseDown(event) {
    // button=0 is left mouse click, button=1 is middle mouse click, button=2 is right mouse click
    if (event.button == 0) {
        isAiming = true;
        onMouseMove(event); // calculate the start position
    } else if (isAiming) {
        addNewBall();
    }
}

function onMouseUp() {
    if (isAiming)
        addNewBall();
}

function onTouchMove(event) {
    // isAiming will be true ONLY if 1 finger touches the screen
    onMouseMove(event.touches[0]);
}

function onTouchStart(event) {
    if (event.touches.length == 1) {
        event.touches[0].button = 0; // imitate a left mouse button click
        onMouseDown(event.touches[0]);
    } else {
        onMouseUp();
    }
    event.preventDefault();
}

function onTouchEnd() {
    onMouseUp();
    event.preventDefault();
}

/******************
** MAIN FUNCTION **
*******************/

function update() {
    // check dimensions and clear canvas
    // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
    var dimensions = getCanvasDimensions();
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // draw canvas border
    // and clear the canvas！！！
    drawCanvasBorder(dimensions);

    // aiming mode
    if (isAiming) {
        // draw new ball
        drawBall(newBallPosition, dimensions.scaleRatio);
        // draw aim
        drawAim(dimensions.scaleRatio);
    }

    if (enabledCollisions){
        // check collisions and update positions & velocities
        // O(N^2) but this can be much faster, O(N*LogN) searching in quadtree structure, (or sort the points and check the closest O(N*LogN))
        for (var i=0; i<balls.length; i++)
            for (var j=i+1; j<balls.length; j++)
                balls[i].collision(balls[j]);
    }
    // update ball position & velocity
    for (var i=0; i<balls.length; i++)
    {
          balls[i].move();
    }

    //你动画更新放这边简直就是......
    let jiasudu = 0.2
    if (up) { balls[0].velocity.Y -= jiasudu; }
    if (down) { balls[0].velocity.Y += jiasudu; }
    if (left) { balls[0].velocity.X -= jiasudu; }
    if (right) { balls[0].velocity.X += jiasudu; }


    // draw updated balls
    for (var i=0; i<balls.length; i++)
    {  if(i==0){
        //..这判断太蠢了，而且你这代码写的到处都是
        drawTheBall(balls[i].position, dimensions.scaleRatio);
      }else{
        drawBall(balls[i].position, dimensions.scaleRatio);
      }
    }
}

/*********************
** PUBLIC FUNCTIONS **
**********************/
function init(canvasId, dimensionsId, horizontal, collisions) {
    // default values
    horizontal = (typeof horizontal != 'boolean') ? true : horizontal;
    enabledCollisions = (typeof collisions != 'boolean') ? true : collisions;

    // init parameters
    canvas =  document.getElementById(canvasId);
    context = canvas.getContext('2d');
    canvasDimensions = document.getElementById(dimensionsId);
    isAiming = false;
    mousePosition = new Vector2D(); // X & Y should be represented with local coordinates
    newBallPosition = new Vector2D(); // X & Y should be represented with local coordinates
    newBallDirection = Vector2D.zero();
    ballType = Balls.HorizontalBall 
    //好吧。。。初始化函数也在这里...balls就是维护ball的数组。如果要做多端...持久化储存...下线了怎么办...
    balls = [];

    // add a special ball at first place
    var theBall = new ballType(
      new Vector2D(0, 0),
      new Vector2D(0, 0),
      theBallProperties.radius,
      localDimensions
    );
    balls.push(theBall);


    document.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
          case 38:
          case 87:
              up = true;
              break;
          case 40:
          case 83:
              down = true;
              break;
          case 37:
          case 65:
              left = true;
              break;
          case 39:
          case 68:
              right = true;
              break;
          }
    });
    
    // Which key was releaed
    document.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
        case 38:
        case 87:
            up = false;
            break;
        case 40:
        case 83:
            down = false;
            break;
        case 37:
        case 65:
            left = false;
            break;
        case 39:
        case 68:
            right = false;
            break;
        }
    });


    // add mouse event listeners
    canvas.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);

    // add touch event listeners
    canvas.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);

    // ...竟然真用这个做动画...日。
    // set interval
    updateInterval = setInterval(update, intervalMs);
}

// function clear() {
//     // remove mouse event listeners
//     canvas.removeEventListener('mousedown', onMouseDown);
//     document.removeEventListener('mousemove', onMouseMove);
//     canvas.removeEventListener('mouseup', onMouseUp);

//     // remove touch event listeners
//     canvas.removeEventListener('touchstart', onTouchStart);
//     document.removeEventListener('touchmove', onTouchMove);
//     canvas.removeEventListener('touchend', onTouchEnd);

//     // clear interval
//     clearInterval(updateInterval);

//     // clear canvas
//     canvas.width = canvas.height = 0;
// }

/* Save these functions as global, no need from looking for the root because this script must run in browser */
let BouncingBalls = {
    init: init,
    // clear: clear
};

// BouncingBalls.init();
// window.BouncingBalls = BouncingBalls;
export default BouncingBalls;