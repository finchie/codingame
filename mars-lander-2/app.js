const MIN_THRUST = 0;
const MAX_THRUST = 4;

const ROTATION_STEP = 15;
const MAX_ROTATION = 90;
const MIN_ROTATION = -90;

const MIN_VERTICAL_SPEED = -40;
const MAX_HORIZONTAL_SPEED = 20;

const DEBUG_SEPARATOR = '----------------------------';

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return this.x + ' ' + this.y;
    }
}

class FlatGround {
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

class Terrain {
    constructor(surfacePoints) {
        this.surfacePoints = surfacePoints;
        this.landingSite = new FlatGround(surfacePoints);
        printErr('surfacePoints = ' + this.surfacePoints);
        printErr(DEBUG_SEPARATOR);
        printErr('landingSite.start = ' + this.landingSite.start);
        printErr('landingSite.end = ' + this.landingSite.end);
        printErr('landingSite.centre = ' + this.landingSite.centre);
        printErr(DEBUG_SEPARATOR);
    }
}

class Telemetry {
    constructor(x, y, hSpeed, vSpeed, fuel, rotation, power) {
        this.position = new Point(x, y);
        this.hSpeed = hSpeed;
        this.vSpeed = vSpeed;
        this.fuel = fuel;
        this.rotation = rotation;
        this.power = power;
    }
}

class Coordinate {
    constructor(radius, angle) {
        this.radius = radius;
        this.angle = angle; // degrees not radians!
    }
    toString() {
        return this.angle + ' ' + this.radius;
    }
}

function getTerrain() {
    // read surface
    const surfaceN = parseInt(readline()); // the number of points used to draw the surface of Mars.
    const surfacePoints = [];
    for (let i = 0; i < surfaceN; i++) {
        const inputs = readline().split(' ');
        const landX = parseInt(inputs[0]); // X coordinate of a surface point. (0 to 6999)
        const landY = parseInt(inputs[1]); // Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
        surfacePoints.push(new Point(landX, landY));
    }

    return new Terrain(surfacePoints);
}

function getTelemetry() {
    const inputs = readline().split(' ');
    const X = parseInt(inputs[0]);
    const Y = parseInt(inputs[1]);
    const hSpeed = parseInt(inputs[2]); // the horizontal speed (in m/s), can be negative.
    const vSpeed = parseInt(inputs[3]); // the vertical speed (in m/s), can be negative.
    const fuel = parseInt(inputs[4]); // the quantity of remaining fuel in liters.
    const rotation = parseInt(inputs[5]); // the rotation angle in degrees (-90 to 90).
    const power = parseInt(inputs[6]); // the thrust power (0 to 4).

    return new Telemetry(X, Y, hSpeed, vSpeed, fuel, rotation, power);
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

function initAccelerations() {
    const h = new Map(); // Map<Coordinate, Number>()
    const v = new Map(); // Map<Coordinate, Number>()
    for (let angle = MIN_ROTATION; angle <= MAX_ROTATION; angle += ROTATION_STEP) {
        for (let thrust = MIN_THRUST; thrust <= MAX_THRUST; thrust++) {
            h.set(new Coordinate(thrust, angle), calculateHorizontalAcceleration(thrust, angle));
            v.set(new Coordinate(thrust, angle), calculateVerticalAcceleration(thrust, angle));
        }
    }
    return {
        horizontal: h,
        vertical: v
    }
}

function calculateHorizontalAcceleration(thrust, angle) {
    return thrust * Math.sin(angle * Math.PI / 180); // convert angle in degrees to radians for sin function
}

function calculateVerticalAcceleration(thrust, angle) {
    return thrust * Math.cos(angle * Math.PI / 180); // convert angle in degrees to radians for sin function
}

function findClosestCoordinate(desiredAcceleration, accelerationMap) {
    let closestCoordinate, closestAcceleration;
    accelerationMap.forEach((acc, coord) => {
        if (!closestAcceleration || Math.abs(acc - desiredAcceleration) < Math.abs(closestAcceleration - desiredAcceleration)) {
            closestAcceleration = acc;
            closestCoordinate = coord;
        }
    });
    return closestCoordinate;
}

function isAbove(landingSite, position) {
    return position.x >= landingSite.start.x && position.x <= landingSite.end.x;
}

function calcAccelerationForVelocityAndDistance(finalVelocity, initialVelocity, distance) {
    printErr('finalVelocity = ' + finalVelocity);
    printErr('initialVelocity = ' + initialVelocity);
    printErr('distance = ' + distance);
    return Math.abs(Math.pow(finalVelocity, 2) - Math.pow(initialVelocity, 2)) / (2 * distance);
}

function averageCoordinates(coord1, coord2) {
    const averageAngle = (coord1.angle + coord2.angle) / 2;
    let closestAngle;
    const ANGLE_STEP = (ROTATION_STEP * (Math.abs(averageAngle) / averageAngle));
    for (let angle = 0; Math.abs(angle) <= Math.abs(averageAngle); angle += ANGLE_STEP) {
        closestAngle = angle;
    }

    const averageRadius =  (coord1.radius + coord2.radius) / 2;
    let closestRadius;
    const RADIUS_STEP = (Math.abs(averageRadius) / averageRadius);
    for (let radius = 0; Math.abs(radius) <= Math.abs(averageRadius); radius += RADIUS_STEP) {
        closestRadius = radius;
    }

    return new Coordinate(closestRadius, closestAngle);
}

// initialise
const accelerations = initAccelerations();

const terrain = getTerrain();

const telemetrySeries = [];

let time = 0;

const K = (4 / 6000);

// game loop
while (true) {
    // read telemetry
    const telemetry = getTelemetry();

    // save telemetry
    telemetrySeries.push(telemetry);

    const eX = telemetry.position.x - terrain.landingSite.centre.x;
    printErr('eX = ' + eX);
    const desiredHorizontalAcceleration = K * eX;
    printErr('desiredHorizontalAcceleration = ' + desiredHorizontalAcceleration);

    const targetCoordinateH = findClosestCoordinate(desiredHorizontalAcceleration, accelerations.horizontal);
    printErr('targetCoordinateH = ' + targetCoordinateH);

    const eVS = telemetry.vSpeed - MIN_VERTICAL_SPEED;
    const desiredVerticalAcceleration = calcAccelerationForVelocityAndDistance(0, telemetry.vSpeed, telemetry.position.y - terrain.landingSite.centre.y) + 3.711;
    printErr('desiredVerticalAcceleration = ' + desiredVerticalAcceleration);
    const targetCoordinateV = findClosestCoordinate(desiredVerticalAcceleration, accelerations.vertical);
    printErr('targetCoordinateV = ' + targetCoordinateV);

    const targetCoordinate = averageCoordinates(targetCoordinateH, targetCoordinateV);

    // let targetCoordinate;
    if (isAbove(terrain.landingSite, telemetry.position)) {
        // targetCoordinate = targetCoordinateV;
        // targetCoordinate.angle = 0;
    } else {
        // targetCoordinate = targetCoordinateH;
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...');

    // let aboveFlat = X >= terrain.landingSite.start.x && X <= terrain.landingSite.end.x;
    // let tooFastH = Math.abs(hSpeed) > 20;
    // let tooFastV = Math.abs(vSpeed) > 40;
    // let rotateNew, powerNew;

    /*
    * 5th strategy
    */

    // rotate power. rotate is the desired rotation angle. power is the desired thrust power.
    print(targetCoordinate.angle + ' ' + targetCoordinate.radius);

    time++;
}