const nxt = require('../PurchaseChannel')

const ask = {
	type: 'text',
	text: "when your purchase date",
}

const quick_reply = {
	type: 'quick_reply_datepicker',
	label: 'เลือกวันที่',
	mode: 'date',
	data: 'birthdate',
	initial: '1992-09-16',
}

const ctx = {
	name: 'awaiting_purchase_date',
	do: [ask, quick_reply],	
}

const pass = {
	type: 'date',
	ctx,
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'purchase_date',
			paths: {
				value: [],
			},
		},
		{
			type: 'text',
			paths: {
				text: [],
			},
		}
	],
	next: {
		to: nxt.ctx,
	},
}

const flow = {
	name: 'purchase_date',
	ctx,
	sub: pass,
	do: [ask, quick_reply],
}

module.exports = {
	ctx,
	flow,
}
