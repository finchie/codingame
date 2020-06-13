const MAX_THRUST = 4;
const THRUST_3 = 3;
const ANGLE_STEP = -15;
const MAX_ROTATION = 90;
const MIN_ROTATION = -90;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return this.x + ' ' + this.y;
    }
}
class FlatGround{
    constructor(surfacePoints) {
        let flatEndIndex;
        surfacePoints.reduce(function(previousValue, currentValue, currentIndex) {
          if (previousValue.y === currentValue.y) {
              flatEndIndex = currentIndex;
          }
          return currentValue;
        });
        this.start = surfacePoints[flatEndIndex - 1];
        this.end = surfacePoints[flatEndIndex];
        this.centre = new Point((this.end.x - this.start.x)/2 + this.start.x, this.end.y);
    }
}

// read surface
const surfaceN = parseInt(readline()); // the number of points used to draw the surface of Mars.
const surfacePoints = [];
for (var i = 0; i < surfaceN; i++) {
    var inputs = readline().split(' ');
    var landX = parseInt(inputs[0]); // X coordinate of a surface point. (0 to 6999)
    var landY = parseInt(inputs[1]); // Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
    surfacePoints.push(new Point(landX, landY));
}
printErr('surfacePoints = ' + surfacePoints);
printErr('---------------');

// calculate flat ground
const landingSite = new FlatGround(surfacePoints);
printErr('landingSite.start = ' + landingSite.start);
printErr('landingSite.end = ' + landingSite.end);
printErr('landingSite.centre = ' + landingSite.centre);
printErr('---------------');

let hDistTotal;
let thrustIncrement, angle;
let time = 0;


let initialised = false;
function initialiseCourse(initialX, initialY, initialHSpeed, initialVSpeed, initialFuel, initialRotation, initialPower) {
    
    hDistTotal = landingSite.centre.x - initialX;
    const hDistHalf = hDistTotal / 2;
    const direction = (hDistTotal > 0) ? 1 : -1;
    printErr('hDistTotal = ' + hDistTotal);
    printErr('hDistHalf = ' + hDistHalf);
    
    const horizontalAcceleration = MAX_THRUST * Math.sin(-15 * Math.PI / 180);
    const hTimeAccelerating = accelerationTime(horizontalAcceleration, hDistHalf, initialHSpeed) - 25;
    printErr('horizontalAcceleration = ' + horizontalAcceleration);
    printErr('hTimeAccelerating = ' + hTimeAccelerating);
    printErr('---------------');
    
    thrustIncrement = new Array(initialFuel);
    angle = new Array(initialFuel);
    
    // accelerate towards halfway point
    let i = 0;
    while (i < MAX_THRUST) {
        thrustIncrement[i] = 1;
        angle[i++] = ANGLE_STEP * direction;
    }
    while (i < MAX_THRUST + hTimeAccelerating) {
        thrustIncrement[i] = 0;
        angle[i++] = ANGLE_STEP * direction;
    }
    while (i < MAX_THRUST + hTimeAccelerating + 1) {
        thrustIncrement[i] = 0;
        angle[i++] = 0;
    }
    // decelerate towards target
    // while (i < MAX_THRUST + hTimeAccelerating + 1 + THRUST_3) {
    //     thrustIncrement[i] = 1;
    //     angle[i++] = -ANGLE_STEP * direction;
    // }
    while (i < MAX_THRUST + hTimeAccelerating + 1 + hTimeAccelerating + 4) {
        thrustIncrement[i] = 0;
        angle[i++] = -ANGLE_STEP * direction;
    }
    // while (i < MAX_THRUST + hTimeAccelerating + 1 + hTimeAccelerating + 4 + 1) {
    //     thrustIncrement[i] = 1;
    //     angle[i++] = 0;
    // }
    while (i < MAX_THRUST + hTimeAccelerating + 1 + hTimeAccelerating + 4 + THRUST_3) {
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
    printErr('---------------');
    initialised = true;
    
    for (let index = 0; index < initialFuel; index++) {
        printErr('index = ' + index + ' thrustIncrement[i] = ' + thrustIncrement[index] + ', angle = ' + angle[index]);
    }
    printErr('---------------');
}

function accelerationTime(acceleration, distance, initialVelocity) {
    /**
     * dist dx = vt + 1/2 at
     * 
     * => t = (-v +/- sqrt(v^2 + 4adx)) / a
     */
    printErr('acceleration = ' + acceleration);
    printErr('distance = ' + distance);
    printErr('initialVelocity = ' + initialVelocity);
    const plus = ( (-1 * initialVelocity) + Math.sqrt((initialVelocity * initialVelocity) + Math.abs(4 * acceleration * distance))) / acceleration;
    const minus = ( (-1 * initialVelocity) - Math.sqrt((initialVelocity * initialVelocity) + Math.abs(4 * acceleration * distance))) / acceleration;
    // printErr('plus = ' + plus);
    // printErr('minus = ' + minus);
    return Math.max(plus, minus);
}


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
    
    if (!initialised) {
        initialiseCourse(X, Y, hSpeed, vSpeed, fuel, rotate, power);
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...');
    printErr('time = ' + time);
    
    let aboveFlat = X >= landingSite.start.x && X <= landingSite.end.x;
    let tooFastH = Math.abs(hSpeed) > 20;
    let tooFastV = Math.abs(vSpeed) > 40;
    let rotateNew, powerNew;
    
    let hDistRemaining = landingSite.centre.x - X;
    let hDistTravelled = hDistTotal - hDistRemaining;
    
    printErr('hDistTotal = ' + hDistTotal);
    printErr('hDistTravelled = ' + hDistTravelled);
    printErr('hDistRemaining = ' + hDistRemaining);
    printErr('---------------');
    
    /*
    * 4th strategy
    */

    // rotate power. rotate is the desired rotation angle. power is the desired thrust power.
    print(angle[time] + ' ' + (power + thrustIncrement[time]));
    
    time++;
}