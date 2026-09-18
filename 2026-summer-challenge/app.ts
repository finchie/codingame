import fs from 'node:fs';

class Cell {
    regionId: number;
    type: number; // 0 (PLAINS), 1 (RIVER), 2 (MOUNTAIN), 3 (POI)

    constructor(regionId: number, type: number) {
        this.regionId = regionId;
        this.type = type;
    }
}

class Grid {
    cells: Cell[][];

    constructor(width: number, height: number) {
        this.cells = new Array<Cell[]>(height);
        for (let i = 0; i < height; i++) {
            this.cells[i] = new Array<Cell>(width);
        }
    }

    toStringFull(): string {
        return this.cells.map(row => row.map(cell => cell ? `${cell.regionId},${cell.type}` : 'null').join(' ')).join('\n');
    }

    toString(): string {
        return this.cells.map(row => row.map(cell => cell ? `${cell.type}` : 'null').join(' ')).join('\n');
    }
}


/**
 * Connect towns with your train tracks and disrupt the opponent's.
 **/

const myId: number = parseInt(readline()); // 0 or 1

const width: number = parseInt(readline()); // map size
const height: number = parseInt(readline());
const grid = new Grid(width, height);

for (let row = 0; row < height; row++) {
    
    for (let col = 0; col < width; col++) {
        var inputs: string[] = readline().split(' ');
        const regionId: number = parseInt(inputs[0]!);
        const type: number = parseInt(inputs[1]!); // 0 (PLAINS), 1 (RIVER), 2 (MOUNTAIN), 3 (POI)
        grid.cells[row]![col] = new Cell(regionId, type);
    }
}
const townCount: number = parseInt(readline());
for (let i = 0; i < townCount; i++) {
    var inputs: string[] = readline().split(' ');
    const townId: number = parseInt(inputs[0]!);
    const townX: number = parseInt(inputs[1]!);
    const townY: number = parseInt(inputs[2]!);
    const desiredConnections: string = inputs[3]!; // comma-separated town ids e.g. 0,1,2,3
}

// game loop
while (true) {
    const myScore: number = parseInt(readline());
    const foeScore: number = parseInt(readline());
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            var inputs: string[] = readline().split(' ');
            const tracksOwner: number = parseInt(inputs[0]!); // -1 = no tracks, 0 = me, 1 = foe
            const instability: number = parseInt(inputs[1]!); // region inked (destroyed) when this >= 3.
            const inked: boolean = inputs[2] !== '0'; // true if region is destroyed.
            const partOfActiveConnections: string = inputs[3]!; // if this cell is part of one or more railway connections, this will be town ids (separated by -) in a list separated by commas. e.g. 0-1,1-2,1-3. "x" otherwise.
            const dummy = partOfActiveConnections; // Placeholder for unused variable
        }
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    console.error('Grid:');
    console.error(grid.toString());

    // AUTOPLACE x1 y1 x2 y2 | PLACE_TRACKS x y | DISRUPT regionId | MESSAGE text
    console.log('WAIT');
}


/**
 * Mimics the readline() function in the CodinGame environment, allowing us to read input from a file instead of standard input. This is useful for testing and debugging our code locally before submitting it to CodinGame.
 */
const inputLines: string[] = fs.readFileSync(0, 'utf-8').trim().split('\n');
let inputIndex = 0;

function readline(): string {
    return inputLines[inputIndex++] || '';
}
