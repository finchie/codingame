const MIN_COLUMN = 0; // 0-indexed left-most column
const MAX_COLUMN = 5; // 0-indexed right-most column
const MAX_ROW = 11; // 0-indexed bottom row
const MAX_HEIGHT = 11; // 0-indexed with a little room to spare

const VERTICAL = 1;
const VERTICAL_REVERSE = 3;
const HORIZONTAL = 0;
const HORIZONTAL_REVERSE = 2;

class Combo {
    constructor(colIndex, rotationIndex) {
        this.colIndex = colIndex;
        this.rotationIndex = rotationIndex;
    }
}

let combos = [];

[0, 1, 2, 3, 4, 5].forEach(colIndex => {
    [0, 1, 2, 3].forEach(rotationIndex => {
        if ( !(colIndex === MIN_COLUMN && rotationIndex === HORIZONTAL_REVERSE)
            && !(colIndex === MAX_COLUMN && rotationIndex === HORIZONTAL) ) {
            combos.push(new Combo(colIndex, rotationIndex));
        }

    })
});

console.log(combos);
console.log(combos.length);