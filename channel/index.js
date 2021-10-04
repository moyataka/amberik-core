const R = require('ramda')
const { forkJoin } = require('rxjs')
const { tap, filter, mergeMap, retryWhen } = require('rxjs/operators')
const parser = require('../parser')

const filterLineEmptyEvent = R.compose(
	R.ifElse(
		R.isEmpty,
		R.compose(
			R.F,
			R.tap(() => console.log('got empty events')),
		),
		R.T,
	),
	R.prop('events'),
)

const subscribeLine = (sub$, flow$, pusher, memo) => {
	return sub$.pipe(
			filter(filterLineEmptyEvent),
			mergeMap(parser.line$),
			mergeMap(flow$),
			mergeMap((data) => forkJoin([
				pusher.send$(data),
				memo.setMemory$(data),
			])),
			retryWhen(e => e.pipe(tap(console.error))),
		).subscribe()
}

module.exports = {
	subscribe: {
		line: subscribeLine,
	},
}