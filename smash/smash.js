/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const MIN_COLUMN = 0; // 0-indexed left-most column
const MAX_COLUMN = 5; // 0-indexed right-most column
const MAX_ROW = 11; // 0-indexed bottom row
const MAX_HEIGHT = 11; // 0-indexed with a little room to spare

const VERTICAL = 1;
const VERTICAL_REVERSE = 3;
const HORIZONTAL = 0;
const HORIZONTAL_REVERSE = 2;

const STATUS_GROUPED = 4;
const STATUS_SKULL = 3;
const STATUS_CHECKED_MATCHED = 2;
const STATUS_CHECKED_UNMATCHED = 1;
const STATUS_UNCHECKED = 0;
const SKULL = '0';

// scoring criteria: 1=1, 2=4, 3=9
const scoreCard = new Map();
scoreCard.set(1, 0);
scoreCard.set(2, 4);
scoreCard.set(3, 9);
scoreCard.set(4, 16);
scoreCard.set(5, 25);
scoreCard.set(6, 36);

const colScoreCard = new Map();
colScoreCard.set(0, 0);
colScoreCard.set(1, 1);
colScoreCard.set(2, 2);
colScoreCard.set(3, 2);
colScoreCard.set(4, 1);
colScoreCard.set(5, 0);

let column = MIN_COLUMN;
let rotation = 0;
let rounds = 0;

// game loop
while (true) {
    rounds++;
    let blocks = [];
    let grid = [];

    for (let i = 0; i < 8; i++) {
        var inputs = readline().split(' ');
        var colorA = parseInt(inputs[0]); // color of the first block
        var colorB = parseInt(inputs[1]); // color of the attached block
        blocks.push([colorA, colorB]);
    }
    var score1 = parseInt(readline());
    for (let i = 0; i < 12; i++) {
        const row = readline();
        grid.push(row.split(''));
    }
    var score2 = parseInt(readline());
    for (var i = 0; i < 12; i++) {
        const row = readline(); // One line of the map ('.' = empty, '0' = skull block, '1' to '5' = colored block)
    }
    //printGrid(grid);
    //printErr(blocks);

    /*
     main algorithm
     */
    // scan grid & prepopulate score map & column heights
    const columnHeights = [];
    const scoreMap = new Map();
    for (let c = MIN_COLUMN; c <= MAX_COLUMN; c++) {
        const column = getColumn(grid, c);
        scoreMap.set(column, calculateScoreForLine(column));
        columnHeights.push(getColumnSize(column));
    }
    //printErr(columnHeights);

    let highestScoringCombo = [-1, -1];
    let highestScore = 0;

    // for each possible combination (colIndex, rotation)
    [0, 1, 2, 3, 4, 5].forEach(colIndex => {
        [0, 1, 2, 3].forEach(rotationIndex => {

            // exclude invalid combinations
            if ( isInvalidCombination(colIndex, rotationIndex, columnHeights) )
            {
                // exclude this combo
                //printErr('combination not valid: ' + colIndex + ' ' + rotationIndex);
            }
            else {
                // generate new grid
                const columnIndexes = getColumnIndexes(colIndex, rotationIndex);
                //printErr('(colIndex, rotation) = '  + '(' + colIndex + ', '+ rotation + ')');
                const colours = getBlocks(rotationIndex, blocks[0]);
                //printErr('colours = ' + colours);
                const tryGrid = newGrid(grid, columnIndexes, colours);

                //printGrid(tryGrid);

                // score grid
                let score = scoreGrid(tryGrid); //clear matching blocks and repeat etc.
                if (score === 0) {
                    // no matches so score groups of 2 & 3
                    score = scoreGridNoMatches(tryGrid, scoreMap, false) + calculateColumnScore(columnIndexes);
                }
                //printErr('scored ' + score + ' for ' + colIndex + ' ' + rotationIndex);


                // compare with current highest score & replace if it is higher
                if (score > highestScore) {
                    highestScore = score;
                    highestScoringCombo = [colIndex, rotationIndex];
                }
            }
        });
    });

    column = highestScoringCombo[0];
    rotation = highestScoringCombo[1];


    // Write an action using print()
    // To debug: printErr('Debug messages...');

    print(column + ' ' + rotation); // "x": the column in which to drop your blocks
}

function isInvalidCombination(colIndex, rotation, columnHeights) {
    return  (colIndex === MIN_COLUMN && rotation === HORIZONTAL_REVERSE)
        ||
        (colIndex === MAX_COLUMN && rotation === HORIZONTAL)
        ||
        columnHeights[colIndex] > MAX_HEIGHT
        ||
        (rotation === HORIZONTAL && columnHeights[colIndex + 1] > MAX_HEIGHT)
        ||
        (rotation === HORIZONTAL_REVERSE && columnHeights[colIndex - 1] > MAX_HEIGHT)
        ||
        ((rotation === VERTICAL || rotation === VERTICAL_REVERSE) && columnHeights[colIndex] > MAX_HEIGHT - 1)
}

function getColumnIndexes(colIndex, rotation) {
    if (rotation === VERTICAL || rotation === VERTICAL_REVERSE) {
        return [colIndex, colIndex];
    }
    else if (rotation === HORIZONTAL) {
        return [colIndex, colIndex + 1];
    }
    else if (rotation === HORIZONTAL_REVERSE) {
        return [colIndex - 1, colIndex];
    }
}

function getBlocks(rotation, blocks) {
    if (rotation === VERTICAL || rotation === HORIZONTAL) {
        return blocks;
    }
    else if (rotation === VERTICAL_REVERSE || rotation === HORIZONTAL_REVERSE) {
        return [blocks[1], blocks[0]];
    }
}

function newGrid(grid, columnIndexes, colours) {

    // copy current grid
    const gridCopy = grid.map(a => a.slice());

    // for each column, add new colour(s) at top of column
    columnIndexes.forEach((columnIndex, i) => {

        const column = getColumn(gridCopy, columnIndex);
        //printErr('column ' + columnIndex + ' before = ' + column);
        // find top of column
        const topIndex = getTopIndex(column);
        //printErr('topIndex = ' + topIndex + ' for ' + column.join(' '));
        // add block to column
        gridCopy[topIndex][columnIndex] = colours[i].toString();
    });

    return gridCopy;
}

function getTopIndex(column) {
    return column.lastIndexOf('.');
}



function scoreGrid(grid) {
    let totalScore = 0;
    let stepCount = 0;
    let step = -1;
    let groupBonus = 0;
    const colourSet = new Set();

    // each step
    do {
        step++;
        stepCount = 0;
        colourSet.clear();
        groupBonus = 0;

        const checked = new Array(MAX_ROW + 1).fill(0).map(_ => new Array(MAX_COLUMN + 1).fill(STATUS_UNCHECKED));

        for (let rowIndex = MAX_ROW; rowIndex >= 0; rowIndex--) {
            for (let colIndex = 0; colIndex <= MAX_COLUMN; colIndex++) {

                //console.log('rowIndex = ' + rowIndex + ', colIndex = ' + colIndex);
                //console.log('checked[rowIndex][colIndex] = ' + checked[rowIndex][colIndex]);
                //if (rowIndex >= 10) {printGrid(checked);}
                if (!checked[rowIndex][colIndex]) {

                    let val = grid[rowIndex][colIndex];
                    //console.log('val = ' + val);
                    if (val !== '.' && val !== '0') {

                        checked[rowIndex][colIndex] = STATUS_CHECKED_MATCHED;
                        let count = 1 + countMatchingNeighbours(grid, rowIndex, colIndex, checked);
                        //if (rowIndex >= 10) {printGrid(checked);}

                        if (count >= 4) {
                            stepCount += count;
                            colourSet.add(val);
                            if (count >= 11) {
                                groupBonus += 8;
                            }
                            else if (count >= 5) {
                                groupBonus += (count - 4)
                            }

                            // mark matches for elimination
                            markMatches(checked, true);
                        }
                        else {
                            // mark matches as done
                            markMatches(checked, false);
                        }
                        //if (rowIndex >= 10) {printGrid(checked);}
                    }
                }
            }
        }

        //printGrid(grid);
        //printGrid(checked);

        clearMatches(grid, checked);

        //printGrid(grid);
        //printGrid(checked);

        totalScore += (10 * stepCount) * (step + calculateColourBonus(colourSet) + groupBonus);

    } while (stepCount !== 0);

    return totalScore;
}

function countMatchingNeighbours(grid, rowIndex, colIndex, checked) {

    const val = grid[rowIndex][colIndex];
    let total = 0;

    if (colIndex > 0 && !checked[rowIndex][colIndex - 1]) {
        if (grid[rowIndex][colIndex - 1] === val) {
            checked[rowIndex][colIndex - 1] = STATUS_CHECKED_MATCHED;
            total += 1 + countMatchingNeighbours(grid, rowIndex, colIndex - 1, checked);
        }
        else if (grid[rowIndex][colIndex - 1] === SKULL) {
            checked[rowIndex][colIndex - 1] = STATUS_SKULL;
        }
        else {
            checked[rowIndex][colIndex - 1] = STATUS_CHECKED_UNMATCHED;
        }
    }
    if (colIndex < MAX_COLUMN && !checked[rowIndex][colIndex + 1]) {
        if (grid[rowIndex][colIndex + 1] === val) {
            checked[rowIndex][colIndex + 1] = STATUS_CHECKED_MATCHED;
            total += 1 + countMatchingNeighbours(grid, rowIndex, colIndex + 1, checked);
        }
        else if (grid[rowIndex][colIndex + 1] === SKULL) {
            checked[rowIndex][colIndex + 1] = STATUS_SKULL;
        }
        else {
            checked[rowIndex][colIndex + 1] = STATUS_CHECKED_UNMATCHED;
        }
    }
    if (rowIndex > 0 && !checked[rowIndex - 1][colIndex]) {
        if (grid[rowIndex - 1][colIndex] === val) {
            checked[rowIndex - 1][colIndex] = STATUS_CHECKED_MATCHED;
            total += 1 + countMatchingNeighbours(grid, rowIndex - 1, colIndex, checked);
        }
        else if (grid[rowIndex - 1][colIndex] === SKULL) {
            checked[rowIndex - 1][colIndex] = STATUS_SKULL;
        }
        else {
            checked[rowIndex - 1][colIndex] = STATUS_CHECKED_UNMATCHED;
        }
    }
    if (rowIndex < MAX_ROW && !checked[rowIndex + 1][colIndex]) {
        if (grid[rowIndex + 1][colIndex] === val) {
            checked[rowIndex + 1][colIndex] = STATUS_CHECKED_MATCHED;
            total += 1 + countMatchingNeighbours(grid, rowIndex + 1, colIndex, checked);
        }
        else if (grid[rowIndex + 1][colIndex] === SKULL) {
            checked[rowIndex + 1][colIndex] = STATUS_SKULL;
        }
        else {
            checked[rowIndex + 1][colIndex] = STATUS_CHECKED_UNMATCHED;
        }
    }

    return total;
}

function markMatches(checked, isGrouped) {
    checked.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell === STATUS_CHECKED_MATCHED || cell === STATUS_SKULL) {
                checked[rowIndex][cellIndex] = (isGrouped) ? STATUS_GROUPED : STATUS_UNCHECKED;
            }
            if (cell === STATUS_CHECKED_UNMATCHED) {
                checked[rowIndex][cellIndex] = STATUS_UNCHECKED;
            }
        });
    });
}

function clearMatches(grid, checked) {

    for (let colIndex = 0; colIndex <= MAX_COLUMN; colIndex++) {

        // for each matching cell, remove cell value in both grids
        // and move higher cells down 1 cell
        for (let rowIndex = MAX_ROW; rowIndex >= 0; rowIndex--) {

            if (checked[rowIndex][colIndex] === STATUS_GROUPED) {

                clearCell(checked, rowIndex, colIndex, STATUS_UNCHECKED);
                clearCell(grid, rowIndex, colIndex, '.');

                // repeat this row in case match has descended into it
                rowIndex++;
            }
        }
    }
}

function clearCell(grid, rowIndex, colIndex, defaultBlock) {

    for (let i = rowIndex - 1; i >= 0; i--) {
        grid[i + 1][colIndex] = grid[i][colIndex];
    }

    // add space to top of column
    grid[0][colIndex] = defaultBlock;
}

function calculateColourBonus(colourSet) {
    if (colourSet.size <= 1) {
        return 0;
    }
    else {
        return Math.pow(2, colourSet.size -1);
    }
}



function scoreGridNoMatches(gridToScore, scoreMap, log) {

    let gridScore = 0;

    // score each column
    for (let colIndex = MIN_COLUMN; colIndex <= MAX_COLUMN; colIndex++) {
        let column = getColumn(gridToScore, colIndex);
        if (!scoreMap.get(column)) {
            scoreMap.set(column, calculateScoreForLine(column, log));
        }
        gridScore += scoreMap.get(column);
    }

    // score each row
    gridToScore.forEach(row => {
        if (!scoreMap.get(row)) {
            scoreMap.set(row, calculateScoreForLine(row, log));
        }
        gridScore += scoreMap.get(row);
    });

    //printGrid(gridToScore);

    return gridScore;

}

function calculateColumnScore(colIndexes) {
    let score = 0;
    colIndexes.forEach(c => score += colScoreCard.get(c) );
    return score;
}

function calculateScoreForLine(line, log) {
    let score = 0;
    let currentColour = '.';
    let streak = 0;

    line = line.slice(); // copy to avoid changing original
    line.push('.'); // add '.' to terminate line

    // iterate through array
    line.forEach(c => {
        if (c === currentColour) {
            // count same colours
            streak++;
        }
        else {
            // when colour changes, increase running score according to criteria
            if (currentColour !== '.' && currentColour !== '0') {
                score += scoreCard.get(streak);
                if (log) {
                    //printErr('streak of ' + streak + ' ' + currentColour + 's ended, score = ' + score);
                }
            }
            // reset
            streak = 1;
            currentColour = c;
        }
    });

    if (log) {
        //printErr('scored ' + score + ' for ' + line.join(' '));
    }

    return score;
}

function printGrid(grid) {
    grid.forEach(row => printErr(row.join(' ')));
    printErr();
}

function getColumnSize(column) {
    return MAX_ROW - column.lastIndexOf('.');
}


function getColumn(grid, colIndex) {
    return grid.map(row => row[colIndex]);
}