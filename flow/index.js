const R = require('ramda')
const { mergeMap, mapTo, map } = require('rxjs/operators')
const builder = require('../builder')
const selector = require('../selector')
const lens = require('../lens')
const lensEvent = require('../lens/event')
const { bot } = require('../configs')

const spec_dir = `../spec/${bot.spec_dir}`
const root_flow = require(`${spec_dir}`)
const templates = require(`${spec_dir}/templates`)

const flow_debugger = {
	name: 'debugger',
	pipe: [
		{ $$filterTextStartsWith: [ '/line uid' ] },
		{ $$mapToByEventSelector: ['getUserId'] },
	],
	project: 'identity',
	do: [
		{
			type: 'text',
			paths: {
				text: [],
			},
		},
	],
}

const genSharedMemoryId = (event) => {
	const is_group = selector.event.getIsSourceTypeGroup(event)
	const l = R.ifElse(
		() => is_group,
		() => lensEvent.sourceGroupId,
		() => lensEvent.sourceUserId,
	)(event)

	const _id = R.compose(
		R.ifElse(
			() => is_group,
			R.identity,
			R.flip(R.concat)('_shared'),
		),
		R.view(l),
	)(event)

	return _id
}

const flow = (memo) => builder.buildFlow$(
	{
		name: 'pre-root',
		sub: {
			$$concatFirst: [
				... ['dev', 'staging'].includes(bot.workflow) ? [flow_debugger] : [],
				root_flow,
			]
		},
		pipe: [
			{ $$block: [] }
		],
		do: [],
	},
	templates,
	{
		setSharedMemory: () => () => mergeMap(({event, state}) => {
			const _id = genSharedMemoryId(event)

		  const _state = R.compose(
				R.set(lens.responseMemoryId, _id),
				R.set(lens.responseMemory, state),
			)({})

			return memo.setMemory$(_state)
				.pipe(
					mapTo(state)
				)
		}),
		getSharedMemory: () => () => mergeMap((event) => {
			const _id = genSharedMemoryId(event)
			return memo.getMemory$(_id)
		}),
	},
	{
		genRemoteContent: (d) => {
			const _type = d['__component'].split('.')[1]
			switch (_type) {
				case 'text':
					return { type: _type, text: d.text }
				case 'imagemap':
					return {
						type: _type,
						url: d.image.url,
						actions: [
							...(d.url ? [{
								type: "uri",
								linkUri: d.url,
								area: {
									x: 0, y:0, height: 1040, width: 1040,
								}
							}] : [])
						]
					}
			}
			return d
		},
	},
)

module.exports = {
	initFlow$: (memo) => {
		return () => 
			builder.withEffect$(
				memo,
			)(flow(memo))
	}
}
