const keyword_matching = require('./KeywordMatching')
const fortune_color = require('./FortuneColor')
const fortune_auto_reply = require('./FortuneAutoReply')
const rom_price = require('./RomPrice')
const draw_card = require('./DrawCard')
const pokemon = require('./PokemonTCG')
const transferwise_rate = require('./TransferWise')
const crypto = require('./CoinGecko')

const default_fallback = {
	name: 'default',
	kind: 'user',
	do: [
		{
			type: 'text',
			text: 'Sorry I do not understand.',
		},
	],
}

const root = {
	name: 'root',
	sub: {
		$$concatFirst: [
			crypto,
			transferwise_rate,
			{
				$$mergeFirst: [
					pokemon,
					draw_card,
				]
			},
			fortune_auto_reply,
			rom_price,
			{ 
				$$mergeFirst: [
					fortune_color,
					keyword_matching,
				]
			},
			default_fallback,
		],
		
	},
	do: [ { type: 'nothing' } ],
	error: {
		_: [
			{
				type: 'text',
				text: 'something went wrong',
			}
		],
	},
}

module.exports = root
