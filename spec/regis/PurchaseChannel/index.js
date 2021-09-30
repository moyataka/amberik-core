const nxt = require('../PurchaseReceipt')

const image_url = 'https://storage.googleapis.com/elx-public-images/line/ELX_chatbot_RichMsg_PurchaseChannel_v1.jpg'
const ask = {
	type: 'text',
	text: "what's channel",
}
const ask_others = {
	type: 'text',
	text: "where's",
}

const imagemap = {
	type: 'imagemap',
	url: image_url,
	actions: [
		{
			type: 'message',
			text: 'บุญถาวร',
			area: {
				x: 0, y:0, height: 300, width: 300,
			},
		},
		{
			type: 'message',
			text: 'Others',
			area: {
				x: 700, y:700, height: 300, width: 300,
			},
		},
	],
}

const ctx = {
	name: 'awaiting_purchase_channel',
	do: [
		ask,
		imagemap,		
	],	
	metadata: {
		dropoff_id: 11000,
	},
}

const ctx_others = {
	name: 'awaiting_purchase_channel_others',
	do: [
		ask_others,
	],
	metadata: {
		dropoff_id: 11001,
	},
}

const pass = {
	type: 'text',
	ctx,
	project: 'identity',
	pipe: [
		{ $$filterTextIsIn: ['บุญถาวร'] },
	],
	do: [
		{
			type: 'state',
			key: 'purchase_channel',
			paths: {
				value: [],
			},
		},
	],
	next: {
		to: nxt.ctx,
	},
}

const pass_others = {
	type: 'text',
	ctx: ctx_others,
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'purchase_channel',
			paths: {
				value: [],
			},
		},
		{
			type: 'context',
			ctx: {
				name: '_purge',
			},
		},
	],
	next: {
		to: nxt.ctx,
	},
}

const others = {
	type: 'text'	,
	sub: pass_others,
	pipe: [
		{ $$filterTextIsIn: ['Others'] },
	],
	do: [
		{
			type: 'nothing',
		},
	],
	next: {
		to: ctx_others,
	},
}

const flow = {
	name: 'purchase_channel',
	ctx,
	sub: {
		$$concatFirst: [
			others,
			pass,
		],
	},
	do: [ask, imagemap],
}

module.exports = {
	ctx,
	flow,
}
