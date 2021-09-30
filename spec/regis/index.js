const bundle = {
	$$mergeFirst: [
		require('./FullName').flow,
		require('./MobileNumber').flow,
		require('./Email').flow,
		require('./Birthdate').flow,
		require('./Consent').flow,
		require('./ConfirmRegisProfile').flow,
		require('./SerialNumber').flow,
		require('./ProductNumber').flow,
		require('./PurchaseDate').flow,
		require('./PurchaseChannel').flow,
		require('./PurchaseReceipt').flow,
		require('./ConfirmRegisProduct').flow,
	],
}

const postback_data = {
	name: 'postback_data',
	type: 'postback',
	pipe: [
		{ $$trace: ['postback flow input: ']},
	],
	project: 'identity',
	do: [
		{
			type: 'text',
			text: 'got postback data as following',
		},
		{
			type: 'text',
			paths: {
				text: [],
			},
		},
	],
}

	/*
const stm_promise = {
	pipe: [
		{ $$trace: ['stm'] },
	]
}

const test_promise = {
	pipe: [
		{ $$trace: ['test'] },
		{ $$forkStream: stm_promise },
	],
	do: [{ type: 'text', text: 'promise' }],
}
*/

const map_to_response_memory = { 
	$pipe: [
		{ $path: [['response', 'memory']] },
		{ $juxt: [[ 
			{ $prop: ['response_key']},
			{ $identity: []},
		]] },
		{ $apply: [ '$prop' ] },
	]
}

const stm_fork_on_fallback = {
	pipe: [
		{ $$map: [map_to_response_memory] },
		{ $$filterPipe: [
			'$isNil',
			'$not',
		]},
		{ $$map: [{
			$applySpec: [{
				line_uid: [{ $path: [['state', 'line_uid']] }],
				tx_id: [{ $path: [['state', 'tx_id']] }],
				data: [ { $pipe: [
					{ $prop: ['state'] },
					{ $dissoc: ['tx_id'] },
					{ $dissoc: ['line_uid'] },
					'$jsonStringify',
				]}],
				dropoff_id: [{
					$pipe: [
						{ $prop: ['contexts'] },
						'$values',
						{
							$map: [{ 
								$applySpec: [{
									timestamp: [{ $prop: ['expired_timestamp'] }],
									dropoff_id: [{ $path: [['metadata', 'dropoff_id']] }],
							}]}],
						},
						{ $sortBy: [{ $prop: ['timestamp'] }] },
						{ $reject: [ '$isNil' ]},
						'$last',
						{ $prop: ['dropoff_id'] },
						'$toString',
					],
				}]
			}],
		}]},
		{ $$filterPipe: [
				{ $prop: ['dropoff_id'] },
				'$isNil',
				'$not',
		]},
		//{ $$trace: ['trace_on_fork_fallback'] },
	]
}

const with_expired = {
	name: 'with-expired',
	sub: {
		$$concatFirst: [
			bundle,
			require('./Greeting').flow,
		],
	},
	do: [ {type: 'nothing'}],
	expired: [
		{
			type: 'text',
			text: 'Sorry, You not did before timeout',
		},
		{
			type: 'context',
			ctx: {
				name: 'timeout',
				metadata: {
					dropoff_id: 90000,
				},
			},
		}
	],
}

const root = {
	name: 'root',
	sub: {
		$$concatFirst: [
			//test_promise,
			require('./multicast').flow,
			postback_data,
			with_expired,
		],
	},
	do: [
		{
			type: 'text',
			text: 'Sorry I do not understand.',
		},
	],
	fallback: {
		pipe: [
			{ $$forkStream: stm_fork_on_fallback },
		],
		do: [{ type: 'nothing' }],
	},
}

module.exports = root
