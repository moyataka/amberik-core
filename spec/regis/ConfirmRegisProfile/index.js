const nxt = require('../SerialNumber')
const nxtFullName = require('../FullName/def')

const ask = {
	type: 'text',
	text: "are you confirm regis proifle?",
}

const ctx = {
	name: 'awaiting_confirm_regis_profile',
	do: [
		ask,
	],	
	metadata: {
		dropoff_id: 10600,
	},
}

//BACKLOG find the way to this declarative way
const createEdit = (txts, to) => ({
	type: 'text',
	ctx,
	pipe: [ { $$filterTextIsIn: txts }],
	do: [
		{
			type: 'switch',
			to: ctx,
		},
	],
	next: {
		to,
	},
})

const flow = {
	name: 'confirm_regis_profile',
	ctx,
	sub: {
		$$concatFirst: [
			createEdit(['full_name'], nxtFullName.ctx),
		]
	},
	do: [ask],
}

module.exports = {
	ctx,
	flow,
}
