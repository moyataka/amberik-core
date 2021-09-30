//const nxt = require('../FullName')
const nxt = require('../PurchaseReceipt')

const flow = {
	name: 'greeting',
	pipe: [
		{ $$mapToByEventSelector: ['getUserId'] },
	],
	project: 'identity',
	do: [
		/*
		{
			type: 'template',
			name: 'flex-confirm-regis-profile',
			paths: {
				name: ['project'],
			},
		},
		*/
		{
			type: 'text',
			text: 'greeting',
		},
		{
			type: 'state',
			key: 'line_uid',
			paths: {
				value: [],
			},
		},
		{
			type: 'state',
			key: 'tx_id',
			value: '',
			formatters: {
				value: { $alwaysUUID: [] },
			}
		}
	],
	next: {
		to: nxt.ctx,
	}
}

module.exports = {
	flow,
}
