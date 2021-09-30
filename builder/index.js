const axios = require('axios')
const R = require('ramda')
const {
	of,
	from,
	concat,
	merge,
	pipe,
	forkJoin,
	timer,
	EMPTY
} = require('rxjs')
const {
	delay,
	filter,
	tap,
	mergeMap,
	map,
	take,
	takeUntil,
	timeoutWith,
	catchError,
	toPromise,
} = require('rxjs/operators')
const { 
	extractKeyValue,
	makeGetFunc,
	makeFuncParser,
	getMemoryKeyLens,
} = require('./commons')
const Responder = require('./responder')
const selector = require('../selector')
const lens = require('../lens')
const pipeCreator = require('./pipeCreator')
const flowCreator = require('./flowCreator')
const dfunc = require('./dfunc')
const dops = require('./dops')
const streams = require('./streams')

const concatFirst = (...ofs) => pipe(
	mergeMap((e) => concat(...ofs.map(f => f(e)))),
	take(1),
)

const mergeFirst = (...ofs) => pipe(
	mergeMap((e) => merge(...ofs.map(f => f(e)))),
	take(1),
)

const convergeToEventResponse = (responseRunner) => 
	(event) => R.compose(
		R.converge(
			R.assoc('response'),
			[
				responseRunner,
				R.identity,
			]
		),
		R.assoc('event', event),
		R.objOf('project'),
	)

const createNextOf$ = ({op_filter, do$}) => {
	const _pipe = pipe(
		op_filter,
		mergeMap((data) => {
			return do$.pipe(
				map((_do) => {
					const response = R.prop('response')(data)

					return {
						event: R.prop('event')(data),
						response: _do(data)(response),
					}
				})
			)
		}),
	)

	return (data) => of(data).pipe(_pipe)
}

const createNextTo$ = (inst_respond) => 
	({to, addon_contexts}) => {
		const _do = to['do'] || []
		const _step = _do.map(inst_respond.parse)

		return of(inst_respond.runOnNext(to, _step, addon_contexts))
	}

const applySingleNextFromTo = R.applySpec({
	type: R.always('concat_first'),
	targets: R.compose(
		R.assocPath([0], R.__, []),
		R.applySpec({
			filter: R.always('$T'),
			to: R.prop('to'),
			addon_contexts: R.propOr([], 'addon_contexts'),
		})
	),
})

const branchSingleNext = R.ifElse(
	R.compose(
		R.isEmpty,
		R.propOr({}, 'to'),
	),
	R.identity,
	applySingleNextFromTo,		
)

const createPipeNext = (
	memoryKeyLens,
	d_next={},
	ctx={},
	opsBuilder,
	func_parser,
	inst_respond,
) => {
	const _spec = R.applySpec({
		op_filter: R.compose(
			filter,
			func_parser,
			R.prop('filter'),
		),
		do$: R.compose(
			createNextTo$(inst_respond),
			R.pick(['to', 'addon_contexts']),
		),
	})

	const _fNext = R.compose(
		R.ifElse(
			R.isEmpty,
			R.always([]),
			R.identity,
		),
		R.map(_spec),
		R.pathOr({}, ['targets']),
		branchSingleNext,
	)
	const d_ops = _fNext(d_next)

	const _ofs = d_ops.map(createNextOf$)
	if (_ofs.length === 0) {
		return pipe
	}
	const disabled_switch = d_next.disabled_switch || false

	return pipe(
		mergeMap((data) => {
			const memory_key = R.view(memoryKeyLens, data.event)
			const lensSwt = R.compose(
				lens.eventMemory,
				R.lensPath([memory_key, 'switch', 'to']),
			)
			const swt_to = R.view(lensSwt)(data)

			if ((swt_to) && (!disabled_switch)) {
				const swt_of = R.compose(
					R.map(createNextOf$),
					_fNext,
					R.assoc('to', R.__, {}),
				)(swt_to)

				return of(data)
					.pipe(
						map(R.dissocPath([
							'response',
							'memory',
							memory_key,
							'switch',
						])),
						concatFirst(...swt_of)
					)
			}

			return of(data).pipe(concatFirst(..._ofs))
		}),
		map((data) => {
			const memory_key = R.view(memoryKeyLens, data.event)

			return R.dissocPath([
				'response',
				'memory',
				memory_key,
				'contexts',
				ctx.name
			])(data)
		}),
	)
}

const createFilterContext = (memoryKeyLens) => (_ctx) => 
	filter((event) => {
		const is_empty_flow_ctx = R.isNil(_ctx)
		if (is_empty_flow_ctx) {
			return true
		}

		const memory_key = R.view(memoryKeyLens, event)
		const state_ctxs = selector.event.getContexts(memory_key)(event)
		const is_empty_state_ctx = R.isEmpty(state_ctxs)

		const flow_ctx_name = R.prop('name')(_ctx)
		const _res = R.prop(flow_ctx_name)(state_ctxs)

		return R.not(R.isNil(_res))
	})

const createSelfFlow$ = (
	d_flow,
	inst_respond,
	opsBuilder,
	func_parser,
) => {
	//container flow will not pipe and do this will help to when use with Higher order flow for logging, expiring or interest only sub flows
	if (!d_flow.do && d_flow.type !== 'container') {
		throw new Error(`flow ${d_flow.name} need do or set type to container`)
	}

	const _pipe = d_flow.pipe || []
	const ls_do = d_flow.do || []
	const _next = d_flow.next || {}
	const _ctx = d_flow.ctx || {}

	const responseStep = R.map(inst_respond.parse)(ls_do)

	const ls_ops = _pipe.map(opsBuilder)
	const _pipeStep = pipe(...ls_ops)

	const memoryKeyLens = getMemoryKeyLens(d_flow)

	const _pipeNext = createPipeNext(
		memoryKeyLens,
		_next,
		_ctx,
		opsBuilder,
		func_parser,
		inst_respond,
	)
	const _runInit = inst_respond.runOnInit(responseStep)
	const pipeByType = pipeCreator.byType(d_flow)
	const pipeByKind = pipeCreator.byKind(d_flow)
	const _convergeWithEvent = convergeToEventResponse(_runInit)

	return (event) => 
		of(event)
			.pipe(
				pipeByKind,
				pipeByType,
				_pipeStep,
				filter(R.compose(R.not, R.isNil)),
				map(_convergeWithEvent(event)),
				_pipeNext,
			)
}

const makeOpsBuilder = (
	d_flow,
	d_ops,
	func_parser,
) => {
	const _ops_builder = (d) => {
		const _createStream$ = streams.create$(_ops_builder)
		const { key, value } = extractKeyValue(d)
		const is_not_ops = R.compose(
			R.not,
			R.startsWith('$$'),
		)(key)

		if (is_not_ops) {
			throw new Error(`Ops should start with $$`)
		}

		if (key === '$$useStream') {
			return mergeMap(_createStream$(value))
		}

		if (key === '$$forkStream') {
			const stm = _createStream$(value)
			return tap((x) => stm(x).toPromise())
		}

		if (key == '$$pipe') {
			return pipe(...value.map(_ops_builder))
		}

		if (key === '$$match') {
			return mergeMap((x) => {
				const _path = value['path']
				const value_match = R.path(_path)(x)
				const match_pipe = R.path(['pipes', value_match])(value)

				if (match_pipe) {
					return of(x).pipe(...match_pipe.map(_ops_builder))
				}

				const default_pipe = R.path(['default'])(value)
				if (default_pipe) {
					return of(x).pipe(...default_pipe.map(_ops_builder))
				}

				return of(x)
			})
		}

		//spec not nested structure, if nested use applySpec after
		if (key === '$$spec') {
			const d_stream = R.map((v) => {
				return _createStream$(v)
			})(value)

			return mergeMap(
				(data) => forkJoin(R.map((f) => f(data), d_stream))
					.pipe(
						filter(R.compose(
							R.not,
							R.any(R.equals(NaN)),
							R.values
						)),
					),
			)
		}

			/*

		if (key === '$$concatFirst') {
			return concatFirst(...value.map(streamBuilder$))
		}
		*/

		const ops = makeGetFunc(d_ops)(key)(d_flow)
		const parse_value = value.map(func_parser)

		return R.apply(ops, parse_value)
	}
	
	return _ops_builder
}

const makeFlowBuilder$ = (
	d_ops,
	func_parser,
	d_templates,
) => {
	const _flowBuilder$ = (d) => {
		const opsBuilder = makeOpsBuilder(d, d_ops, func_parser)
		const memoryKeyLens = getMemoryKeyLens(d)
		const inst_respond = Responder(memoryKeyLens, func_parser, d_templates)

		if (d['$$concatFirst']) {
			const _pipe = concatFirst(...d['$$concatFirst'].map(_flowBuilder$))
			return (event) => of(event).pipe(_pipe)
		}

		if (d['$$mergeFirst']) {
			const _pipe = mergeFirst(...d['$$mergeFirst'].map(_flowBuilder$))
			return (event) => of(event).pipe(_pipe)
		}

		const self_flow$ = createSelfFlow$(
			d,
			inst_respond,
			opsBuilder,
			func_parser,
		)

		const _ctx = d.ctx
		const filterContext = createFilterContext(memoryKeyLens)(_ctx)
		const pipeResolveContext = pipeCreator.resolveContext(memoryKeyLens)(_ctx)

		var ls_flow = []

		if (d.ctx) {
			const expire_flow$ = flowCreator.expire.create$(
				d,
				inst_respond,
				memoryKeyLens,
			)
			ls_flow.push(expire_flow$)
		}

		if (d.sub) {
			const sub_flow$ = _flowBuilder$(d.sub)
			ls_flow.push(sub_flow$)
		}

		ls_flow.push(self_flow$)

		var pipeFallback = pipe
		if (d.fallback) {
			const _pipe = d.fallback.pipe || []
			const ls_ops = _pipe.map(opsBuilder)
			pipeFallback = pipe(...ls_ops)
		}

		var pipeFallbackExpired = pipe
		if (d.expired) {
			const _step_expired = d.expired.map(inst_respond.parse)

			pipeFallbackExpired = map((data) => {
				const f = inst_respond.runOnFallbackExpire(_step_expired)(data)
				return R.evolve({
					response: f,
				})(data)
			})
		}

		const n_timeout = d.timeout || 30000
		var interim$ = () => EMPTY
		if (d.interim) {
			interim$ = _flowBuilder$(d.interim)
		}

		var pipeGate = pipe
		if (d.gate) {
			const gate_name = d.gate.name
			const gate_pipe = d.gate.pipe || []

			if (!gate_name) {
				throw new Error('no gate name')
			}

			const _step_gate = gate_pipe.map(opsBuilder)
			pipeGate = mergeMap((event) => {
				return of(event).pipe(
					..._step_gate,
					map(R.defaultTo({})),
					map(R.assocPath([
						'gate', gate_name 
					], R.__, event)),
				)
			})
		}

		var pipeError = () => pipe()
		if (d.error) {
			const d_converge_error = R.map(
				R.compose(
					convergeToEventResponse,
					inst_respond.runOnInit,
					R.map(inst_respond.parse),
				)
			)(d.error)
			const default_converge_error =  d_converge_error['_']

			if (!default_converge_error) {
				throw new Error('error handler should have default _')
			}

			pipeError = (event) => catchError((e) => {
				const { code } = e
				const _convergeErrorWithEvent = R.propOr(default_converge_error, code)(d_converge_error)
				console.error('errr', e)

				return of(event)
					.pipe(
						map(_convergeErrorWithEvent(event)),
					)
			})
		}

		return (event) => of(event)
			.pipe(
				filterContext,
				pipeGate,
				concatFirst(...ls_flow),
				pipeResolveContext,
				pipeFallbackExpired,
				pipeFallback,
				pipeError(event),
				timeoutWith(n_timeout, interim$(event)),
			)
	}

	return _flowBuilder$
}

const buildFlow$ = (
	flow_define,
	ls_template=[],
	extra_ops={},
	extra_func={},
) => {
	const d_ops = R.mergeRight(dops, extra_ops)
	const d_func = R.mergeRight(dfunc, extra_func)
	const func_parser = makeFuncParser(d_func)
	const d_templates = R.indexBy(R.prop('name'))(ls_template)

	const flowBuilder$ = makeFlowBuilder$(
		d_ops,
		func_parser,
		d_templates,
	)
	return flowBuilder$(flow_define)
}

const withEffect$ = (
	memo,
	getMemoryId=selector.event.getUserId,
) => (flw) => (event) => {
	const memory_id = getMemoryId(event)

	return from(
		memo.getMemory$(memory_id)
	).pipe(
		map(R.defaultTo({})),
		map((dms={}) =>{
			const metakeys = ['response_key']
			const metadata = R.pick(metakeys)(dms)

			return R.compose(
				//filter contexts where retain less than 1
				R.set(lens.event.memory.root(), R.__, event),
				R.mergeLeft(metadata),
				R.map(R.evolve({
					contexts: R.filter(R.where({
						retain: R.gt(R.__, 0)
					}))
				})),
				R.omit(metakeys),
			)(dms)
		}),
		map(R.set(lens.event.memoryId, memory_id)),
		mergeMap(flw),
		map(R.set(lens.responseMemoryId, memory_id)),
		//QUESTION: may global dcr context
	)
}

module.exports = {
	buildFlow$,
	withEffect$,
}
