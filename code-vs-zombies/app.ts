import fs from 'node:fs';

/**
 * Save humans, destroy zombies!
 **/


// game loop
while (true) {
    var inputs: string[] = readline().split(' ');
    const x: number = parseInt(inputs[0]!);
    const y: number = parseInt(inputs[1]!);
    const humanCount: number = parseInt(readline());
    for (let i = 0; i < humanCount; i++) {
        var inputs: string[] = readline().split(' ');
        const humanId: number = parseInt(inputs[0]!);
        const humanX: number = parseInt(inputs[1]!);
        const humanY: number = parseInt(inputs[2]!);
    }
    const zombieCount: number = parseInt(readline());
    for (let i = 0; i < zombieCount; i++) {
        var inputs: string[] = readline().split(' ');
        const zombieId: number = parseInt(inputs[0]!);
        const zombieX: number = parseInt(inputs[1]!);
        const zombieY: number = parseInt(inputs[2]!);
        const zombieXNext: number = parseInt(inputs[3]!);
        const zombieYNext: number = parseInt(inputs[4]!);
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');

    console.log('0 0');     // Your destination coordinates

}

/**
 * Mimics the readline() function in the CodinGame environment, allowing us to read input from a file instead of standard input. This is useful for testing and debugging our code locally before submitting it to CodinGame.
 */
const inputLines: string[] = fs.readFileSync(0, 'utf-8').trim().split('\n');
let inputIndex = 0;

function readline(): string {
    return inputLines[inputIndex++] || '';
}

