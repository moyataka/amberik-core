const url = 'https://api.pokemontcg.io/v2/cards?page=54'

const sampling1 = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const pipeSampleCard = [
  { $$mapPipe: [
    { $call: [ (_) => Math.floor((Math.random() * 54) + 1)]},
    { $objOf: ['page']},
    { $objOf: ['_params']},
  ]},
  {
    $$useStream: {
      name: 'pokemon_tcg',
      type: 'get',
      url,
    },
  },
  { $$mapPipe: [
    { $prop: ['data']},
    { $call: [sampling1] },
    { $path: [['images', 'large']]}
  ]},
]

const root = {
  name: 'pokemon_tcg',
  type: 'text',
  startswith: `/gacha`,
  pipe: [
    { $$spec: {
      card_1: { pipe: [ ...pipeSampleCard ]},
      card_2: { pipe: [ ...pipeSampleCard ]},
      card_3: { pipe: [ ...pipeSampleCard ]},
      card_4: { pipe: [ ...pipeSampleCard ]},
    }},
    { $$mapPipe: [ 
      { $values: []},
      { $prepend: ['https://upload.wikimedia.org/wikipedia/en/3/3b/Pokemon_Trading_Card_Game_cardback.jpg']},
      { $objOf: ['data']},
    ]},
  ],
  do: [
    {
      type: 'template',
      name: 'carousel-images',
    }
  ]
}

module.exports = root