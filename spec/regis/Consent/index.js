const nxt = require('../ConfirmRegisProfile')

const ask = {
	type: 'text',
	text: "confirm consent?",
}

const quick_reply_yes = {
	type: 'quick_reply_text',
	label: 'yes',
}

const quick_reply_no = {
	type: 'quick_reply_text',
	label: 'no',
}

const ctx = {
	name: 'awaiting_consent',
	do: [
		ask,
		quick_reply_yes,
		quick_reply_no,
	],
	metadata: {
		dropoff_id: 10500,
	},
}

const yes = {
	type: 'text',
	ctx,
	pipe: [
		{ $$filterTextIsIn: ['yes'] },
	],
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'consent',
			paths: {
				value: [],
			},
		},
	],
	next: {
		to: nxt.ctx,
	},
}

const no = {
	type: 'text',
	ctx,
	pipe: [
		{ $$filterTextIsIn: ['no'] },
	],
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'consent',
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
	name: 'consent',
	ctx,
	sub: {
		$$concatFirst: [
			yes,
			no,
		]
	},
	do: [ask],
}

module.exports = {
	ctx,
	flow,
}
