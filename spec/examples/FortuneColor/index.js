const R = require('ramda')
const { getGoodColor, goodColorFormater } = require('./functions')

const fortune_color = {
  name: 'fortune_color',
  pipe: [
    { $$filterTextStartsWith: [ '/color' ] },
    { $$mapToByEventSelector: [ 'getUserId' ]	},
    { $$mapPipe: [
      { $call: [ getGoodColor ]},
      { $call: [ goodColorFormater ]},
    ]},
  ],
  do: [{
    type: 'template',
    name: 'color-progress',
  }],
}

module.exports = fortune_color