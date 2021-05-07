class Action {
    id: number;
    type: String;
    delta: number[];
    price: number;
    tomeIndex: number;
    taxCount: number;
    castable: boolean;
    repeatable: boolean;

    constructor(inputLine: String) {
        const inputs: string[] = inputLine.split(' ');
        this.id = parseInt(inputs[0]); // the unique ID of this spell or recipe
        this.type = inputs[1]; // in the first league: BREW; later: CAST, OPPONENT_CAST, LEARN, BREW
        this.delta = [];
        this.delta[0] = parseInt(inputs[2]); // tier-0 ingredient change
        this.delta[1] = parseInt(inputs[3]); // tier-1 ingredient change
        this.delta[2] = parseInt(inputs[4]); // tier-2 ingredient change
        this.delta[3] = parseInt(inputs[5]); // tier-3 ingredient change
        this.price = parseInt(inputs[6]); // the price in rupees if this is a potion
        this.tomeIndex = parseInt(inputs[7]); // in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax; For brews, this is the value of the current urgency bonus
        this.taxCount = parseInt(inputs[8]); // in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell; For brews, this is how many times you can still gain an urgency bonus
        this.castable = inputs[9] !== '0'; // in the first league: always 0; later: 1 if this is a castable player spell
        this.repeatable = inputs[10] !== '0'; // for the first two leagues: always 0; later: 1 if this is a repeatable player spell
    }
}

class Witch {
    inventory: number[];
    score: number;

    constructor(inputLine: String) {
        const inputs: string[] = inputLine.split(' ');
        this.inventory = [];
        this.inventory[0] = parseInt(inputs[0]); // tier-0 ingredients in inventory
        this.inventory[1] = parseInt(inputs[1]);
        this.inventory[2] = parseInt(inputs[2]);
        this.inventory[3] = parseInt(inputs[3]);
        this.score = parseInt(inputs[4]); // amount of rupees
    }
}

let actions: Action[];
let me: Witch;
let you: Witch;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

// game loop
while (true) {
    // start with empty actions array
    actions = [];

    // read actions
    const actionCount: number = parseInt(readline()); // the number of spells and recipes in play
    for (let i = 0; i < actionCount; i++) {
        actions.push(new Action(readline()));
    }

    // read players
    me = new Witch(readline());
    you = new Witch(readline());

    let brewId: number;

    // 1st strategy: brew 1st action
    brewId = actions[0].id;

    // 2nd strategy: brew highest paying action
    brewId = actions.map(action => {return {id: action.id, price: action.price}}).sort((a, b) => b.price - a.price)[0].id;

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');


    // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
    console.log('BREW ' + brewId);
}
