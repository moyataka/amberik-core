const nxt = require('../ProductNumber')

const ctx = {
	name: 'awaiting_serial_number',
	do: [{
		type: 'text',
		text: "what's your serial number''",
	}],	
	metadata: {
		dropoff_id: 10700,
	},
}

const flow = {
	name: 'serial_number',
	ctx,
	pipe: [
		{ $$mapToEventMessageText: [] },
	],
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'serial_number',
			paths: {
				value: [],
			},
		},
	],
	next: {
		to: nxt.ctx,
	},
}

module.exports = {
	ctx,
	flow,
}
