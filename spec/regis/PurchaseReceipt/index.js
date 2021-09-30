const backend = require('../backend')
const nxt = require('../ConfirmRegisProduct')

const ask = {
	type: 'text',
	text: "your purchase receipt",
}

const ctx = {
	name: 'awaiting_purchase_receipt',
	do: [ask],	
	metadata: {
		dropoff_id: 11100,
	},
}

const stm_filename = {
	name: 'get_image_name',
	pipe: [
		{ $$mapToStateKey: ['tx_id'] },
		{ $$mapPipe: [
			{ $juxt: [[
				{ $alwaysToday: [] },
				{ $concat: ['_'] },
			]] },
			{ $apply: ['$concat'] },
			{ $juxt: [[
				{ $flipConcat: ['_'] },
				{ $call: ['$timestamp'] },
			]] },
			{ $apply: ['$concat'] },
			{ $flipConcat: ['.jpg']},
		]},
	],
}

const stm_create_img_options = {
	name: 'download_image',
	pipe: [
		{ $$mapToByEventSelector: ['getMessageImage']},
		{ $$map: [{
			$applySpec: [{
				token: [{ $always: [process.env.LINE_CHANNEL_ACCESS_TOKEN] }],
				provider: [{ $prop: ['provider']}],
				url: [{ $prop: ['url']}],
			}],
		}]},
	],
}

const gate = {
	name: 'upload_image_and_check_receipt',
	pipe: [
		{ $$filterByEventSelector: ['getIsMessageImage']},
		{ $$spec: {
			filename: stm_filename,
			line: stm_create_img_options,
		}},
		{ $$pipe: backend.image_upload },
		{ $$spec: {
			filename: { pipe: [
				{ $$map: [{ $prop: ['filename']}]},
			]}
		}},
	],
}

const pass = {
	ctx,
	pipe: [
		{ $$map: [{$path: [['gate', gate.name]]}]},
		{ $$filterPipe: [
			{ $prop: ['is_receipt' ]},
			{ $equals: [true] },
		]},
	],
	project: 'identity',
	do: [
		{
			type: 'state',
			key: 'purchase_receipt',
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
	name: 'purchase_receipt',
	ctx,
	gate,
	sub: pass,
	do: [ask],
}

module.exports = {
	ctx,
	flow,
}
