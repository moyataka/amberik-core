const R = require('ramda')
const { of } = require('rxjs')
const { map, tap } = require('rxjs/operators')
const lensMulticast = require('../lens/push/multicast')
const lens = require('../lens')

const mapByLens = (lens_from, lens_to) =>
	(x) => {
		return R.set(
			lens_to,
			R.view(lens_from)(x)
		)({})
	}

const setEvent = R.compose(
	R.reduce(R.mergeDeepRight, {}),
	R.juxt([
		mapByLens(lensMulticast['platform'], lens.event.platform),
		mapByLens(lensMulticast['type'], lens.event.type),
		mapByLens(lensMulticast['timestamp'], lens.event.timestamp),
		mapByLens(lensMulticast['sourceId'], lens.event.sourceUserId),
		mapByLens(lensMulticast['sourceType'], lens.event.sourceType),
		mapByLens(lensMulticast['multicast'], lens.event.multicast.root()),
	]),
)

const createEvent$ = (data) => {
	return of(data).pipe(
		map(setEvent),
	)
}

module.exports = createEvent$

