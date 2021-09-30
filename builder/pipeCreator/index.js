const R = require('ramda')
const { pipe } = require('rxjs')
const { tap, map, filter } = require('rxjs/operators')
const pipeContext = require('./context')
const pipeExpire = require('./expire')
const selector = require('../../selector')

const byType = (d) => {
	const _type = d.type

	switch (_type) {
		case 'text':
			var pipe_startswith = pipe
			if (d.startswith) {
				pipe_startswith = pipe(
					filter(R.startsWith(d.startswith)),
					map(R.replace(d.startswith, '')),
				)
			}
			return pipe(
				filter(selector.event.getIsMessageText),
				map(selector.event.getMessageText),
				pipe_startswith,
			)
		case 'image':
			return pipe(
				filter(selector.event.getIsMessageImage),
				map(selector.event.getMessageImage),
			)
		case 'date':
			return pipe(
				filter(selector.event.getIsPostbackDate),
				map(selector.event.getPostbackDate),
			)
		case 'text_isin':
			const isin = d.isin
			return pipe(
				filter(selector.event.getIsMessageText),
				filter(R.compose(
					R.contains(R.__, isin),
					selector.event.getMessageText,
				)),
			)
		case 'postback':
			return pipe(
				filter(selector.event.getIsPostback),
				map(selector.event.getPostbackData),
			)
		case 'follow':
			return pipe(
				filter(selector.event.getIsTypeFollow),
				map(selector.event.getType),
			)
		case 'unfollow':
			return pipe(
				filter(selector.event.getIsTypeUnfollow),
				map(selector.event.getType),
			)
		case 'container':
			return pipe(filter(() => (false)))
		case 'multicast':
			return pipe(
				filter(selector.event.getIsMulticast),
				map(selector.event.getMulticast),
			)
		default:
			//need to use reject some types because filter will effect to $$spec
			return pipe(
				filter(R.compose(R.not, R.equals('multicast'), selector.event.getType)),
			)
	}
}

const byKind = (d) => {
	const _kind = d.kind

	switch (_kind) {
		case 'user':
			return pipe(
				filter(R.compose(R.not, selector.event.getIsSourceTypeGroup)),
			)
		case 'group':
			return pipe(
				filter(selector.event.getIsSourceTypeGroup),
			)
		default:
			return pipe()
	}
}

module.exports = {
	byType,
	byKind,
	...pipeContext,
	...pipeExpire,
}