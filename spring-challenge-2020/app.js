/**
 * Grab the pellets as fast as you can!
 **/

// classes to represent game objects
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return this.x + ' ' + this.y;
    }
}

// initialisation
var inputs = readline().split(' ');
const width = parseInt(inputs[0]); // size of the grid
const height = parseInt(inputs[1]); // top left corner is (x=0, y=0)
const grid = [];

for (let i = 0; i < height; i++) {
    const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
    grid.push(row);
}

// game loop
while (true) {
    // loop init
    let pellets = [];
    let superPellets = [];
    let myPacs = new Map();

    var inputs = readline().split(' ');
    const myScore = parseInt(inputs[0]);
    const opponentScore = parseInt(inputs[1]);
    const visiblePacCount = parseInt(readline()); // all your pacs and enemy pacs in sight
    for (let i = 0; i < visiblePacCount; i++) {
        var inputs = readline().split(' ');
        const pacId = parseInt(inputs[0]); // pac number (unique within a team)
        const mine = inputs[1] !== '0'; // true if this pac is yours
        const x = parseInt(inputs[2]); // position in the grid
        const y = parseInt(inputs[3]); // position in the grid
        const typeId = inputs[4]; // unused in wood leagues
        const speedTurnsLeft = parseInt(inputs[5]); // unused in wood leagues
        const abilityCooldown = parseInt(inputs[6]); // unused in wood leagues
        if (mine) {
            myPacs.set(pacId, new Cell(x,y));
        }
    }

    const visiblePelletCount = parseInt(readline()); // all pellets in sight
    for (let i = 0; i < visiblePelletCount; i++) {
        var inputs = readline().split(' ');
        const x = parseInt(inputs[0]);
        const y = parseInt(inputs[1]);
        const value = parseInt(inputs[2]); // amount of points this pellet is worth
        if (value == 10) {
            superPellets.push(new Cell(x, y));
        } else {
            pellets.push(new Cell(x, y));
        }
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    // console.log('MOVE 0 15 10');

    // construct move commands
    let cmd = '';
    let superTargets = superPellets.slice(0);
    let targets = pellets.slice(0);
    myPacs.forEach((cell, pacId) => {
        console.error('pacId=' + pacId + ', cell=' + cell);
         if (superTargets.length > 0) {
            // find closest super pellet
            const target = findClosest(cell, superTargets);
            // remove target so other pacs don't target same super pellet
            removeFromArray(target, superTargets);
            cmd = cmd + 'MOVE ' + pacId + ' ' + target.x + ' ' + target.y + ' |';
        } else if(targets.length > 0) {
            // find closest super pellet
            const target = findClosest(cell, targets);
            // remove target so other pacs don't target same pellet
            removeFromArray(target, targets);
            cmd = cmd + 'MOVE ' + pacId + ' ' + target.x + ' ' + target.y + ' |';
        } else {
            cmd = cmd + 'MOVE 0 ' + '15' + ' ' + '10' + ' ' + 'p=' + visiblePelletCount;     // MOVE <pacId> <x> <y>
        }
    });
    
    console.log(cmd);
}

function simpleDistance(cell1, cell2) {
    const a = Math.abs(cell1.x - cell2.x);
    const b = Math.abs(cell1.y - cell2.y);
    return Math.sqrt(a*a + b*b);
}

function findClosest(cell, targets) {
    let closestDistance = Number.MAX_SAFE_INTEGER;
    let closestTarget = targets[0];
    targets.forEach((target) => {
        let distance = simpleDistance(cell, target);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestTarget = target;
        }
    });
    return closestTarget;
}

function removeFromArray(element, array) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}
