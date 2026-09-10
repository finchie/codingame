/**
 * Connect towns with your train tracks and disrupt the opponent's.
 **/

const myId: number = parseInt(readline()); // 0 or 1
const width: number = parseInt(readline()); // map size
const height: number = parseInt(readline());
for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
        var inputs: string[] = readline().split(' ');
        const regionId: number = parseInt(inputs[0]);
        const type: number = parseInt(inputs[1]); // 0 (PLAINS), 1 (RIVER), 2 (MOUNTAIN), 3 (POI)
    }
}
const townCount: number = parseInt(readline());
for (let i = 0; i < townCount; i++) {
    var inputs: string[] = readline().split(' ');
    const townId: number = parseInt(inputs[0]);
    const townX: number = parseInt(inputs[1]);
    const townY: number = parseInt(inputs[2]);
    const desiredConnections: string = inputs[3]; // comma-separated town ids e.g. 0,1,2,3
}

// game loop
while (true) {
    const myScore: number = parseInt(readline());
    const foeScore: number = parseInt(readline());
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            var inputs: string[] = readline().split(' ');
            const tracksOwner: number = parseInt(inputs[0]);
            const instability: number = parseInt(inputs[1]); // region inked (destroyed) when this >= 3.
            const inked: boolean = inputs[2] !== '0'; // true if region is destroyed.
            const partOfActiveConnections: string = inputs[3]; // if this cell is part of one or more railway connections, this will be town ids (separated by -) in a list separated by commas. e.g. 0-1,1-2,1-3. "x" otherwise.
        }
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');


    // AUTOPLACE x1 y1 x2 y2 | PLACE_TRACKS x y | DISRUPT regionId | MESSAGE text
    console.log('WAIT');
}
