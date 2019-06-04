onst deck1 = new Queue();
const deck2 = new Queue();
let roundCount = 0;
let PAT = false;
let output = '';
const cardValues = '2345678910JQKA';

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const n = parseInt(readline()); // the number of cards for player 1
for (let i = 0; i < n; i++) {
    deck1.enqueue( readline() ); // the n cards of player 1
}
const m = parseInt(readline()); // the number of cards for player 2
for (let i = 0; i < m; i++) {
    deck2.enqueue(readline()); // the m cards of player 2
}

// Write an action using console.log()
// To debug: console.error('Debug messages...');
console.error('deck1: ' + deck1);
console.error('deck2: ' + deck2);

// game loop
while(!deck1.isEmpty() && !deck2.isEmpty() && !PAT) {
    roundCount++;
    
    const spoils1 = new Queue();
    const spoils2 = new Queue();
    let winningDeck;
    
    let card1 = deck1.dequeue();
    let card2 = deck2.dequeue();
    spoils1.enqueue(card1);
    spoils2.enqueue(card2);
    
    // battle
    if (isGreater(card1, card2)) {
        winningDeck = deck1;
    } else if  (isGreater(card2, card1)){
        winningDeck = deck2;
    } else {
        // war
        while (isEqual(card1, card2) && !PAT) {
            // pop next 3 cards off each deck
            [1,2,3].forEach( () => {
                if(deck1.peek() && deck2.peek()) {
                    spoils1.enqueue(deck1.dequeue());
                    spoils2.enqueue(deck2.dequeue());
                } else {
                    PAT = true;
                }
            });
            if (PAT) break;
            
            // pop battle cards
            card1 = deck1.dequeue();
            card2 = deck2.dequeue();
            spoils1.enqueue(card1);
            spoils2.enqueue(card2);
        }
            
        if (isGreater(card1, card2)) {
            winningDeck = deck1;
        } else {
            winningDeck = deck2;
        }
    }
    
    // winner takes the spoils
    while (!spoils1.isEmpty()) {
        winningDeck.enqueue(spoils1.dequeue());
    }
    while (!spoils2.isEmpty()) {
        winningDeck.enqueue(spoils2.dequeue());
    }
}

// output the winner & game rounds
if (PAT) {
    output = 'PAT';
}
else {
    const winner = deck1.isEmpty() ? '2' : '1';
    output = winner + ' ' + roundCount;
}
console.log(output);


function Queue() {

  // initialise the queue and offset
  var queue  = [];
  var offset = 0;

  // Returns the length of the queue.
  this.getLength = function() {
    return (queue.length - offset);
  }

  // Returns true if the queue is empty, and false otherwise.
  this.isEmpty = function() {
    return (queue.length === 0);
  }

  /* Enqueues the specified item. The parameter is:
   *
   * item - the item to enqueue
   */
  this.enqueue = function(item) {
    queue.push(item);
  }

  /* Dequeues an item and returns it. If the queue is empty, the value
   * 'undefined' is returned.
   */
  this.dequeue = function() {

    // if the queue is empty, return immediately
    if (queue.length === 0) return undefined;

    // store the item at the front of the queue
    var item = queue[offset];

    // increment the offset and remove the free space if necessary
    if (++ offset * 2 >= queue.length){
      queue  = queue.slice(offset);
      offset = 0;
    }

    // return the dequeued item
    return item;

  }

  /* Returns the item at the front of the queue (without dequeuing it). If the
   * queue is empty then undefined is returned.
   */
  this.peek = function() {
    return (queue.length > 0 ? queue[offset] : undefined);
  }
  
  this.toString = function() {
      return queue.join(' ');
  }

}

function isEqual(card1, card2) {
    const value1 = card1.charAt(0);
    const value2 = card2.charAt(0);
    
    return (cardValues.indexOf(value1) === cardValues.indexOf(value2))
}
function isGreater(card1, card2) {
    const value1 = card1.charAt(0);
    const value2 = card2.charAt(0);
    
    return (cardValues.indexOf(value1) > cardValues.indexOf(value2))
}
