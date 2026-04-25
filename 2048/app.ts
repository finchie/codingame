/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const DIRECTIONS: string[] = ['L', 'U', 'R', 'D']; // ['R', 'D', 'L', 'U'];
const FOUR = 4;
let IS_DEBUG = false;

let count = 0;
const directionScores: Map<string,number> = new Map<string,number>();
type Board = number[][];

// game loop
while (true) {
    IS_DEBUG = (count === 21);
    directionScores.clear();

    const seed: number = parseInt(readline()); // needed to predict the next spawns
    const score: number = parseInt(readline());
    
    let board: Board = [[],[],[],[]];
    for (let i = 0; i < 4; i++) {
        var inputs: string[] = readline().split(' ');
        for (let j = 0; j < 4; j++) {
            //const cell: number = parseInt(inputs[j]);
            board[i][j] = parseInt(inputs[j]);
        }
    }
    console.error(`count ${count}`);
    console.error(`seed ${seed}`);
    console.error(`score ${score}`);
    // console.error('## original board ##');
    // printBoard(board);
    // console.error('## rotated board ##');
    // const rotatedBoard = rotateBoard(board);
    // printBoard(rotatedBoard);
    // console.error('## unrotated board ##');
    // const unrotatedBoard = unrotateBoard(rotatedBoard);
    // printBoard(unrotatedBoard);
    // console.error('## ######## ##### ##');

    rotateAndMerge(seed, board, directionScores, '', 0, 5);

    console.error(directionScores);

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');

    // // cycle through each direction in fixed order
    // console.log(DIRECTIONS[count % FOUR]);

    // choose direction with highest score
    let highestDirection = getHighest(directionScores);
    if (!highestDirection) {
        // highestDirection = DIRECTIONS[count % FOUR]; // default
        // Select 1st single direction that changes the board
        for (const key  of directionScores.keys()) {
            if (key.length === 1) {
                highestDirection = key;
                break;
            }
        }
    }
    console.log(highestDirection.substring(0, 2));
    count++;
}

function moveLeft(board: Board): Board {
    const movedBoard: Board = [[],[],[],[]];

    for (let row = 0; row < FOUR; row++) {
        const values = board[row].filter(val => val > 0);
        for (let col = 1; col < FOUR; col++) { // ignore first tile
            
        }
    }

    return movedBoard;
}

function rotateAndMerge(seed: number, board: Board, scoreMap: Map<string,number>, baseDirection: string, baseScore: number, depth: number) {
    depth--;
    if (IS_DEBUG && `${baseDirection}`.startsWith('U')) {
        console.error(`board after ${baseDirection}`);
        printBoard(board);
    }
    
    // Calculate score of each direction
    for(const [index, direction] of DIRECTIONS.entries()) {

        let {mergedBoard, boardScore} = mergeBoard(board);
        const noChange = isEqual(board, mergedBoard);
        if (!noChange) {
            scoreMap.set(baseDirection + direction, baseScore + boardScore);
        }

        // Rotate board ready for next direction
        // for (let i = 0; i < index; i++) {
            board = rotateBoard(board); 
        // }
        
        // Reset merged board by undoing rotations
        for (let i = 0; i < index; i++) {
            mergedBoard = unrotateBoard(mergedBoard); 
        }
        if (baseScore + boardScore != 0) console.error(`${baseDirection + direction} score: ${baseScore + boardScore} ${noChange ? 'no change' : ''}`);
        if (!noChange && IS_DEBUG) {
            console.error(`merged board after ${baseDirection + direction}`);
            printBoard(mergedBoard);  
        }

        // Recursively calculate to desired depth
        if (!noChange && depth > 0) {
            const {nextBoard, newSeed} = spawnTile(mergedBoard, seed, IS_DEBUG);
            if (IS_DEBUG) {
                console.error('next board with spawn tile added');
                console.error(`newSeed ${newSeed}`);
                printBoard(nextBoard);  
            }
            rotateAndMerge(newSeed, nextBoard, scoreMap, baseDirection + direction, baseScore + boardScore, depth);
        }
        // console.error('-----------------------');
    }
}

function mergeBoard(board: Board): {mergedBoard: Board, boardScore: number} {
    // Calculate score of merging this board left
    let boardScore = 0;
    const mergedBoard: Board = [[],[],[],[]];
    for (let rowIndex = 0; rowIndex < FOUR; rowIndex++) {
        let {mergedRow, score} = mergeRow(board[rowIndex]);
        mergedBoard[rowIndex] = mergedRow;
        boardScore += score;
    }
    return {mergedBoard, boardScore};
}

function mergeRow(row: number[]): {mergedRow: number[], score: number} {
    // remove zeroes
    let values = row.filter(val => val > 0);
    // console.error('row', row);
    // console.error('values', values);

    // if no values return original empty row
    if (values.length == 0) {
        return {mergedRow: row, score: 0};
    }

    // if only a single value, return value in array padded with zeroes
    if (values.length == 1) {
        return {mergedRow: padZero(values), score: 0};
    }

    let score = 0;

    for (let index = 0; index + 1 < values.length; index++) {
        // console.error('values[%d] == values[%d]) %d == %d', index, index + 1, values[index], values[index + 1]);
        if (values[index] == values[index + 1]) {
            values[index] *= 2;
            score += values[index];
            values.splice(index + 1, 1); // remove merged value
        }
    }

    return {mergedRow: padZero(values), score};

}

function padZero(array: number[]): number[] {
    if (array.length > FOUR) {
        return array.slice(0, FOUR);
    }
    return [...array, ...new Array(FOUR - array.length).fill(0)];
}

function spawnTile(board: Board, seed: number, isDebug: boolean): {nextBoard: Board, newSeed: number}  {
    const freeCells = [];
    for (let col = 0; col < FOUR; col++) {
        for (let row = 0; row < FOUR; row++) {
            if (board[row][col] == 0) freeCells.push(row + (col * FOUR));
        }
    }
    if (isDebug) {
        console.error(`freeCells ${freeCells}`);
    }

    const spawnIndex = freeCells[seed % freeCells.length];
    if (isDebug) {
        console.error(`spawnIndex = freeCells[seed % freeCells.length]`);
        console.error(` => ${spawnIndex} = freeCells[${seed % freeCells.length}]`);
    }
    const value = (seed & 0x10) == 0 ? 2 : 4;
    if (isDebug) {
        console.error(`value = (seed & 0x10) == 0 ? 2 : 4`);
        console.error(` => ${value} = ${seed & 0x10} == 0 ? 2 : 4`);
    }

    board[spawnIndex % FOUR][Math.floor(spawnIndex / FOUR)] = value;
    if (isDebug) {
        console.error(`board[spawnIndex % FOUR][Math.floor(spawnIndex / FOUR)] = value`);
        console.error(` => board[${spawnIndex % FOUR}][${Math.floor(spawnIndex / FOUR)}] = ${value}`);
    }

    const newSeed = seed * seed % 50515093;
    if (isDebug) {
        console.error(`newSeed = seed * seed % 50515093 => ${seed * seed % 50515093}`);
    }

    return {nextBoard: board, newSeed};
}


/*
0,0 - 0,3
0,1 - 1,3
0,2 - 2,3
0,3 - 3,3

1,0 - 0,2
1,1 - 1,2
1,2 - 2,2
1,3 - 3,2

2,0 - 0,1
2,1 - 1,1
2,2 - 2,1
2,3 - 3,1

...
*/
function rotateBoard(board: Board): Board {
    const rotated: Board = [[],[],[],[]];

    for (let row = 0; row < FOUR; row++) {
        for (let column = 0; column < FOUR; column++) {
            rotated[row][column] = board[column][FOUR - row - 1];
        }
    }

    return rotated;
}

/*
0,0 - 3,0
0,1 - 2,0
0,2 - 1,0
0,3 - 0,0

1,0 - 3,1
1,1 - 2,1
1,2 - 1,1
1,3 - 0,1

...
*/
function unrotateBoard(board: Board): Board {
    const unrotated: Board = [[],[],[],[]];

    for (let row = 0; row < FOUR; row++) {
        for (let column = 0; column < FOUR; column++) {
            unrotated[column][FOUR - row -1] = board[row][column];
        }
    }

    return unrotated;
}

function getHighest(map: Map<string, number>): string {
    let highestDirection = '';
    let highestScore = 0;

    for (const key of map.keys()) {
        // console.error('key: ', key);
        // console.error('value: ', map.get(key));
        if (map.get(key)! > highestScore) {
            // console.error(`value for ${key} = ${map.get(key)} > ${highestScore}`);
            highestDirection = key;
            highestScore = map.get(key)!;
            // console.error(`${highestScore} is the newest high score for direction ${highestDirection}`);
        } else {
            // console.error(`value for ${key} = ${map.get(key)} <= ${highestScore}`);
            // console.error(`${highestScore} remains the high score for direction ${highestDirection}`);
        }
    }

    return highestDirection;
}

function isEqual(a: Board, b: Board): boolean {
    for (let row = 0; row < FOUR; row++) {
        for (let column = 0; column < FOUR; column++) {
            if (a[row][column] != b[row][column]) {
                return false;
            }
        }
    }
    return true;
}

function printBoard(board: Board): void {
    console.error('### # ##############');
    for (let row = 0; row < FOUR; row++) {
        // console.error('row %d %O', row, board[row]);
        console.error(board[row]);
    }
    console.error('');
}
