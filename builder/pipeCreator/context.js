const R = require('ramda')
const { pipe } = require('rxjs')
const { map } = require('rxjs/operators')
const selector = require('../../selector')

const DEFAULT_MAX_RETAIN = 2
const hasContextName = (name) => R.compose(
	R.not,
	R.isNil,
	R.prop(name),
)

const makeProcessContexts = (cur_flow_ctx) => {
	const cur_name = R.propOr('_null', 'name')(cur_flow_ctx)
	const max_retain = R.propOr(DEFAULT_MAX_RETAIN, 'retain')(cur_flow_ctx)
	const eqName = R.eqBy(R.prop('name'))
	const getDiffCtxs = R.symmetricDifferenceWith(eqName)
	const dcr = R.evolve({
		[cur_name]: {
			retain: R.dec,
		}
	})
	const refreshContext = R.evolve({
		[cur_name]: {
			retain: R.always(max_retain),
		}
	})
	const purge = R.dissoc(cur_name)
	
	const getKeepCtxName = R.path(['_keep', 'ctx', 'name'])

	return (prev, nex) => {
		const has_keep = hasContextName('_keep')(nex)
		if (has_keep) {
			if (getKeepCtxName(nex) === cur_name) {
				return nex
			}
		}

		const has_purge = hasContextName('_purge')(nex)

		if (has_purge) {
			return purge(nex)
		}

		const has_expired = hasContextName('_expired')(nex)
		if (has_expired) {
			return purge(nex)
		}

		const diff_ctxs = getDiffCtxs(
			R.values(prev), 
			R.values(nex)
		)

		if (diff_ctxs.length == 0) {
			//protected multiple time dcr retain
			//each ctx can be only dcr once at most per event
			const prev_cur_retain = R.pathOr(0, [cur_name, 'retain'])(prev)
			const nex_cur_retain = R.pathOr(0, [cur_name, 'retain'])(nex)

			if (prev_cur_retain !== nex_cur_retain) {
				return nex
			}

			return dcr(nex)
		}

		return refreshContext(nex)
	}
}

const resolveContext = (memoryKeyLens) => (resolved_ctx) => {
	if (R.isNil(resolved_ctx)) {
		return pipe
	}

	const processContexts = makeProcessContexts(resolved_ctx)

	return pipe(
			map(({event, response}) => {
				const memory_key = R.view(memoryKeyLens)(event)
				const fallback_ctxs = selector.response.getContexts(memory_key)(response)
				const prev_state_ctxs = selector.event.getContexts(memory_key)(event)
				const res_ctxs = processContexts(prev_state_ctxs, fallback_ctxs)

				return {
					event,
					response: R.assocPath(['memory', memory_key, 'contexts'], res_ctxs)(response),
				}
			}),
		)
}

module.exports = {
	resolveContext,
}
