const nxt = require('../PurchaseDate')

const ask = {
	type: 'text',
	text: "whats your product number",
}

const ctx = {
	name: 'awaiting_product_numbear',
	do: [ask],
	metadata: {
		dropoff_id: 10800,
	},
}

const s = {
	name: 'check_product_number',
	pipe: [
		{ $$filter: [
			{ $length: [] },
			{ $lt: [0] },
		]},
		{ $$map: [ { $nth: [0] }]}
	],
}

const pass = {
	type: 'text',
	ctx,
	pipe: [
		{ $$useStream: s },
	],
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'product',
			paths: {
				value: [],
			},
		},
	],
	next: {
		to: nxt.ctx,
	},
}

const flow = {
	name: 'product_number',
	ctx,
	sub: pass,
	do: [ask],
}

module.exports = {
	ctx,
	flow,
}
