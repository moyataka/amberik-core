const R = require('ramda')
const { pipe, of } = require('rxjs')
const { filter, map, tap } = require('rxjs/operators')
const selector = require('../../selector')

const makePipeExpire = (memoryKeyLens, inst_respond) => (ctx_name) => {
	const _runExpire = inst_respond.runOnExpire()

	return pipe(
		filter((event) => {
			const now = Date.now()
			const memory_key = R.view(memoryKeyLens)(event)
			const ctxs = selector.event.getContexts(memory_key)(event)
			const expire_timestamp = R.path([ctx_name, 'expired_timestamp'])(ctxs)
			const is_expired = expire_timestamp && (now > expire_timestamp)

			if (is_expired) {
				return true
			}

			return false
		}),
		map(R.applySpec({
			event: R.identity,
		})),
		map(R.applySpec({
			event: R.prop('event'),
			response: _runExpire,
		})),
	)
}

module.exports = {
	makePipeExpire,	
}
