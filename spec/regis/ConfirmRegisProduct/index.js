const ctx = {
	name: 'awaiting_confirm_regis_product',
	do: [{
		type: 'text',
		text: "confirm regis product",
	}],	
	metadata: {
		dropoff_id: 11200,
	},
}

const flow = {
	name: 'confirm_receipt_product',
	ctx,
	pipe: [
		{ $$mapToEventMessageText: [] },
	],
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'confirm_receipt_product',
			paths: {
				value: [],
			},
		},
		{
			type: 'context',
			ctx: { name: '_purge' },
		}
	],
}

module.exports = {
	ctx,
	flow,
}
