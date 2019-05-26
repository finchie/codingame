// consts to replace magic numbers
const VOID_CELL = '#';
const NEUTRAL_CELL = '.';
const OWNED_ACTIVE_CELL = 'O';
const OWNED_INACTIVE_CELL = 'o';
const ENEMY_ACTIVE_CELL = 'X';
const ENEMY_INACTIVE_CELL = 'x';
const OWNED = 0;
const ENEMY = 1;
const BUILDING_HQ = 0;
const MAX_CELL_INDEX = 11;
const MIN_CELL_INDEX = 0;

let positions = [];

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
class Building {
    constructor(owner, type, x, y) {
        this.owner = owner;
        this.type = type;
        this.x = x;
        this.y = y;
    }
    toString() {
        return this.owner + ' ' + this.type + ' ' + this.x + ' ' + this.y;
    }
}

class Unit {
    constructor(owner, id, level, x, y) {
        this.owner = owner;
        this.id = id;
        this.level = level;
        this.x = x;
        this.y = y;
    }
    toString() {
        return this.owner + ' ' + this.id + ' ' + this.level + ' ' + this.x + ' ' + this.y;
    }
}

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const numberMineSpots = parseInt(readline());
for (let i = 0; i < numberMineSpots; i++) {
    var inputs = readline().split(' ');
    const x = parseInt(inputs[0]);
    const y = parseInt(inputs[1]);
}

// game loop
while (true) {
    // read gold & income
    const gold = parseInt(readline());
    const income = parseInt(readline());
    const opponentGold = parseInt(readline());
    const opponentIncome = parseInt(readline());
    
    // read grid
    const grid = new Array(12);
    for (let i = 0; i < 12; i++) {
        const line = readline(); 
        grid[i] = line.split('');
    }
    
    // read buildings
    const buildingCount = parseInt(readline());
    const buildings = new Array(buildingCount);
    for (let i = 0; i < buildingCount; i++) {
        var inputs = readline().split(' ');
        const owner = parseInt(inputs[0]);
        const buildingType = parseInt(inputs[1]);
        const x = parseInt(inputs[2]);
        const y = parseInt(inputs[3]);
        buildings[i] = new Building(owner, buildingType, x, y);
    }
    
    // read units
    const unitCount = parseInt(readline());
    const units = new Array(unitCount);
    for (let i = 0; i < unitCount; i++) {
        var inputs = readline().split(' ');
        const owner = parseInt(inputs[0]);
        const unitId = parseInt(inputs[1]);
        const level = parseInt(inputs[2]);
        const x = parseInt(inputs[3]);
        const y = parseInt(inputs[4]);
        units[i] = new Unit(owner, unitId, level, x, y);
    }
    
    const myHQ = ownHQ(buildings);
    const myUnits = ownUnits(units);
    let command = 'WAIT';

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    
    // if no units yet then create unit starting at HQ
    if (myUnits.length === 0) {
        positions.push(myHQ);
        // find next available cell to train unit
        const nextCell = nextAvailableCell(grid, positions.slice() );
        console.error('nextCell: ', nextCell);
        command += ';TRAIN 1 ' + nextCell.x + ' ' + nextCell.y;
        command += ';MSG train unit';
    }
    else if (myUnits.length === 1) {
        const unit = myUnits[0];
        positions.push(unit);
        // find next available cell to move unit
        const nextCell = nextAvailableCell(grid, positions.slice() );
        
        if (nextCell) {
            console.error('nextCell: ', nextCell);
            command += ';MOVE ' + unit.id + ' ' + nextCell.x + ' ' + nextCell.y;
            command += ';MSG move unit';
        } 
    }
    else
    {
        command += '';
    }
    console.log(command);
}

function ownHQ(buildings) {
    return buildings.find(b => {
        return b.type === BUILDING_HQ && b.owner === OWNED;
    });
}

function ownUnits(units) {
    return units.filter(u => { //console.error('ownUnits: ', u, u.owner === OWNED);
        return u.owner === OWNED;
    });
}

// if no available moves from current position , try available moves
// from each previous position in turn
function nextAvailableCell (grid, history) {
    
    if (history.length === 0) {
        return undefined;
    }
    
    const start = history.pop();
    const east = new Cell(start.x + 1, start.y);
    const west = new Cell(start.x - 1, start.y);
    const south = new Cell(start.x, start.y + 1);
    const north = new Cell(start.x, start.y - 1);
    
    const c = 
        isAvailableCell(north) ? north :
        isAvailableCell(east) ? east :
        isAvailableCell(west) ? west :
        isAvailableCell(south) ? south : undefined;
    
    if (c) {
        return c;
    }
    else {
        // recursively find next available from previous positions
        return nextAvailableCell(grid, history);
    }

    function isAvailableCell(c) {
        return isValidCell(c) && grid[c.y][c.x] !== VOID_CELL && grid[c.y][c.x] !== OWNED_ACTIVE_CELL;
    }
}

function isValidCell(c) {
    return c.x >= MIN_CELL_INDEX
        && c.x <= MAX_CELL_INDEX
        && c.y >= MIN_CELL_INDEX
        && c.y <= MAX_CELL_INDEX;
}
