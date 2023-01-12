let StickStatus ={
    x: 0,
    y: 0,
};

/**
 * @desc Principal object that draw a joystick, you only need to initialize the object and suggest the HTML container
 * @constructor
 * @param container {String} - HTML object that contains the Joystick
 * @param parameters (optional) - object with following keys:
 *  title {String} (optional) - The ID of canvas (Default value is 'joystick')
 *  width {Int} (optional) - The width of canvas, if not specified is set at width of container object (Default value is the width of container object)
 *  height {Int} (optional) - The height of canvas, if not specified is set at height of container object (Default value is the height of container object)
 *  internalFillColor {String} (optional) - Internal color of Stick (Default value is '#00AA00')
 *  internalLineWidth {Int} (optional) - Border width of Stick (Default value is 2)
 *  internalStrokeColor {String}(optional) - Border color of Stick (Default value is '#003300')
 *  externalLineWidth {Int} (optional) - External reference circonference width (Default value is 2)
 *  externalStrokeColor {String} (optional) - External reference circonference color (Default value is '#008000')
 *  autoReturnToCenter {Bool} (optional) - Sets the behavior of the stick, whether or not, it should return to zero position when released (Default value is True and return to zero)
 * @param callback {StickStatus} - 
 */
function JoyStick(container, parameters, callback){
    parameters = parameters || {};
    var title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title),
        width = (typeof parameters.width === "undefined" ? 0 : parameters.width),
        height = (typeof parameters.height === "undefined" ? 0 : parameters.height),

        internalFillColor = (typeof parameters.internalFillColor === "undefined" ? "#00ffff" : parameters.internalFillColor),
        internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth),
        internalStrokeColor = (typeof parameters.internalStrokeColor === "undefined" ? "#003300" : parameters.internalStrokeColor),
        
        externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth),
        externalStrokeColor = (typeof parameters.externalStrokeColor ===  "undefined" ? "#008000" : parameters.externalStrokeColor),
        
        autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter);

    // 这个函数是...也许是想把一部分东西交出去，给外界一个操作口，但，目前是没有这个需求..
    callback = callback || function(StickStatus) {};

    // Create Canvas element and add it in the Container object
    var objContainer = document.getElementById(container);
    
    // Fixing Unable to preventDefault inside passive event listener due to target being treated as passive in Chrome [Thanks to https://github.com/artisticfox8 for this suggestion]
    objContainer.style.touchAction = "none";

    var canvas = document.createElement("canvas");
    canvas.id = title;
    if(width === 0) { width = objContainer.clientWidth; }
    if(height === 0) { height = objContainer.clientHeight; }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context=canvas.getContext("2d");

    var pressed = 0; // Bool - 1=Yes - 0=No
    var circumference = 2 * Math.PI;
    var internalRadius = (canvas.width-((canvas.width/2)+10))/2;
    // 你可真是...写了一堆魔法数字是吧。。
    var maxMoveStick = internalRadius + 5;
    var externalRadius = internalRadius + 30;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    // Used to save current position of stick
    var movedX=centerX;
    var movedY=centerY;

    // just add the EventListener
    canvas.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    canvas.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    
    // Draw the object
    drawExternal();
    drawInternal();

    /******************************************************
     * Private methods
     *****************************************************/

    /**
     * @desc Draw the external circle used as reference position
     */
    function drawExternal() {
        context.beginPath();
        context.arc(centerX, centerY, externalRadius, 0, circumference, false);
        context.lineWidth = externalLineWidth;
        context.strokeStyle = externalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Draw the internal stick in the current position the user have moved it
     */
    function drawInternal() {
        context.beginPath();


        if((movedY - centerY) * (movedY - centerY) + (movedX - centerX) * (movedX - centerX) > (internalRadius * internalRadius)) {
            var angle = Math.atan2((movedY - centerY),(movedX - centerX));
            movedX = centerX + internalRadius * Math.cos(angle);
            movedY = centerY + internalRadius * Math.sin(angle);
        } 

        context.arc(movedX, movedY, internalRadius, 0, circumference, false);
        // create radial gradient
        var grd = context.createRadialGradient(centerX, centerY, 5, centerX, centerY, 200);
        // Light color
        grd.addColorStop(0, internalFillColor);
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Events for manage touch
     */
    function onTouchStart() {
        pressed = 1;
    }
    // 哈...原来的代码是分开的，变量确实共用的。
     
    function onTouchMove(event) {
        if(pressed === 1) {
          if ('touches' in event) {
            // 我真tmd机智...但为什么在另一边直接用点语法就不会报错，而是执行？只是个 undefined 啊...为什么用 in 就...
            movedX = event.touches[0].pageX;
            movedY = event.touches[0].pageY;
          }else{
            movedX = event.pageX;
            movedY = event.pageY;
          }
          // Manage offset 。。这地方很诡异...touch和mouse的offset不一样
          if(canvas.offsetParent.tagName.toUpperCase() === "BODY"){
              movedX -= canvas.offsetLeft;
              movedY -= canvas.offsetTop;
          }
          else {
              movedX -= canvas.offsetParent.offsetLeft;
              movedY -= canvas.offsetParent.offsetTop;
          }
          // Delete canvas
          context.clearRect(0, 0, canvas.width, canvas.height);
          // Redraw object
          drawExternal();
          drawInternal();

            // Set attribute of callback
            // StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            // StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();

            // callback(StickStatus);
        }
    } 

    function onTouchEnd() {
        pressed = 0;
        // If required reset position store variable
        if(autoReturnToCenter){
            movedX = centerX;
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();

        // Set attribute of callback
        // StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
        // StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();

        // callback(StickStatus);
    }

    /**
     * @desc Events for manage mouse
     */
    function onMouseDown() {
        pressed = 1;
    }
    
    function onMouseMove(event) {
        if(pressed === 1) {
          onTouchMove(event);
        }
    }

    function onMouseUp(event) {
        pressed = 0;
        onTouchEnd(event);
    }


    /******************************************************
     * Public methods
     *****************************************************/

    /**
     * @desc Normalized value of X/Y move of stick
     * @return Integer from -100 to +100
     */
    this.GetX = function () {
        return (100*((movedX - centerX)/maxMoveStick)).toFixed();
    };
    this.GetY = function () {
        return ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
    };
};

let myStick = JoyStick
export default myStick