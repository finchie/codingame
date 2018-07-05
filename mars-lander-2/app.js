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

const flatStart = surfacePoints[flatEndIndex - 1];
const flatEnd = surfacePoints[flatEndIndex];
const flatCentre = new Point((flatEnd.x - flatStart.x)/2 + flatStart.x, flatEnd.y);
const accelerationDistance = 127.333;
const phase1aDistance = accelerationDistance * 0.2;
const phase1bDistance = accelerationDistance * 0.667;
const minDistanceForMaxThrust = accelerationDistance * 2;
let hDistTotal;
let useMaxThrust = false;
let time = 0;

printErr('surfacePoints = ' + surfacePoints);
printErr('flatStart = ' + flatStart);
printErr('flatEnd = ' + flatEnd);
printErr('flatCentre = ' + flatCentre);

let initialised = false;
function initialiseCourse(initialX, initialY, initialHSpeed, initialVSpeed, initialRotation, initialPower) {
    
    hDistTotal = flatCentre.x - initialX;
    printErr('hDistTotal = ' + hDistTotal);
    if (hDistTotal > minDistanceForMaxThrust) {
        useMaxThrust = true;
    }
    
    printErr('initialiseCourse');
    printErr('initialX = ' + initialX);
    printErr('initialY = ' + initialY);
    printErr('initialHSpeed = ' + initialHSpeed);
    printErr('initialVSpeed = ' + initialVSpeed);
    printErr('initialRotation = ' + initialRotation);
    printErr('initialPower = ' + initialPower);
    printErr('useMaxThrust = ' + useMaxThrust);
    initialised = true;
    
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
        initialiseCourse(X, Y, hSpeed, vSpeed, rotate, power);
    }
    
    let aboveFlat = X >= flatStart.x && X <= flatEnd.x;
    let tooFastH = Math.abs(hSpeed) > 20;
    let tooFastV = Math.abs(vSpeed) > 40;
    let rotateNew, powerNew;
    
    /*
    * 1st strategy
    */
    // if (tooFastH) {
    //     rotateNew = (hSpeed > 0) ? rotate + 15 :rotate - 15;
    // }
    // else if (aboveFlat && !tooFastH) {
    //     /*
    //     if (Math.abs(rotate) < 15) {
    //         rotate = 0;
    //     }
    //     else {
    //         rotate += 15 * ((rotate > 0) ? -1 : 1);
    //     }
    //     */
    //     rotateNew = rotate;
    // }
    // else if (X < flatStart.x) {
    //     rotateNew = rotate - 15;
    // }
    // else if (X > flatStart.x) {
    //     rotateNew = rotate + 15;
    // }
    
    /*
    2nd strategy
    */
    // if (aboveFlat) {
    //     // straighten up
    //     if (rotate > 0) {
    //         rotateNew = rotateClockwise(rotate);
    //     }
    //     else if (rotate < 0) {
    //         rotateNew = rotateAntiClockwise(rotate);
    //     }
    //     else {
        
    //         if (tooFastH) {
    //             // slow down
    //             if (hSpeed < 0) {
    //                 rotateNew = rotateClockwise(rotate);
    //             }
    //             else if (hSpeed > 0) {
    //                 rotateNew = rotateAntiClockwise(rotate);
    //             }
    //         }
    //         else {
    //             rotateNew = rotate;
    //         }
    //     }
        
    //     if (tooFastV) {
    //         // slow down
    //     }
    // }
    // else if (X < flatStart.x) {
    //     if (rotate >= 0) {
    //         rotateNew = rotateClockwise(rotate);
    //     }
    //     else {
    //         rotateNew = rotate;
    //     }
    // }
    // else if (X > flatEnd.x) {
    //     if (rotate <= 0) {
    //         rotateNew = rotateAntiClockwise(rotate);
    //     }
    //     else {
    //         rotateNew = rotate;
    //     }
    // }
    
    /*
    * 3rd strategy
    */
    let hDistRemaining = flatCentre.x - X;
    let hDistTravelled = hDistTotal - hDistRemaining;
    let phase1a = hDistTravelled < (phase1aDistance);
    let phase1b = !phase1a && hDistTravelled < accelerationDistance;
    let phase2  = hDistTravelled > accelerationDistance && hDistRemaining > accelerationDistance;
    let phase3b = hDistRemaining < (phase1aDistance);
    let phase3a = !phase3b && hDistRemaining < accelerationDistance;
    
    printErr('hDistTotal = ' + hDistTotal);
    printErr('hDistTravelled = ' + hDistTravelled);
    printErr('hDistRemaining = ' + hDistRemaining);
    
    if (useMaxThrust) {
        if (phase1a) {
            printErr('phase1a');
            powerNew = (power + 1);
            if (powerNew > 4) {
                powerNew = 4;
            }
            if (hDistTotal >= 0) {
                rotateNew = rotateClockwise(rotate);
            }
            else if (hDistTotal < 0) {
                rotateNew = rotateAntiClockwise(rotate);
            }
            else {
                rotateNew = rotate;
            }
        }
        else if (phase1b) {
            printErr('phase1b');
            powerNew = power;
            if (hDistTotal >= 0) {
                rotateNew = rotateAntiClockwise(rotate);
            }
            else if (hDistTotal < 0) {
                rotateNew = rotateClockwise(rotate);
            }
            else {
                rotateNew = rotate;
            }
        }
        else if (phase3a) {
            printErr('phase3a');
            powerNew = power;
            if (hDistTotal >= 0) {
                rotateNew = rotateClockwise(rotate);
            }
            else if (hDistTotal < 0) {
                rotateNew = rotateAntiClockwise(rotate);
            }
            else {
                rotateNew = rotate;
            }
        }
        else if (phase3b) {
            printErr('phase3b');
            powerNew = (power - 1);
            if (powerNew < 0) {
                powerNew = 0;
            }
            if (hDistTotal >= 0) {
                rotateNew = rotateAntiClockwise(rotate);
            }
            else if (hDistTotal < 0) {
                rotateNew = rotateClockwise(rotate);
            }
            else {
                rotateNew = rotate;
            }
        }
        else {
            // phase 2
            powerNew = power;
            rotateNew = rotate;
        }
    }
    
    // const height = Y - flatStart.y;
    // const secondsTilImpact = height / vSpeed;
    
    // if (height < 1500) {
    //     powerNew = 4;
    // }
    // else {
    //     powerNew = 3;
    // }

    // rotate power. rotate is the desired rotation angle. power is the desired thrust power.
    print(rotateNew + ' ' + powerNew);
    
    time++;
}