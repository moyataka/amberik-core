const content_ids = {
	'content_001': 'xxx',
}

const stm_remote_contents = {
	pipe: [
		{
			$$useStream: {
				type: 'get',
				url: 'https://alc.rabbitdigital.group/elx/strapi/contents',
			},
		},
		{ $$mapPipe: [
			{ $mergeArrayObjects: ['content_id', 'contents'] },
			{ $map: [{
				$map: [
					'$genRemoteContent',
				]
			}]},
		] },
	]
}

const flow = {
	name: 'contents',
	type: 'multicast',
	pipe: [
		{ $$spec: {
			contents: stm_remote_contents,
			data: { pipe: [] },
		}},
		{ $$filterPipe: [
				{ $juxt: [
					[
						{ $path: [['data', 'content_id']]},
						{ $pipe: [
							{ $path: [['contents']] },
							'$keys',
						]},
					]
				]},
				{ $apply: ['$includes'] },
		]},
	],
	project: 'identity',
	do: [
		{
			type: 'mapper',
			paths: {
				key: ['data', 'content_id'],
				dict: ['contents'],
			}
		},
		/*optional pusher will also check with event type whether multicast, push
		{
			type: 'target',
			key: 'type',
			value: 'multicast',
		},
		*/
		{
			type: 'target',
			key: 'line_uids',
			paths: {
				value: ['data', 'data'],
			},
			formatters: {
				value: {
					$map: [{$prop: ['line_uid']}]
				}
			},
		}
	]
}

module.exports = {
	flow,
}
