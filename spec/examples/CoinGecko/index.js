const act = 'coin'
const url_coin_list = 'https://api.coingecko.com/api/v3/coins/list'
const url_get_price = 'https://api.coingecko.com/api/v3/simple/price'

const pipeGetParams = [
  { $$mapPipe: [
    { $split: [' ']},
    { $applySpec: [{
      coin: { $propOr: ['btc', 1]},
      currency: { $propOr: ['usd', 2]},
    }]},
  ]}
]

const pipeFetchCoinList = [
  { $$useStream: {
    type: 'get',
    url: url_coin_list,
  }} 
]

const pipeGetCoinItem = [
  { $$mapPipe: [
    { $juxt: [[
      { $always: [['symbol', 'name']] },
      { $prop: ['coin_list']},
      { $path: [['params', 'coin']]},
    ]]},
    { $apply: [ '$fuzzy' ]},
    { $prop: ['item']},
  ]}
]

const pipeGetPrice = [
  {
    $$mapPipe: [
      { $applySpec: [{
        ids: { $path: [['item', 'id']]},
        vs_currencies: { $prop: ['currency'] },
      }]},
      { $objOf: ['_params']},
    ],
  },
  {
    $$useStream: {
      name: 'get_price',
      type: 'get',
      url: url_get_price,
    },
  },
  { 
    $$mapPipe: [
      { $values: []},
      { $nth: [0]},
      { $values: []},
      { $nth: [0]},
    ],
  }
]

const root = {
  name: 'crypto_price',
  type: 'text',
  startswith: `/${act}`,
  pipe: [
    { $$spec: {
      params: { pipe: pipeGetParams },
      coin_list: { pipe: pipeFetchCoinList },
    }},
    { $$spec: {
      currency: { pipe: [ 
        { $$mapPath: [['params', 'currency']] },
      ]},
      item: { pipe: pipeGetCoinItem },
    }},
    { $$spec: {
      data: { pipe: [] },
      price: { pipe: pipeGetPrice },
    }},
    {
      $$mapPipe: [
        { $applySpec: [{
          name: { $path: [['data', 'item', 'name']]},
          price: { $prop: ['price']},
          currency: { $path: [['data', 'currency']]},
        }]},
        { $textKeyVal: ['{{name}} price is {{price}} {{currency}}\nby CoinGecko']},
      ],
    },
  ],
  do: [
    {
      type: 'text',
      paths: {
        text: [],
      },
    },
  ],
  error: {
    429: [
      {
        type: 'text',
        text: 'too many requests, please wait a moment',
      }
    ],
    _: [
      {
        type: 'text',
        text: 'something went wrong',
      }
    ],
  },
}

module.exports = root