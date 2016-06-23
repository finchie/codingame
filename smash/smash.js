const grid = [
		['.', '3', '.', '.', '.', '.'],
		['.', '3', '.', '.', '.', '.'],
		['.', '3', '.', '.', '.', '.'],
		['.', '3', '.', '.', '.', '.'],
		['.', '0', '.', '.', '.', '.'],
		['.', '1', '.', '.', '.', '.'],
		['0', '2', '1', '.', '.', '.'],
		['1', '2', '2', '.', '0', '.'],
		['2', '3', '3', '0', '1', '.'],
		['3', '4', '4', '1', '1', '.'],
		['4', '5', '5', '1', '1', '.'],
		['5', '5', '4', '3', '3', '0']
	];
const MAX_ROW = 11; // 0-indexed 12 rows
const MAX_COLUMN = 5; // 0-indexed 6 columns
const STATUS_GROUPED = 4;
const STATUS_SKULL = 3;
const STATUS_CHECKED_MATCHED = 2;
const STATUS_CHECKED_UNMATCHED = 1;
const STATUS_UNCHECKED = 0;
const SKULL = '0';

let score = scoreGrid(grid);

//document.getElementById('output').innerHTML = score;

console.log('score = ' + score);

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

        printGrid(grid);
        printGrid(checked);

        clearMatches(grid, checked);

        printGrid(grid);
        printGrid(checked);

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

function printGrid(grid) {
    grid.forEach(row => printErr(row.join(' ')));
    printErr('------');
}

function printErr(o) {
	console.log(o);
}
