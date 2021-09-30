const url_jpy_thb = 'https://api.sandbox.transferwise.tech/v1/rates?source=JPY&target=THB'
const url_usd_thb = 'https://api.sandbox.transferwise.tech/v1/rates?source=USD&target=THB'
const act = 'jpy'
const act_usd = 'usd'
const headers = {
  Authorization: `Bearer ${process.env.TRANSFER_WISE_TOKEN}`,
}

const formatter  =  [
  { $head: [] },
  { $evolve: [{
    time: { $newDate: [] },
  }]},
  { $pick: [['time', 'rate']]},
  { $values: []},
  { $join: ['\n\n']},
  { $replace: ['\\(GMT\\)', '']},
]

const jpy$ = {
  name: 'jpy_thb_rate',
  type: 'text',
  startswith: `/${act}`,
  pipe: [
    { $$useStream: {
      type: 'get',
      url: url_jpy_thb,
      headers,
    }},
    { $$mapPipe: [
      ...formatter,
      { $concat: ['JPY to THB by Transfer Wise (Sandbox)\n']},
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
      headers,
    }},
    { $$mapPipe: [
      ...formatter,
      { $concat: ['USD to THB by Transfer Wise (Sandbox)\n']},
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