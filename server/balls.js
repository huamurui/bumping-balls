import  Vector2D  from './vector2d.js';
/*********************************************************
    Notes about the physics in the simulations:
    The balls are equally hard (and have equal weight), so they don't lose energy when bouncing between themself.
    In the horizontal simulation, a ball loses energy when bouncing from a wall (the wall is harder and stationary) and air resistence.
    The ball also loses energy from the air resistence, hitting the ground, rolling on the ground and gravity in the vertical simulation
    (but not from spinning and some other 3d things possible in billiard and basketball).

*********************************************************/

/**************
 * Ball class *
***************/
function Ball(id, color, radius, position, velocity, localDimensions) {
    // base constructor
    this.id = id;
    this.color = color;
    this.radius = radius;
    this.position = position;
    this.velocity = velocity;
    // this.acceleration = acceleration;
    this._borderCoords = {
      // this is for ...边界坐标？？？？
      // 不是，什么意思，是每一个球，都有一个边界坐标？？？
      // 艹! 我要麻了！
        top: radius,
        bottom: localDimensions.height - radius,
        left: radius,
        right: localDimensions.width - radius
    };
}

function moveBallsOutOfCollision(ball1, ball2) {
    /*********************************************************
        Find the positions of the balls when the collision occurred.
        (because right they have collided - they're overlapping)

        old ball1.position = ball1.position - T * ball1.velocity
        old ball2.position = ball2.position - T * ball2.velocity

        In this moment T is unknown. Solve this equation to find T:
        distance(old ball1.position, old ball2.position) = (ball1.radius + ball2.radius)

        This can be solved using the Quadratic formula, because after simplifying
        the left side of the equation we'll get something like: a*(T^2) + b*T + c = 0
    *********************************************************/
    var v = ball1.velocity.sub(ball2.velocity);
    var p = ball1.position.sub(ball2.position);
    var r = ball1.radius + ball2.radius;

    // quadratic formula coeficients
    var a = v.X*v.X + v.Y*v.Y;
    var b = (-2)*(p.X*v.X + p.Y*v.Y);
    var c = p.X*p.X + p.Y*p.Y - r*r;

    // quadratic formula discriminant
    var d = b*b - 4*a*c;

    // t1 and t2 from the quadratic formula (need only the positive solution)
    var t = (-b - Math.sqrt(d)) / (2*a);
    if (t < 0)
        t = (-b + Math.sqrt(d)) / (2*a);

    // calculate the old positions (positions when the collision occurred)
    var oldPosition1 = ball1.position.sub(ball1.velocity.mult(t));
    var oldPosition2 = ball2.position.sub(ball2.velocity.mult(t));

    var maxChange = ball1.radius * 3;

    if ((a == 0) || (d < 0) ||
        (oldPosition1.distance(ball1.position) > maxChange) ||
        (oldPosition2.distance(ball2.position) > maxChange)) {
        // 1) if 'a' is zero then both balls have equal velocities, no solution
        // 2) the discriminant shouldn't be negative in this simulation, but just in case check it
        // 3) the chages are too big, something is wrong

        if (ball1.position.distance(ball2.position) == 0) {
            // move only one ball up
            ball1.position = ball1.position.add(new Vector2D(0, -r));
        } else {
            // move both balls using the vector between these positions
            var diff = (r - ball1.position.distance(ball2.position)) / 2;
            ball1.position = ball1.position.add(ball1.position.sub(ball2.position).tryNormalize().mult(diff));
            ball2.position = ball2.position.add(ball2.position.sub(ball1.position).tryNormalize().mult(diff));
        }
    } else {
        // use the old positions
        ball1.position = oldPosition1;
        ball2.position = oldPosition2;
    }
}

Ball.prototype.collision = function(ball) {
    if (this.position.distance(ball.position) <= ball.radius + this.radius) {
        moveBallsOutOfCollision(this, ball);

        var positionSub = this.position.sub(ball.position);
        var distance = positionSub.length();

        /*********************************************************
            The formula could be found here: https://en.wikipedia.org/wiki/Elastic_collision
            velocityA -= (dot(velocityAB_sub, positionAB_sub) / distance^2) * positionAB_sub
            velocityB -= (dot(velocityBA_sub, positionBA_sub) / distance^2) * positionBA_sub
            but this thing (dot(velocityAB_sub, positionAB_sub) / distance^2) is same for 2 velocities
            because dot and length methods are commutative properties, and velocityAB_sub = -velocityBA_sub, same for positionSub
        *********************************************************/
        var coeff = this.velocity.sub(ball.velocity).dot(positionSub) / (distance * distance);
        this.velocity = this.velocity.sub(positionSub.mult(coeff));
        ball.velocity = ball.velocity.sub(positionSub.opposite().mult(coeff));
    }
}

/************************
 * HorizontalBall class *
*************************/
var horizontalMovementProperties = {
    airResistance: 0.99, // slows down the speed in each frame
    hitResistance: 0.8, // slows down the speed when a wall is hitted

    // 这里就是，初始速度的...一个单位，与拖拽长度有关
    velocityFactor: 0.2 // velocity factor (converts vector from the mouse dragging to this environment)
};

function HorizontalBall(id, color, radius ,position, velocity, localDimensions) {
    // HorizontalBall constructor
    // call the base constructor
    Ball.call(this, id, color, radius, position, velocity.mult(horizontalMovementProperties.velocityFactor), localDimensions);
}

// HorizontalBall inherits from the Ball class
HorizontalBall.prototype = Object.create(Ball.prototype);
HorizontalBall.prototype.constructor = HorizontalBall; // keep the constructor

HorizontalBall.prototype.move = function() {
    if (this.velocity.isNearZero() && !this.velocity.isZero())
        this.velocity = Vector2D.zero(); // the ball is staying in place

    // move the ball using the velocity
    this.position = this.position.add(this.velocity);

    if (this.position.X <= this._borderCoords.left || this.position.X >= this._borderCoords.right) {
        // move ball inside the borders
        this.position.X = (this.position.X <= this._borderCoords.left) ?
                            this._borderCoords.left : this._borderCoords.right;

        // apply hit resistance
        this.velocity = this.velocity.mult(horizontalMovementProperties.hitResistance);

        // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is Y axis)
        this.velocity.X = -this.velocity.X;
    }
    if (this.position.Y <= this._borderCoords.top || this.position.Y >= this._borderCoords.bottom) {
        // move ball inside the borders
        this.position.Y = (this.position.Y <= this._borderCoords.top) ?
                            this._borderCoords.top : this._borderCoords.bottom;

        // apply hit resistance
        this.velocity = this.velocity.mult(horizontalMovementProperties.hitResistance);

        // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is X axis)
        this.velocity.Y = -this.velocity.Y;
    }

    // apply air resistance
    this.velocity = this.velocity.mult(horizontalMovementProperties.airResistance);
}

HorizontalBall.prototype.accelerate = function(acceleration) {
    // apply acceleration
    this.velocity = this.velocity.add(acceleration);
}

var Balls = {
    HorizontalBall: HorizontalBall,
};

export default Balls;

