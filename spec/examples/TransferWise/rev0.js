const url_jpy_thb = 'https://api.sandbox.transferwise.tech/v1/rates?source=JPY&target=THB'
const url_usd_thb = 'https://wise.com/rates/history?source=USD&target=THB&length=1&resolution=hourly'
const act = 'jpy'
const act_usd = 'usd'

const formatter  =  [
  { $sortBy: [{ $prop: ['time']}]},
  { $takeLast: [5]},
  { $reverse: []},
  { $map: [
    { $pipe: [
      { $evolve: [{
        time: { 
          $pipe: [
            { $isoStringFromTimestamp: [25200] },
            { $replace: [':00.000Z', '']},
          ]}},
      ]},
      { $pick: [['time', 'value']]},
      { $values: []},
      { $join: [' ']},
    ]},
  ]},
  { $join: ['\n']},
]

const jpy$ = {
  name: 'jpy_thb_rate',
  type: 'text',
  startswith: `/${act}`,
  pipe: [
    { $$useStream: {
      type: 'get',
      url: url_jpy_thb,
    }},
    { $$trace: []},
    { $$mapPipe: [
      ...formatter,
      { $concat: ['JPY/THB by Transfer Wise\n\n']},
    ]},
  ],
  do: [
    { type: 'text', paths: { text: []}},
  ]
}

const usd$ = {
  name: 'usd_thb_rate',
  type: 'text',
  startswith: `/${act_usd}`,
  pipe: [
    { $$useStream: {
      type: 'get',
      url: url_usd_thb,
    }},
    { $$mapPipe: [
      ...formatter,
      { $concat: ['USD/THB by Transfer Wise\n\n']},
    ]},
  ],
  do: [
    { type: 'text', paths: { text: []}},
  ]
}

const rate = {
  name: 'exchange_rate',
  sub: {
    $$mergeFirst: [
      jpy$,
      usd$,
    ],
  },
  pipe: [{ $$block: [] }],
  do: [ { type: 'nothing' } ], 
}

module.exports = rate