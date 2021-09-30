const nxt = require('../MobileNumber')
const { ask, ctx, fail1, fail2 } = require('./def')

const pipeValidateName = [
	{
		$$filterPipe: [
			'$length',
			{ $equals: [0] },
			'$not',
		]
	},
	{
		$$filter: [ { $includes: [' '] } ]
	},
]

const cleanName = {
	$pipe: [
		'$toLower',
		'$trim',
		{ $replace: ['^(นาย |นาง |นางสาว |น(.|)ส(.|) |mr(.|) |miss |ms(.|) |mrs(.|) )', ''] },
		'$trim',
		{ $replaceAll: ['[^A-Za-zก-๙ \\.\\-\\_\\(\\)\\[\\]]+', ''] },
		'$trim',
		'$capitalize',
	]
}

const f1 = {
	ctx,
	pipe: [{ $$filterRetainRemainEqual: [2] }],
	do: [fail1],
}

const pass = {
	type: 'text',
	ctx,
	pipe: [
		{ $$map: [ cleanName ] },
		{ $$pipe: pipeValidateName },
	],
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'full_name',
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
	name: 'full_name',
	type: 'text',
	ctx,
	sub: {
		$$concatFirst: [
			pass,
			f1,
		],
	},
	do: [fail2],
}

module.exports = {
	ctx,
	flow,
}
