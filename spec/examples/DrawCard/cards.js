const R = require('ramda')

const syms = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
}

const toLabelSym = (txt) => {
  const sym_color = R.cond([
    [R.equals('H'), R.always('red')],
    [R.equals('D'), R.always('red')],
    [R.T, R.always('black')],
  ])(txt[1])

  return [
    txt[0],
    syms[txt[1]],
    sym_color,
  ]
}

const createNewDeckArray = R.compose(
  R.juxt([
    R.map(R.flip(R.concat)('S')),
    R.map(R.flip(R.concat)('H')),
    R.map(R.flip(R.concat)('D')),
    R.map(R.flip(R.concat)('C')),
  ]),
  R.always(['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']),
)

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const createShuffleDeck = R.compose(
  shuffle,
  R.flatten,
  createNewDeckArray,
)

module.exports = {
  toLabelSym,
  createNewDeckArray,
  createShuffleDeck,
}