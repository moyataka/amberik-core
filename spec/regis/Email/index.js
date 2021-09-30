const nxt = require('../Birthdate')

const ask = {
	type: 'text',
	text: "what's your email",
}

const ctx = {
	name: 'awaiting_email',
	do: [ask],	
	metadata: {
		dropoff_id: 10300,
	},
}

const pipeValidate = [
	{
		$$filterPipe: [
			{ $test: ['^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'] },
		],
	},
]

const cleanText = {
	$pipe: [
		'$trim',
		'$toLower',
	],
}

const pass = {
	type: 'text',
	ctx,
	pipe: [
		{ $$map: [ cleanText ]},
		{ $$pipe: pipeValidate },
	],
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'email',
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
	name: 'email',
	ctx,
	sub: pass,
	do: [ask],
}

module.exports = {
	ctx,
	flow,
}
