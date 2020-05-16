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

class Pac {
    constructor(id, cell, type, speedTurnsLeft, abilityCooldown) {
        this.id = id;
        this.cell = cell;
        this.type = type;
        this.speedTurnsLeft = speedTurnsLeft;
        this.abilityCooldown = abilityCooldown;
    }
    toString() {
        return this.id + ' ' + this.cell + ' ' + this.type + ' ' + this.speedTurnsLeft + ' ' + this.abilityCooldown;
    }
}

const FLOOR = ' ';
const WALL = '#';
const PELLET = '.'
const SUPER_PELLET = 'o';
const MY_PAC = '*';
const YOUR_PAC = '^';

// initialisation
var inputs = readline().split(' ');
const width = parseInt(inputs[0]); // size of the grid
const height = parseInt(inputs[1]); // top left corner is (x=0, y=0)
const grid = [];
let previousPacPositions = [];

for (let i = 0; i < height; i++) {
    const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
    const rowWithPellets = row.replace(/ /g, PELLET);
    grid.push(rowWithPellets);
}


// game loop
while (true) {
    // loop init
    let pellets = [];
    let superPellets = [];
    let possiblePellets = [];
    let myPacs = new Map();
    let yourPacs = new Map();

    // gather score data
    var inputs = readline().split(' ');
    const myScore = parseInt(inputs[0]);
    const opponentScore = parseInt(inputs[1]);

    // gather pac data
    const visiblePacCount = parseInt(readline()); // all your pacs and enemy pacs in sight
    console.error('visiblePacCount=' + visiblePacCount);
    for (let i = 0; i < visiblePacCount; i++) {
        var inputs = readline().split(' ');
        const pacId = parseInt(inputs[0]); // pac number (unique within a team)
        const mine = inputs[1] !== '0'; // true if this pac is yours
        const x = parseInt(inputs[2]); // position in the grid
        const y = parseInt(inputs[3]); // position in the grid
        const typeId = inputs[4]; // ROCK or PAPER or SCISSORS
        const speedTurnsLeft = parseInt(inputs[5]); // number of remaining turns before speed effect fades
        const abilityCooldown = parseInt(inputs[6]); // number of turns until you can request a new ability for this pac
        const pac = new Pac(pacId, new Cell(x,y), typeId, speedTurnsLeft, abilityCooldown)
        if (mine) {
            myPacs.set(pacId, pac);
        } else {
            yourPacs.set(pacId, pac);
        }
    }

    // move pacs
    // first erase previous pac positions
    previousPacPositions.forEach(cell => {
        setGridCell(grid, cell, FLOOR);
    });
    // then add pacs to grid
    myPacs.forEach(pac => {
        setGridCell(grid, pac.cell, MY_PAC);
    });
    yourPacs.forEach(pac => {
        setGridCell(grid, pac.cell, YOUR_PAC);
    });
    // finally store new pac positions
    previousPacPositions = [];
    myPacs.forEach(pac => {
        previousPacPositions.push(pac.cell);
    });
    yourPacs.forEach(pac => {
        previousPacPositions.push(pac.cell);
    });

    // gather visible pellet data
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

    // add super pellets to grid
    superPellets.forEach(cell => {
        setGridCell(grid, cell, SUPER_PELLET);
    });

    // add visible pellets to grid
    pellets.forEach(cell => {
        setGridCell(grid, cell, PELLET);
    });

    // detect possible pellets
    grid.forEach((row, rowIndex) => {
        row.split('').forEach((char, charIndex) => {
            if(char == PELLET) {
                possiblePellets.push(new Cell(charIndex, rowIndex));
            }
        });
    });

    // display grid
    grid.forEach(row => {
        console.error(row);
    });

    // pseudo code / game logic
    // determine closest pac-superPellet pairs
    // while superPellets exist:
    // - target them & 
    // - give each superPellet hunter one speed boost
    const untargetedPacs = new Map(myPacs);
    const untargetedSuperPellets = superPellets.slice(0);
    const targetedPacs = new Map()

    while (untargetedPacs.size > 0 && untargetedSuperPellets.length > 0) {
        let closestPairs = new Map();
        untargetedPacs.forEach(pac => {
            const closestTarget = findClosest(pac.cell, untargetedSuperPellets);
            const closestDistance = simpleDistance(pac.cell, closestTarget);
            closestPairs.set(closestDistance, [pac, closestTarget]);
        });
        closestPairs = sortMap(closestPairs);
        // console.error('closestPairs');
        // console.error(closestPairs);
        const closestPair = closestPairs.get(closestPairs.keys().next().value);
        // console.error('closestPair');
        // console.error(closestPair);
        const closestPac = closestPair[0];
        const closestTarget = closestPair[1];
        targetedPacs.set(closestPac, closestTarget);
        // remove targeted pac & pellet from untargeted map/array
        untargetedPacs.delete(closestPac.id);
        removeFromArray(closestTarget, untargetedSuperPellets);
    }

    // find targets for pacs with no superpellets
    const targets = (
            (pellets.length > 0 && pellets.length >= untargetedPacs.size)
            ? pellets : possiblePellets
        ).slice(0);
    untargetedPacs.forEach(pac => {
        if(targets.length > 0) {
            let target;
            let existingTargets = Array.from(targetedPacs.values());
            let closestExistingTarget;
            let closestExistingTargetDistance;
            // find closest pellet, excluding targets too close to existing targets
            do {
                target = findClosest(pac.cell, targets);
                // remove target so other pacs don't target same pellet
                removeFromArray(target, targets);
                if (existingTargets.length > 0) {
                    // calc distance from other targets
                    closestExistingTarget = findClosest(target, existingTargets);
                    closestExistingTargetDistance = simpleDistance(target, closestExistingTarget);
                } else {
                    closestExistingTargetDistance = Number.MAX_SAFE_INTEGER;
                }
            } while (closestExistingTargetDistance < 1.4);
            targetedPacs.set(pac, target);
        } else {
            let target;
            switch(pac.id) {
                case 0:
                    target = new Cell(0, 0);
                    break;
                case 1:
                    target = new Cell(width, 0);
                    break;
                case 2:
                    target = new Cell(0, height);
                    break;
                case 3:
                    target = new Cell(width, height);
                    break;
                case 4:
                    target = new Cell(15, 10);
                    break;
            }
            targetedPacs.set(pac, target);
        }
    });
    console.error('targetedPacs');
    console.error(targetedPacs);

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    // console.log('MOVE 0 15 10');

    // construct move commands
    let cmd = '';
    targetedPacs.forEach((target, pac) => {
        cmd = cmd + 'MOVE ' + pac.id + ' ' + target.x + ' ' + target.y + ' | ';
    });

    // let superTargets = superPellets.slice(0);
    // let targets = pellets.slice(0);
    // myPacs.forEach((pac) => {
    //     console.error(pac);
    //      if (superTargets.length > 0) {
    //         // find closest super pellet
    //         const target = findClosest(pac.cell, superTargets);
    //         // remove target so other pacs don't target same super pellet
    //         removeFromArray(target, superTargets);
    //         cmd = cmd + 'MOVE ' + pac.id + ' ' + target.x + ' ' + target.y + ' | ';
    //     } else if(targets.length > 0) {
    //         // find closest pellet
    //         const target = findClosest(pac.cell, targets);
    //         // remove target so other pacs don't target same pellet
    //         removeFromArray(target, targets);
    //         cmd = cmd + 'MOVE ' + pac.id + ' ' + target.x + ' ' + target.y + ' | ';
    //     } else {
    //         cmd = cmd + 'MOVE ' + pac.id + ' ' + '15' + ' ' + '10' + ' | ';     // MOVE <pacId> <x> <y>
    //     }
    // });
    console.error('visiblePelletCount=' + visiblePelletCount);
    
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

function sortMap(map) {
    const keyIterator = map.keys();
    const keyArray = [];
    let iteration = keyIterator.next();
    while (!iteration.done) {
        keyArray.push(iteration.value);
        iteration = keyIterator.next();
    }
    keyArray.sort(function(a,b) { return +a - +b });
    const sortedMap = new Map();
    keyArray.forEach(key => {
        sortedMap.set(key, map.get(key));
    });

    return sortedMap;
}

function setGridCell(grid, cell, char) {
    grid[cell.y] = replaceAt(grid[cell.y], cell.x, char);
}

function replaceAt(value, index, replacement) {
    return value.substr(0, index) + replacement + value.substr(index + replacement.length);
}
