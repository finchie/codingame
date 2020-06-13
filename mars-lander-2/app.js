/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var surfaceN = parseInt(readline()); // the number of points used to draw the surface of Mars.
//printErr('surfaceN = ' + surfaceN);
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    toString() {
        return this.x + ' ' + this.y;
    }
}
const surfacePoints = [];
for (var i = 0; i < surfaceN; i++) {
    var inputs = readline().split(' ');
    var landX = parseInt(inputs[0]); // X coordinate of a surface point. (0 to 6999)
    var landY = parseInt(inputs[1]); // Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
    surfacePoints.push(new Point(landX, landY));
}

// calculate flat ground
let flatEndIndex;

surfacePoints.reduce(function(previousValue, currentValue, currentIndex, array) {
  if (previousValue.y === currentValue.y) {
      flatEndIndex = currentIndex;
  }
  return currentValue;
});

const ANGLE_STEP = -15;
const MAX_THRUST = 4;
const THRUST_3 = 3;
const flatStart = surfacePoints[flatEndIndex - 1];
const flatEnd = surfacePoints[flatEndIndex];
const flatCentre = new Point((flatEnd.x - flatStart.x)/2 + flatStart.x, flatEnd.y);
let hDistTotal, hDistHalf, hTimeAccelerating, direction;
let thrustIncrement, angle;
let time = 0;

printErr('surfacePoints = ' + surfacePoints);
printErr('flatStart = ' + flatStart);
printErr('flatEnd = ' + flatEnd);
printErr('flatCentre = ' + flatCentre);

let initialised = false;
function initialiseCourse(initialX, initialY, initialHSpeed, initialVSpeed, initialFuel, initialRotation, initialPower) {
    
    hDistTotal = flatCentre.x - initialX;
    hDistHalf = hDistTotal / 2;
    direction = (hDistTotal > 0) ? 1 : -1;
    printErr('hDistTotal = ' + hDistTotal);
    printErr('hDistHalf = ' + hDistHalf);
    
    hAcceleration = (-ANGLE_STEP / 90) * MAX_THRUST;
    hTimeAccelerating = Math.sqrt(Math.abs(hDistHalf) / hAcceleration);
    printErr('hAcceleration = ' + hAcceleration);
    printErr('hTimeAccelerating = ' + hTimeAccelerating);
    
    thrustIncrement = new Array(initialFuel);
    angle = new Array(initialFuel);
    
    // accelerate towards halfway point
    let i = 0;
    while (i < MAX_THRUST) {
        thrustIncrement[i] = 1;
        angle[i++] = 0;
    }
    while (i < MAX_THRUST + hTimeAccelerating) {
        thrustIncrement[i] = 0;
        angle[i++] = ANGLE_STEP * direction;
    }
    while (i < MAX_THRUST + hTimeAccelerating + MAX_THRUST) {
        thrustIncrement[i] = -1;
        angle[i++] = 0;
    }
    // decelerate towards target
    while (i < MAX_THRUST + hTimeAccelerating + MAX_THRUST + THRUST_3) {
        thrustIncrement[i] = 1;
        angle[i++] = -ANGLE_STEP * direction;
    }
    while (i < MAX_THRUST + hTimeAccelerating + MAX_THRUST + THRUST_3 + hTimeAccelerating) {
        thrustIncrement[i] = 0;
        angle[i++] = -ANGLE_STEP * direction;
    }
    while (i < MAX_THRUST + hTimeAccelerating + MAX_THRUST + THRUST_3 + hTimeAccelerating + 1) {
        thrustIncrement[i] = 1;
        angle[i++] = 0;
    }
    while (i < MAX_THRUST + hTimeAccelerating + MAX_THRUST + THRUST_3 + hTimeAccelerating + THRUST_3) {
        thrustIncrement[i] = 0;
        angle[i++] = 0;
    }
    // descend safely to landing
    for (let index = 0; index < 0; index++) {
        thrustIncrement[i] = 1;
        angle[i++] = 0;
    }
    // let x = 0, period = 6;
    // while (i < initialFuel) {
    //     if (x === 0) {
    //         thrustIncrement[i] = 1;
    //     }
    //     else if (x === 5) {
    //         thrustIncrement[i] = -1;
    //     }
    //     else {
    //         thrustIncrement[i] = 0;
    //     }
    //     angle[i++] = 0;
    //     x = (x + 1) % period;
    // }
    while (i < initialFuel) {
        thrustIncrement[i] = 0;
        angle[i++] = 0;
    }
    
    
    printErr('initialiseCourse');
    printErr('initialX = ' + initialX);
    printErr('initialY = ' + initialY);
    printErr('initialHSpeed = ' + initialHSpeed);
    printErr('initialVSpeed = ' + initialVSpeed);
    printErr('initialRotation = ' + initialRotation);
    printErr('initialPower = ' + initialPower);
    initialised = true;
    
    for (let index = 0; index < initialFuel; index++) {
        printErr('index = ' + index + ' thrustIncrement[i] = ' + thrustIncrement[index]);
    }
}

const MAX_ROTATION = 90;
const MIN_ROTATION = -90;

function rotateClockwise(angle) {
    if (angle === MIN_ROTATION) {
        return angle;
    }
    else {
        return angle - 15;
    }
}
function rotateAntiClockwise(angle) {
    if (angle === MAX_ROTATION) {
        return angle;
    }
    else {
        return angle + 15;
    }
}


// game loop
while (true) {
    var inputs = readline().split(' ');
    var X = parseInt(inputs[0]);
    var Y = parseInt(inputs[1]);
    var hSpeed = parseInt(inputs[2]); // the horizontal speed (in m/s), can be negative.
    var vSpeed = parseInt(inputs[3]); // the vertical speed (in m/s), can be negative.
    var fuel = parseInt(inputs[4]); // the quantity of remaining fuel in liters.
    var rotate = parseInt(inputs[5]); // the rotation angle in degrees (-90 to 90).
    var power = parseInt(inputs[6]); // the thrust power (0 to 4).

    // Write an action using print()
    // To debug: printErr('Debug messages...');
    printErr('time = ' + time);
    
    if (!initialised) {
        initialiseCourse(X, Y, hSpeed, vSpeed, fuel, rotate, power);
    }
    
    let aboveFlat = X >= flatStart.x && X <= flatEnd.x;
    let tooFastH = Math.abs(hSpeed) > 20;
    let tooFastV = Math.abs(vSpeed) > 40;
    let rotateNew, powerNew;
    
    let hDistRemaining = flatCentre.x - X;
    let hDistTravelled = hDistTotal - hDistRemaining;
    
    printErr('hDistTotal = ' + hDistTotal);
    printErr('hDistTravelled = ' + hDistTravelled);
    printErr('hDistRemaining = ' + hDistRemaining);
    
    /*
    * 4th strategy
    */

    // rotate power. rotate is the desired rotation angle. power is the desired thrust power.
    print(angle[time] + ' ' + (power + thrustIncrement[time]));
    
    time++;
}