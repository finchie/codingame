class Cell {
    index: number;
    richness: number; // 0 if the cell is unusable, 1-3 for usable cells
    neigh0: number; // the index of the neighbouring cell for each direction
    neigh1: number;
    neigh2: number;
    neigh3: number;
    neigh4: number;
    neigh5: number;

    constructor(inputLine: String) {
        const inputs: string[] = inputLine.split(' ');
        this.index = parseInt(inputs[0]);
        this.richness = parseInt(inputs[1]);
        this.neigh0 = parseInt(inputs[2]);
        this.neigh1 = parseInt(inputs[3]);
        this.neigh2 = parseInt(inputs[4]);
        this.neigh3 = parseInt(inputs[5]);
        this.neigh4 = parseInt(inputs[6]);
        this.neigh5 = parseInt(inputs[7]);
    }
}

class Forest {
    cells: Cell[];

    constructor() {
        this.cells = [];
    }
}

class Tree {
    cellIndex: number; // location of this tree
    size: number; // size of this tree: 0-3
    isMine: boolean; // 1 if this is your tree
    isDormant: boolean; // 1 if this tree is dormant

    constructor(inputLine: String) {
        const inputs: string[] = inputLine.split(' ');
        this.cellIndex = parseInt(inputs[0]);
        this.size = parseInt(inputs[1]);
        this.isMine = inputs[2] !== '0';
        this.isDormant = inputs[3] !== '0';
    }
}

const forest: Forest = new Forest();

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const numberOfCells: number = parseInt(readline()); // 37
for (let i = 0; i < numberOfCells; i++) {
    forest.cells.push(new Cell(readline()));
}

// game loop
while (true) {
    const day: number = parseInt(readline()); // the game lasts 24 days: 0-23
    const nutrients: number = parseInt(readline()); // the base score you gain from the next COMPLETE action
    
    var inputs: string[] = readline().split(' ');
    const sun: number = parseInt(inputs[0]); // your sun points
    const score: number = parseInt(inputs[1]); // your current score

    var inputs: string[] = readline().split(' ');
    const oppSun: number = parseInt(inputs[0]); // opponent's sun points
    const oppScore: number = parseInt(inputs[1]); // opponent's score
    const oppIsWaiting: boolean = inputs[2] !== '0'; // whether your opponent is asleep until the next day

    const numberOfTrees: number = parseInt(readline()); // the current amount of trees
    let myTrees: Tree[] = [];
    for (let i = 0; i < numberOfTrees; i++) {
        const tree = new Tree(readline());
        if (tree.isMine) {
            myTrees.push(tree);
        }
    }
    console.error('myTrees:');
    console.error(myTrees);


    const numberOfPossibleActions: number = parseInt(readline()); // all legal actions
    for (let i = 0; i < numberOfPossibleActions; i++) {
        const possibleAction: string = readline(); // try printing something from here to start with
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');


    // GROW cellIdx | SEED sourceIdx targetIdx | COMPLETE cellIdx | WAIT <message>
    if (myTrees.length == 0) {
        console.log('WAIT');
    } else {
        console.log('COMPLETE ' + myTrees[0].cellIndex);
    }
}
