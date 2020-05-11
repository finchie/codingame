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
let pellets = [];
let superPellets = [];
for (let i = 0; i < height; i++) {
    const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
    grid.push(row);
}

// game loop
while (true) {
    // loop init
    pellets = [];
    superPellets = [];

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

    // eat remianing super pellets
    if (superPellets.length > 0) {
        const sp = superPellets[0];
        console.log('MOVE 0 ' + sp.x + ' ' + sp.y + ' ' + 'sp=' + superPellets.length);     // MOVE <pacId> <x> <y>
    } else if(pellets.length > 0) {
        const p = pellets[0];
        console.log('MOVE 0 ' + p.x + ' ' + p.y + ' ' + 'p=' + visiblePelletCount);     // MOVE <pacId> <x> <y>
    } else {
        console.log('MOVE 0 ' + '15' + ' ' + '10' + ' ' + 'p=' + visiblePelletCount);     // MOVE <pacId> <x> <y>
    }
    

}
