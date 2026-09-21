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
    width: number;
    height: number;
    cells: Cell[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
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

class Town {
    townId: number;
    x: number;
    y: number;
    desiredConnections: number[];
    constructor(townId: number, x: number, y: number, desiredConnections: number[]) {
        this.townId = townId;
        this.x = x;
        this.y = y;
        this.desiredConnections = desiredConnections;
    }
}

class Connection {
    townA: Town;
    townB: Town;
    constructor(townA: Town, townB: Town) {
        this.townA = townA;
        this.townB = townB;
    }
    simpleDistance(): number {
        return Math.abs(this.townA.x - this.townB.x) + Math.abs(this.townA.y - this.townB.y);
    }
}

class Game {
    myId: number;
    grid: Grid;
    towns: Map<number, Town>;
    myScore: number;
    foeScore: number;

    constructor() {
        this.myId = parseInt(readline()); // 0 or 1

        const width: number = parseInt(readline()); // map size
        const height: number = parseInt(readline());
        this.grid = new Grid(width, height);
        this.towns = new Map<number, Town>();

        for (let row = 0; row < this.grid.height; row++) {
            
            for (let col = 0; col < this.grid.width; col++) {
                var inputs: string[] = readline().split(' ');
                const regionId: number = parseInt(inputs[0]!);
                const type: number = parseInt(inputs[1]!); // 0 (PLAINS), 1 (RIVER), 2 (MOUNTAIN), 3 (POI)
                this.grid.cells[row]![col] = new Cell(regionId, type);
            }
        }
        const townCount: number = parseInt(readline());
        for (let i = 0; i < townCount; i++) {
            var inputs: string[] = readline().split(' ');
            const townId: number = parseInt(inputs[0]!);
            const townX: number = parseInt(inputs[1]!);
            const townY: number = parseInt(inputs[2]!);
            const desiredConnections: string = inputs[3]!; // comma-separated town ids e.g. 0,1,2,3
            const town = new Town(townId, townX, townY, desiredConnections.split(',').map(Number));
            this.towns.set(townId, town);
        }

        this.myScore = 0;
        this.foeScore = 0;
        
    }

    readGameState() {
        this.myScore = parseInt(readline());
        this.foeScore = parseInt(readline());

        for (let i = 0; i < this.grid.height; i++) {
            for (let j = 0; j < this.grid.width; j++) {
                var inputs: string[] = readline().split(' ');
                const tracksOwner: number = parseInt(inputs[0]!); // -1 = no tracks, 0 = me, 1 = foe
                const instability: number = parseInt(inputs[1]!); // region inked (destroyed) when this >= 3.
                const inked: boolean = inputs[2] !== '0'; // true if region is destroyed.
                const partOfActiveConnections: string = inputs[3]!; // if this cell is part of one or more railway connections, this will be town ids (separated by -) in a list separated by commas. e.g. 0-1,1-2,1-3. "x" otherwise.
                const dummy = partOfActiveConnections; // Placeholder for unused variable
            }
        }
    }

    playGameRound() {
        // Implement your game logic here to decide on actions to take each round.
        const connections: Connection[] = [];
        for(const town of this.towns.values()) {
            for(const desiredTownId of town.desiredConnections) {
                const desiredTown = this.towns.get(desiredTownId);
                if(desiredTown) {
                    const connection = new Connection(town, desiredTown);
                    connections.push(connection);
                    // console.error(`Connection from Town ${town.townId} to Town ${desiredTown.townId} has simple distance: ${connection.simpleDistance()}`);
                }
            }
        }
        connections.sort((a, b) => a.simpleDistance() - b.simpleDistance());
        const shortestConnection = connections[0];
        if(shortestConnection) {
            console.error(`Shortest connection is from Town ${shortestConnection.townA.townId} to Town ${shortestConnection.townB.townId} with distance: ${shortestConnection.simpleDistance()}`);

            // Write an action using console.log()
            // To debug: console.error('Debug messages...');
            console.error('Grid:');
            console.error(this.grid.toString());
            console.error(Array.from(this.towns.values()).map(town => `Town ${town.townId}: (${town.x}, ${town.y}), Desired Connections: ${town.desiredConnections.join(',')}`).join('\n'));

            // AUTOPLACE x1 y1 x2 y2 | PLACE_TRACKS x y | DISRUPT regionId | MESSAGE text
            console.log(`AUTOPLACE ${shortestConnection.townA.x} ${shortestConnection.townA.y} ${shortestConnection.townB.x} ${shortestConnection.townB.y}`);
        } else {
            console.error('No connections found.');
            console.log('WAIT'); // If no connections are found, we can choose to wait or take another action.
        }
    }
}
    
/**
 * Connect towns with your train tracks and disrupt the opponent's.
 **/
const game = new Game();

// game loop
while (true) {
    game.readGameState();
    game.playGameRound();
}


/**
 * Mimics the readline() function in the CodinGame environment, allowing us to read input from a file instead of standard input. This is useful for testing and debugging our code locally before submitting it to CodinGame.
 */
const inputLines: string[] = fs.readFileSync(0, 'utf-8').trim().split('\n');
let inputIndex = 0;

function readline(): string {
    return inputLines[inputIndex++] || '';
}
