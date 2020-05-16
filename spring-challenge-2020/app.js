/**
 * Grab the pellets as fast as you can!
 **/

// classes to represent game objects
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(otherCell) {
        return (this.x === otherCell.x) && (this.y === otherCell.y);
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

class Trail {
    constructor() {
        this.moves = [];
    }
    push(cell) {
        this.moves.push(cell);
    }
    getLastCell(indexFromEnd) {
        return this.moves[this.moves.length - 1 - indexFromEnd];
    }
    getLastDistinctCell(index) {
        if (index < 1) {
            return this.getLastCell(0);
        } else {
            let indexFromEnd = 0;
            let currentCell, previousCell;
            while (index > 0 && indexFromEnd < this.moves.length) {
                currentCell = this.getLastCell(indexFromEnd);
                previousCell = this.getLastCell(indexFromEnd + 1);
                if (!currentCell.equals(previousCell)) {
                    index -= 1;
                }
                indexFromEnd += 1;
            }
            return previousCell;
        }
    }
    isBlocked() {
        if (this.moves.length < 2) {
            return false;
        } else {
            const lastCell = this.getLastCell(0);
            const penultimateCell = this.getLastCell(1);
            return lastCell.equals(penultimateCell);
        }
    }
    toString() {
        return this.moves;
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
const trailMap = new Map();
const cmdMap = new Map();

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
    let blockageUnresolved = true;

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

            // create trail if 1st round
            if(!trailMap.has(pacId)) {
                trailMap.set(pacId, new Trail());
            }

            // add current location to trail
            const trail = trailMap.get(pacId);
            trail.push(pac.cell);

            // create cmd history if 1st round
            if(!cmdMap.has(pac.id)) {
                cmdMap.set(pac.id, []);
            }
        } else {
            yourPacs.set(pacId, pac);
        }
    }
    console.error('visible enemy pacs=' + yourPacs.size);

    // move pacs in model
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
    const targetedPacs = new Map();

    // unblock any pacs that are blocked
    untargetedPacs.forEach(pac => {
        const trail = trailMap.get(pac.id);
        const commands = cmdMap.get(pac.id);
        const SPEED_COMMAND = 'SPEED ' + pac.id + ' |';
        const lastCommand = commands[commands.length - 1];
        if (lastCommand !== SPEED_COMMAND && trail.isBlocked() && blockageUnresolved) {
            console.error(pac.id + ' is blocked, trail=' + trail.toString());
            // target penultimate distinct cell (i.e. go back 2 or 3 moves in case SPEED is on)
            const target = trail.getLastDistinctCell(1);
            targetedPacs.set(pac, target);
            untargetedPacs.delete(pac.id);
            blockageUnresolved = false;
        }
    });

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
    untargetedPacs.forEach(pac => {
        const targets = (
                pelletsVisibleToPac(pac, pellets) ? pellets : possiblePellets
            ).slice(0);
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

    // construct commands
    let cmd = '';
    targetedPacs.forEach((target, pac) => {
        let pacCommand;
        if (pac.abilityCooldown == 0) {
            pacCommand = 'SPEED ' + pac.id + ' |';
        } else {
            pacCommand = 'MOVE ' + pac.id + ' ' + target.x + ' ' + target.y + ' | ';
        }

        // add command to history
        cmdMap.get(pac.id).push(pacCommand);

        // add command to output
        cmd += pacCommand;
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
    console.error('findClosest cell=' + cell + ', targets=' + targets);
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

function pelletsVisibleToPac(pac, pellets) {
    pellets.forEach(pellet => {
        if (pellet.x === pac.cell.x || pellet.y === pac.cell.y) {
            return true;
        }
    });
    return false;
}
