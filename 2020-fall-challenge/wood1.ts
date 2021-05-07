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

const ACTION_TYPE_CAST = "CAST";
const ACTION_TYPE_OPP_CAST = "OPPONENT_CAST";
const ACTION_TYPE_BREW = "BREW";


/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

// game loop
while (true) {

    // the action to perform
    let action: String;

    // arrays to store orders & spells
    let orders: Action[] = [];
    let mySpells: Action[] = [];
    let yourSpells: Action[] = [];

    // read orders & spells
    const actionCount: number = parseInt(readline()); // the number of spells and recipes in play
    for (let i = 0; i < actionCount; i++) {
        const action = new Action(readline());
        if (ACTION_TYPE_BREW === action.type) {
            orders.push(action);
        } else if (ACTION_TYPE_CAST === action.type) {
            mySpells.push(action);
        } else if (ACTION_TYPE_OPP_CAST === action.type) {
            yourSpells.push(action);
        } else {
            console.error('Action type not known: ' + action.type);
        }
    }

    // read players
    const me = new Witch(readline());
    const you = new Witch(readline());

    let actionId: number = 0;

    // order orders!
    orders = sortOrdersByPriceDescending(orders);

    // if you have ingredients for any order then make it
    orders.some(order => {
        if (hasIngredients(me.inventory, order.delta)) {
            console.error("got ingredients for order " + order.id);
            actionId = order.id;
            return true;
        } else {
            console.error("not got ingredients for order " + order.id);
            return false;
        }
    });

    if (actionId != 0) {
        action = 'BREW ' + actionId;
    } else if (mySpells.filter(s => s.castable).length === 0) {
        // all spells exhausted so rest
        action = 'REST';
    } else {
        // determine which spell to cast
        let castableSpells = mySpells.filter(s => s.castable);

        // try most expensive first
        sortActionsByCostDescending(castableSpells);

        castableSpells.some(spell => {
            if (hasIngredients(me.inventory, spell.delta)) {
                console.error("got ingredients for spell " + spell.id);
                actionId = spell.id;
                return true;
            } else {
                console.error("not got ingredients for spell " + spell.id);
                return false;
            }
        });

        if (actionId != 0) {
            action = 'CAST ' + actionId;
        } else {
            // all castable spells too expensive so rest
            action = 'REST';
        }
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');


    // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
    console.log(action);
}

function sortOrdersByPriceDescending(orders: Action[]): Action[] {
    return orders.sort((a, b) => b.price - a.price);
}

function sortActionsByCostDescending(actions: Action[]): void {
    actions.sort((a, b) => cost(b.delta) - cost(a.delta));
}

function addArrays(array1: number[], array2: number[]): number[] {
    let result: number[] = [];
    for(let index = 0; index < array1.length; index++) {
        result[index] = array1[index] + array2[index];
    }
    return result;
}

function isValid(array: number[]): boolean {
    let valid = true;
    array.forEach(element => {
        if (element < 0) {
            valid = false;
        }
    });
    return valid;
}

function hasIngredients(inventory: number[], delta: number[]): boolean {
    let result = addArrays(inventory, delta);

    // if any ingredient less than zero we can't make it
    return isValid(result);
}

function cost(array: number[]): number {
    let cost = 0;
    for(let index = 0; index < array.length; index++) {
        cost += array[index] * Math.pow(10, index);
    }
    return cost;
}
