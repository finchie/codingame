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
class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.rows = [];
    }
    addRow(row) {
        this.rows.push(row);
    }
    setCellContents(cell, char) {
        this.rows[cell.y] = this.replaceAt(this.rows[cell.y], cell.x, char);
    }
    replaceAt(value, index, replacement) {
        return value.substr(0, index) + replacement + value.substr(index + replacement.length);
    }
    getCellContents(cell) {
        // console.error('cell [' + cell + ']=' + this.grid[cell.y].substr(cell.x, 1));
        return this.rows[cell.y].substr(cell.x, 1);
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
        this.positions = [];
        this.commands = [];
    }
    addMove(cell) {
        this.positions.push(cell);
    }
    getLastCell(indexFromEnd) {
        return this.positions[this.positions.length - 1 - indexFromEnd];
    }
    getLastDistinctCell(index) {
        if (index < 1) {
            return this.getLastCell(0);
        } else {
            let indexFromEnd = 0;
            let currentCell, previousCell;
            while (index > 0 && indexFromEnd < this.positions.length - 1) {
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
    isStationary() {
        if (this.positions.length < 2) {
            return false;
        } else {
            const lastCell = this.getLastCell(0);
            const penultimateCell = this.getLastCell(1);
            return lastCell.equals(penultimateCell);
        }
    }
    isBlocked() {
        const lastCommand = this.getLastCommand();
        const MOVE_COMMAND = 'MOVE';
        const LAST_COMMAND_WAS_MOVE = (lastCommand) ? lastCommand.startsWith(MOVE_COMMAND) : false;
        return this.isStationary() && LAST_COMMAND_WAS_MOVE;
    }
    addCommand(command) {
        this.commands.push(command);
    }
    getLastCommand() {
        if (this.commands.length > 0) {
            return this.commands[this.commands.length - 1];
        }
    }
    toString() {
        return this.positions;
    }
}

const ROCK = 'ROCK';
const PAPER = 'PAPER';
const SCISSORS = 'SCISSORS';

const FLOOR = ' ';
const WALL = '#';
const PELLET = '.'
const SUPER_PELLET = 'o';
const MY_PAC = '☻';
const YOUR_PAC = '☺';

// initialisation
var inputs = readline().split(' ');
// size of the grid
// top left corner is (x=0, y=0)
const grid = new Grid(parseInt(inputs[0]), parseInt(inputs[1]));
let previousPacPositions = [];
const trailMap = new Map();

for (let i = 0; i < grid.height; i++) {
    const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
    const rowWithPellets = row.replace(/ /g, PELLET);
    grid.addRow(rowWithPellets);
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
    // console.error('visiblePacCount=' + visiblePacCount);
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
            trail.addMove(pac.cell);
        } else {
            yourPacs.set(pacId, pac);
        }
    }
    // console.error('visible enemy pacs=' + yourPacs.size);

    // move pacs in model
    // first erase previous pac positions
    previousPacPositions.forEach(cell => {
        grid.setCellContents(cell, FLOOR);
    });
    // then add pacs to grid
    myPacs.forEach(pac => {
        grid.setCellContents(pac.cell, MY_PAC);
    });
    yourPacs.forEach(pac => {
        grid.setCellContents(pac.cell, YOUR_PAC);
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
    // console.error('visiblePelletCount=' + visiblePelletCount);
    // console.error('pellets=' + pellets);

    // add super pellets to grid
    superPellets.forEach(cell => {
        grid.setCellContents(cell, SUPER_PELLET);
    });

    // add visible pellets to grid
    pellets.forEach(cell => {
        grid.setCellContents(cell, PELLET);
    });

    // detect possible pellets
    grid.rows.forEach((row, rowIndex) => {
        row.split('').forEach((char, charIndex) => {
            if(char == PELLET) {
                possiblePellets.push(new Cell(charIndex, rowIndex));
            }
        });
    });

    // display grid
    grid.rows.forEach(row => {
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
        if (trail.isBlocked() && blockageUnresolved) {
            console.error(pac.id + ' is blocked, trail=' + trail.toString());
            // target penultimate distinct cell (i.e. go back 2 or 3 positions in case SPEED is on)
            const target = trail.getLastDistinctCell(1);
            if (!target.equals(pac.cell)) {
                targetedPacs.set(pac, target);
                untargetedPacs.delete(pac.id);
                blockageUnresolved = false;
            }
        }
    });

    // target remaining superpellets
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
        const pelletsVisibleToPac = targetsVisibleToPac(pac, pellets);
        const targets = (pelletsVisibleToPac.length > 0 ? pelletsVisibleToPac : possiblePellets).slice(0);
        console.error('pelletsVisibleToPac ' + pac.id + ' = ' + pelletsVisibleToPac);
        console.error('pellets=' + pellets);
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
            } while (closestExistingTargetDistance < 1.4 && targets.length > 0);
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
            const yourPacCells = Array.from(yourPacs.values()).map(pac => pac.cell);
            // console.error('yourPacCells=' + yourPacCells);
            let pacsVisibleToPac = (yourPacs.size > 0) ? targetsVisibleToPac(pac, yourPacCells) : [];
            // console.error('pacsVisibleToPac ' + pac.id + ' =' + pacsVisibleToPac);
            if (pacsVisibleToPac.length > 0) {
                const closestCell = findClosest(pac.cell, pacsVisibleToPac);
                // console.error('closestCell=' + closestCell);
                const closestPac = findPacAtCell(closestCell, yourPacs);
                // console.error('closestPac=' + closestPac);
                if (closestPac) {
                    // console.error('pac.type=' + pac.type + ', closestPac.type=' + closestPac.type);
                    // console.error('strongerThan(pac.type, closestPac.type)=' + strongerThan(pac.type, closestPac.type));
                    if ((simpleDistance(pac.cell, closestPac.cell) <= 2)) {
                        let newType;
                        if (closestPac.abilityCooldown == 0) {
                            newType = getStrongerType(getStrongerType(pac.type));
                        } else {
                            if (!strongerThan(pac.type, closestPac.type)) {
                                newType = getStrongerType(pac.type);
                            }
                        }
                        if (newType) {
                            pacCommand = 'SWITCH ' + pac.id + ' ' + newType + ' |';
                        }
                    }
                }
            }
        }
        // if (!pacCommand && pac.abilityCooldown == 0 && getRandomBoolean()) {
        //     pacCommand = 'SPEED ' + pac.id + ' |';
        // }
        if (!pacCommand) {
            pacCommand = 'MOVE ' + pac.id + ' ' + target.x + ' ' + target.y + ' ' + target.x + ' ' + target.y + ' | ';
        }

        // add command to history
        trailMap.get(pac.id).addCommand(pacCommand);

        // add command to output
        cmd += pacCommand;
    });
    
    console.log(cmd);
}

function simpleDistance(cell1, cell2) {
    const a = Math.abs(cell1.x - cell2.x);
    const b = Math.abs(cell1.y - cell2.y);
    return Math.sqrt(a*a + b*b);
}

function findClosest(cell, targets) {
    // console.error('findClosest cell=' + cell + ', targets=' + targets);
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

function targetsVisibleToPac(pac, targets) {
    // console.error('pac=' + pac);
    // console.error('targets=' + targets);
    const inlineVertical = [];
    const inlineHorizontal = [];
    const visibleTargets = [];
    // find inline targets
    targets.forEach(target => {
        if (target.x === pac.cell.x) {
            inlineVertical.push(target);
        }
        else if (target.y === pac.cell.y) {
            inlineHorizontal.push(target);
        }
    });
    // console.error('inlineVertical=' + inlineVertical);
    // console.error('inlineHorizontal=' + inlineHorizontal);
    // find target without intervening walls
    inlineVertical.forEach(target => {
        const increment = (target.y > pac.cell.y) ? 1 : -1;
        let y = pac.cell.y;
        do {
            y = y + increment;
            if (y === target.y) {
                visibleTargets.push(target);
                break;
            }
        } while (grid.getCellContents(new Cell(target.x, y)) !== WALL);
    });
    inlineHorizontal.forEach(target => {
        const increment = (target.x > pac.cell.x) ? 1 : -1;
        let x = pac.cell.x;
        do {
            x = x + increment;
            if (x === target.x) {
                visibleTargets.push(target);
                break;
            }
        } while (grid.getCellContents(new Cell(x, target.y)) !== WALL);
    });
    // console.error('visibleTargets=' + visibleTargets);
    return visibleTargets;
}

function findPacAtCell(cell, pacs) {
    let foundPac;
    pacs.forEach(pac => {
        if (pac.cell.equals(cell)) {
            foundPac = pac;
        }
    });
    return foundPac;
}

function strongerThan(t1, t2) {
    switch(t1) {
        case ROCK:
            return t2 === SCISSORS;
            break;
        case PAPER:
            return t2 === ROCK;
            break;
        case SCISSORS:
            return t2 === PAPER;
    }
}

function getStrongerType(type) {
    switch(type) {
        case ROCK:
            return PAPER;
            break;
        case PAPER:
            return SCISSORS;
            break;
        case SCISSORS:
            return ROCK;
    }
}

function getRandomBoolean() {
  return (Math.random() >= 0.5);
}
