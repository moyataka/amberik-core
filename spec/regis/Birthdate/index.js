const nxt = require('../Consent')

const ask = {
	type: 'text',
	text: "what's your birthdate",
}

const quick_reply = {
	type: 'quick_reply_datepicker',
	label: 'เลือกวันที่',
	mode: 'date',
	data: 'birthdate',
	initial: '1992-09-16',
}

const ctx = {
	name: 'awaiting_birthdate',
	do: [ask, quick_reply],
	metadata: {
		dropoff_id: 10400,
	},
}

const pass = {
	type: 'date',
	ctx,
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'birthdate',
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
	name: 'birthdate',
	ctx,
	sub: pass,
	do: [ask, quick_reply],
}
module.exports = {
	ctx,
	flow,
}
