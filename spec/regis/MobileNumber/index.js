const nxt = require('../Email')

const ask = {
	type: 'text',
	text: "what's your mobile number",
}

const ctx = {
	name: 'awaiting_mobile_number',
	do: [ask],
	metadata: {
		dropoff_id: 10200,
	},
}

const pipeValidate = [
	{
		$$filterPipe: [
			{ $test: ['^[0][6,8-9][0-9]{8}$'] },
		],
	},
]

const cleanText = {
	$pipe: [
		'$trim',
		{ $replaceAll: ['\\D', ''] },
		{ $replace: ['^66', '0'] },
		{ $replace: ['^00', '00'] },
		{ $ifElse: [
			{ 
				$compose: [
					{ $equals: [9] },
					{ $length: [] },
				]
			},
			{ $concat: ['0'] },
			'$identity'
		]}
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
			key: 'mobile_number',
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
	name: 'mobile_number',
	ctx,
	sub: pass,
	do: [ask],
}

module.exports = {
	ctx,
	flow,
}
