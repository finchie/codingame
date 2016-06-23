const grid = [
		['.', '.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.', '.'],
		['.', '1', '.', '.', '.', '.'],
		['0', '2', '1', '.', '.', '.'],
		['1', '2', '2', '.', '.', '.'],
		['2', '3', '3', '.', '1', '.'],
		['3', '4', '4', '1', '1', '.'],
		['4', '5', '5', '1', '1', '.'],
		['5', '5', '4', '3', '3', '.']
	];
const MAX_ROW = 11; // 0-indexed 12 rows
const MAX_COL = 5; // 0-indexed 6 columns
const STATUS_GROUPED = 4;
const STATUS_CHECKED = 2;
const STATUS_CHECKED_UNMATCHED = 1;
const STATUS_UNCHECKED = 0;

printGrid(grid);

let score = scoreGrid(grid);

printGrid(grid);

//document.getElementById('output').innerHTML = score;

console.log('score = ' + score);

function scoreGrid(grid) {
	let score = 0;
	const checked = new Array(MAX_ROW + 1).fill().map(_ => new Array(MAX_COL + 1).fill(STATUS_UNCHECKED));

	// each step
	for (let rowIndex = MAX_ROW; rowIndex >= 0; rowIndex--) {
		for (let colIndex = 0; colIndex <= MAX_COL; colIndex++) {
            //console.log('rowIndex = ' + rowIndex + ', colIndex = ' + colIndex);
            //console.log('checked[rowIndex][colIndex] = ' + checked[rowIndex][colIndex]);
            //if (rowIndex >= 10) {printGrid(checked);}
			if (!checked[rowIndex][colIndex]) {
				let val = grid[rowIndex][colIndex];
                //console.log('val = ' + val);
				if (val !== '.' && val !== '0') {
                    checked[rowIndex][colIndex] = STATUS_CHECKED;
					let count = 1 + countMatchingNeighbours(grid, rowIndex, colIndex, checked);
                    //if (rowIndex >= 10) {printGrid(checked);}
					if (count >= 4) {
						score += (10 * count);
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

	printGrid(checked);

	return score;
}

function countMatchingNeighbours(grid, rowIndex, colIndex, checked) {

	const val = grid[rowIndex][colIndex];
	let total = 0;
	
	if (colIndex > 0 && !checked[rowIndex][colIndex - 1]) {
		if (grid[rowIndex][colIndex - 1] === val) {
			checked[rowIndex][colIndex - 1] = STATUS_CHECKED;
			total += 1 + countMatchingNeighbours(grid, rowIndex, colIndex - 1, checked);
		}
		else {
			checked[rowIndex][colIndex - 1] = STATUS_CHECKED_UNMATCHED;
		}
	}
	if (colIndex < MAX_COL && !checked[rowIndex][colIndex + 1]) {
		if (grid[rowIndex][colIndex + 1] === val) {
			checked[rowIndex][colIndex + 1] = STATUS_CHECKED;
			total += 1 + countMatchingNeighbours(grid, rowIndex, colIndex + 1, checked);
		}
		else {
			checked[rowIndex][colIndex + 1] = STATUS_CHECKED_UNMATCHED;
		}
	}
	if (rowIndex > 0 && !checked[rowIndex - 1][colIndex]) {
		if (grid[rowIndex - 1][colIndex] === val) {
			checked[rowIndex - 1][colIndex] = STATUS_CHECKED;
			total += 1 + countMatchingNeighbours(grid, rowIndex - 1, colIndex, checked);
		}
		else {
			checked[rowIndex - 1][colIndex] = STATUS_CHECKED_UNMATCHED;
		}
	}
	if (rowIndex < MAX_ROW && !checked[rowIndex + 1][colIndex]) {
		if (grid[rowIndex + 1][colIndex] === val) {
			checked[rowIndex + 1][colIndex] = STATUS_CHECKED;
			total += 1 + countMatchingNeighbours(grid, rowIndex + 1, colIndex, checked);
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
			if (cell === STATUS_CHECKED) {
				checked[rowIndex][cellIndex] = (isGrouped) ? STATUS_GROUPED : STATUS_UNCHECKED;
			}
			if (cell === STATUS_CHECKED_UNMATCHED) {
				checked[rowIndex][cellIndex] = STATUS_UNCHECKED;
			}
		});
	});
}

function printGrid(grid) {
    grid.forEach(row => printErr(row.join(' ')));
    printErr('------');
}

function printErr(o) {
	console.log(o);
}
