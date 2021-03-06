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

const MAX_BLOCK = 7; // 0-indexed 8th block
const MAX_DEPTH = 1; // 0-indexed depth of 3

class Combo {
    constructor(colIndex, rotationIndex) {
        this.colIndex = colIndex;
        this.rotationIndex = rotationIndex;
    }

    getColumnIndexes() {
        if (this.rotationIndex === VERTICAL || this.rotationIndex === VERTICAL_REVERSE) {
            return [this.colIndex, this.colIndex];
        }
        else if (this.rotationIndex === HORIZONTAL) {
            return [this.colIndex, this.colIndex + 1];
        }
        else if (this.rotationIndex === HORIZONTAL_REVERSE) {
            return [this.colIndex - 1, this.colIndex];
        }
    }

    getBlocks(blocks) {
        if (this.rotationIndex === VERTICAL || this.rotationIndex === HORIZONTAL) {
            return blocks;
        }
        else if (this.rotationIndex === VERTICAL_REVERSE || this.rotationIndex === HORIZONTAL_REVERSE) {
            return [blocks[1], blocks[0]];
        }
    }

    toString() {
        return this.colIndex + ' ' + this.rotationIndex;
    }
}

const combos = getCombos();

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

const scoreMap = new Map();

let rounds = 0;
let debugRound = -1;

// game loop
while (true) {
    rounds += 2;
    printErr('rounds = ' + rounds);
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
    if (rounds === debugRound) {
        printErr('blocks = ' + blocks);
    }

    /*
     main algorithm
     */
    // scan grid & prepopulate score map & column heights
    scoreMap.clear();
    for (let c = MIN_COLUMN; c <= MAX_COLUMN; c++) {
        const column = getColumn(grid, c);
        scoreMap.set(column, calculateScoreForLine(column));
    }

    let highestScoringCombo = new Combo(MIN_COLUMN, HORIZONTAL);
    let highestScore = 0;
    // let highestScore2 = 0;
    let combosEvaluated = 0;

    calcRecursiveScore(grid, blocks, 0, 0, new Array());

    function calcRecursiveScore(gridX, blocks, blockIndex, cumulativeScore, comboChain) {

        // exclude invalid combinations for this grid
        let columnHeights = getColumnHeights(gridX);
        //printErr('.columnHeights = ' + columnHeights);

        let validCombos = combos.filter(c => !isInvalidCombination(c, columnHeights));

        if (blockIndex >= 1) {
            //printErr('reducing valid combos from ' + validCombos.length);
            // only check combos either side of last combo
            let lastCombo = comboChain[comboChain.length - 1];
            validCombos = validCombos.filter(c => (c.colIndex === lastCombo.colIndex - 1) || (c.colIndex === lastCombo.colIndex + 1));
            //printErr('to ' + validCombos.length);
        }

        // for each possible combination (colIndex, rotation)
        //printErr('evaluating ' + validCombos.length + ' combos');
        validCombos.forEach((combo, index) => {

            //printErr('combo = ' + combo);
            combosEvaluated++;

            // generate new grid
            const tryGrid = newGrid(gridX, combo, blocks[blockIndex]);
            //printGrid(tryGrid);

            // score grid
            let comboScore = scoreGrid(tryGrid, combo); // clear matching blocks and repeat etc

            if (true || rounds === debugRound) {
                printErr('score = ' + comboScore + ' for combo: ' + combo.colIndex + ' ' + combo.rotationIndex);
            }

            if (blockIndex === MAX_DEPTH) {
                //printErr('combosEvaluated = ' + combosEvaluated);

                // compare with current highest score & replace if it is higher
                if (cumulativeScore + comboScore > highestScore) {
                    printErr('high score of ' + highestScore + ' replaced by ' + (cumulativeScore + comboScore));
                    printErr(comboChain.join(', ') + ', ' + combo);
                    highestScore = cumulativeScore + comboScore;
                    highestScoringCombo = comboChain[0];
                }
                else {
                    printErr('high score of ' + highestScore + ' not replaced by ' + (cumulativeScore + comboScore));
                    printErr(comboChain.join(', ') + ', ' + combo);
                }
            }
            else {
                calcRecursiveScore(tryGrid, blocks, blockIndex + 1, cumulativeScore + comboScore, comboChain.concat(combo));
            }
        });
    }



    // Write an action using print()
    // To debug: printErr('Debug messages...');

    print(highestScoringCombo.colIndex + ' ' + highestScoringCombo.rotationIndex); // "x": the column in which to drop your blocks
}



function getColumnHeights(grid) {
    const columnHeights = [];
    for (let c = MIN_COLUMN; c <= MAX_COLUMN; c++) {
        const column = getColumn(grid, c);
        columnHeights.push(getColumnSize(column));
    }
    return columnHeights;
}

function getCombos() {
    let combos = [];

    [0, 1, 2, 3, 4, 5].forEach(colIndex => {
        [0, 1, 2, 3].forEach(rotationIndex => {
            if ( !(colIndex === MIN_COLUMN && rotationIndex === HORIZONTAL_REVERSE)
                && !(colIndex === MAX_COLUMN && rotationIndex === HORIZONTAL) ) {
                combos.push(new Combo(colIndex, rotationIndex));
            }

        })
    });

    return combos;
}

function isInvalidCombination(combo, columnHeights) {
    //printErr('combo.colIndex = ' + combo.colIndex);
    //printErr('combo.rotationIndex = ' + combo.rotationIndex);
    //printErr('columnHeights[combo.colIndex] = ' + columnHeights[combo.colIndex]);
    //printErr('columnHeights[combo.colIndex + 1] = ' + columnHeights[combo.colIndex + 1]);
    //printErr('columnHeights[combo.colIndex - 1] = ' + columnHeights[combo.colIndex - 1]);

    const primaryColumnFull = columnHeights[combo.colIndex] > MAX_HEIGHT;
    const horizontalNextColFull = (combo.rotationIndex === HORIZONTAL && columnHeights[combo.colIndex + 1] > MAX_HEIGHT);
    const horizontalPrevColFull = (combo.rotationIndex === HORIZONTAL_REVERSE && columnHeights[combo.colIndex - 1] > MAX_HEIGHT);
    const verticalColumnFull = ((combo.rotationIndex === VERTICAL || combo.rotationIndex === VERTICAL_REVERSE) && columnHeights[combo.colIndex] > MAX_HEIGHT - 1);
    //printErr('primaryColumnFull = ' + primaryColumnFull);
    //printErr('horizontalNextColFull = ' + horizontalNextColFull);
    //printErr('horizontalPrevColFull = ' + horizontalPrevColFull);
    //printErr('verticalColumnFull = ' + verticalColumnFull);

    return  primaryColumnFull
        ||
        horizontalNextColFull
        ||
        horizontalPrevColFull
        ||
        verticalColumnFull;
}

function newGrid(grid, combo, blocks) {

    //printGrid(grid);
    // copy current grid
    const gridCopy = grid.map(a => a.slice());

    const columnIndexes = combo.getColumnIndexes();
    //printErr('columnIndexes = ' + columnIndexes);

    const colours = combo.getBlocks(blocks);
    //printErr('colours = ' + colours);

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



function scoreGrid(grid, combo) {
    let totalScore = 0;
    let stepCount = 0;
    let step = 0;
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

        if (rounds === debugRound) {
            // printGrid(grid);
            // printGrid(checked);
        }

        clearMatches(grid, checked);

        let stepScore = (10 * stepCount) * (calculateChainPower(step) + calculateColourBonus(colourSet) + groupBonus);
        totalScore += stepScore;

        if (rounds === debugRound) {
            // printGrid(grid);
            // printGrid(checked);
            // printErr('step = ' + step);
            // printErr('stepCount = ' + stepCount);
            // printErr('chainPower = ' + calculateChainPower(step));
            // printErr('colourBonus = ' + calculateColourBonus(colourSet));
            // printErr('groupBonus = ' + groupBonus);
            // printErr('stepScore = ' + stepScore);
            // printErr('totalScore = ' + totalScore);
        }

    } while (stepCount !== 0);

    if (totalScore === 0) {
        totalScore = scoreGridNoMatches(grid);
    }

    if (totalScore === 0) {
        totalScore = calculateColumnScore(combo.getColumnIndexes());
    }

    if (rounds === debugRound) {
        printErr('totalScore = ' + totalScore)
    }

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

function calculateChainPower(step) {
    if (step === 1) {
        return 1;
    }
    else {
        return (step - 1) * 8;
    }
}



function scoreGridNoMatches(gridToScore) {

    let gridScore = 0;

    // score each column
    for (let colIndex = MIN_COLUMN; colIndex <= MAX_COLUMN; colIndex++) {
        let column = getColumn(gridToScore, colIndex);
        if (!scoreMap.get(column)) {
            scoreMap.set(column, calculateScoreForLine(column));
        }
        gridScore += scoreMap.get(column);
    }

    // score each row
    gridToScore.forEach(row => {
        if (!scoreMap.get(row)) {
            scoreMap.set(row, calculateScoreForLine(row));
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

function calculateScoreForLine(line) {
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
                if (rounds === debugRound) {
                    //printErr('streak of ' + streak + ' ' + currentColour + 's ended, score = ' + score);
                }
            }
            // reset
            streak = 1;
            currentColour = c;
        }
    });

    if (rounds === debugRound) {
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