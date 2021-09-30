const { createShuffleDeck } = require('./cards')
const flexDeck = require('./flexDeck')
const flexCard = require('./flexCard')

const act = 'draw'

const gen_card = {
  $pipe: [
    { $call: [ flexCard ]},
  ]
}

const gen_details = {
  $pipe: [
    { $call: [ flexDeck ] },
  ],
}

const shuffle = { 
  $$mapPipe: [ 
    { $always: [[]]},
    { $apply: [ createShuffleDeck ]},
    { $objOf: ['deck'] },
    { $assoc: ['idx', 0]},
  ]
}

const setState = {
  type: 'state',
  key: 'cards',
  paths: {
    value: ['state'],
  },
}

const opFlex = {
  $$mapPipe: [
    { $applySpec: [{
      type: { $always: ['flex']},
      altText: { $always: ['Draw Card']},
      contents: {
        type: { $always: ['carousel']},
        contents: { $juxt: [[
          gen_card,
          gen_details,
        ]]},
      },
    }]},
  ],
}

const show = [
  {
    type: 'raw',
    platform: 'line',
    paths: { msg: ['msg'] },
  },
  setState,
]

const spec = {
  $$spec: {
    msg: { pipe: [opFlex] },
    state: { pipe: [] },
  }
}

const shuffle$ = {
  name: 'shuffle_cards',
  type: 'text_isin',
  isin: `/shuffle`,
  pipe: [
    { $$spec: {
      event: { pipe: [] },
      state: { pipe: [shuffle] },
    }},
    { $$setSharedMemory: [] },
    spec,
  ],
  do: show,
}

const draw_card$ = {
  name: 'draw_card',
  type: 'text_isin',
  isin: `/${act}`,
  sub: {
    $$concatFirst: [
      shuffle$,
    ],
  },
  pipe: [
    {
      $$spec: {
        event: { pipe: []},
        state: { pipe: [
          { $$getSharedMemory: [] }, 
          { $$filterPipe: [
            { $prop: ['idx']},
            { $gt: [51]},
          ]},
          { $$map: [{ 
            $evolve: [
              { idx: { $inc: [] } } ,
            ]}
          ]},
        ]},
      }
    },
    { $$setSharedMemory: [] },
    spec,
  ],
  do: show,
}

const root = {
  name: 'simple_draw',
  sub: {
    $$concatFirst: [
      shuffle$,
      draw_card$,
    ],
  },
  pipe: [{ $$block: [] }],
  do: [ { type: 'nothing' } ], 
}

module.exports = root