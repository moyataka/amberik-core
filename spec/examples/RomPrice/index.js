const parseItem = { $pipe: [
  { $juxt: [[
    { $prop: ['name'] },
    { $compose: [
      { $flipConcat: [' zeny']},
      '$toString',
      { $path: [['sea', 'latest']] },
    ]},
  ]]},
  { $join: [': ']},
]}

const rom_price = {
  name: 'rom_price',
  type: 'text',
  startswith: '/rom ',
  pipe: [
    { $$mapPipe: [
      { $objOf: ['item'] },
      { $assoc: ['exact', false] },
      { $objOf: ['_params']},
    ]},
    { $$useStream: {
      name: 'check_rom_price',
      type: 'get',
      url: 'https://www.romexchange.com/api'
    }},
    { $$mapPipe: [
      { $map: [ parseItem ]},
      { $join: ['\n'] },
    ]},
	],
  do: [
    {
      type: 'cond',
      cond: '$isEmpty',
      do: [ { type: 'text', text: 'item not found'} ],
      default: [
        {
          type: 'text',
          paths: {
            text: [],
          },
        },
      ],
    }
  ],
}

module.exports = rom_price