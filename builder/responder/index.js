const R = require('ramda')
const { map } = require('rxjs/operators')
const msg = require('./msg')
const ctx = require('./ctx')
const state = require('./state')
const selector = require('../../selector')
const lens = require('../../lens')
const { extractKeyValue, makeGetFunc } = require('../commons')

const enhanceMsg = (f) => (extend={}) => 
	(args) => f({ ...extend, ...args})

const default_respond_func = {
	text: () => msg.Text,	
	image: () => msg.Image,
	imagemap: () => msg.ImageMap,
	raw: () => msg.Raw,
	quick_reply_text: () => msg.QuickReplyText,
	quick_reply_datepicker: () => msg.QuickReplyDatePicker,
	quick_reply_camera: () => msg.QuickReplyCamera,
	quick_reply_camera_roll: () => msg.QuickReplyCameraRoll,
	quick_reply_postback: () => msg.QuickReplyPostback,
	context: enhanceMsg(msg.Context),
	context_all: enhanceMsg(msg.ContextAll),
	state: enhanceMsg(msg.State),
	state_all: enhanceMsg(msg.StateAll),
	state_reset: enhanceMsg(msg.StateReset),
	target: enhanceMsg(msg.Target),
	switch: enhanceMsg(msg.Switch),
	nothing: () => () => R.identity,
}

const default_response = {
	target: {},
	messages: [],
	quick_replies: [],
}

const d_args = {
	text: ['text'],
	image: ['url'],
	imagemap: ['url', 'actions'],
	raw: ['platform', 'msg'],
	quick_reply_text: ['label', 'text'],
	quick_reply_datepicker: ['label', 'data', 'mode', 'initial'],
	quick_reply_camera: ['label'],
	quick_reply_camera_roll: ['label'],
	quick_reply_postback: ['label', 'data'],
	context: ['ctx'],
	context_all: ['memory_key', 'ctxs'],
	state: ['key', 'value'],
	state_all: [],
	state_reset: [],
	switch: ['to'],
	target: ['key', 'value'],
	mapper: ['dict', 'key']
}

const parseFormatters = (func_parser) =>
	R.compose(
		R.map(func_parser),
		R.propOr({}, 'formatters'),
	)

const DEFAULT_MAX_RETAIN = 2
const DEFAULT_TIMEOUT = 60*60*1
const _makeSetContext = (d_ctx) => (memory_key) => {
	const ctx_name = d_ctx['name']
	const ctx_retain = d_ctx['retain'] || DEFAULT_MAX_RETAIN
	const ctx_timeout = d_ctx['timeout'] || DEFAULT_TIMEOUT
	const ctx_metadata = d_ctx['metadata'] || {}

	return () => default_respond_func['context']({memory_key})({
		ctx: ctx.Context({
			name: ctx_name,
			retain: ctx_retain,
			timeout: ctx_timeout,
			metadata: ctx_metadata,
		})
	})
}

const setExpiredContext = (memory_key) => {
	return () => default_respond_func['context']({memory_key})({
		ctx: ctx.Context({ name: '_expired' })
	})
}

const makePathArgs = R.compose(
	R.map(R.path),
	R.map(R.concat(['project'])),
	R.propOr({}, 'paths'),
)

const makeCreateFromMemoryPaths = (d) => (memory_key) => R.compose(
	R.map(R.path),
	R.map(R.concat(['response', 'memory', memory_key])),
	R.propOr({}, 'memory_paths'),
)(d)

const mergePathAndMemory = (
	path_args,
	_createFromMemoryPaths,
	memoryKeyLens,
) =>
	R.compose(
		R.apply(R.mergeRight),
		R.juxt([
			R.compose(
				R.reject(R.isNil),
				R.applySpec(path_args),
			),
			(data) => {
				const memory_key = R.view(memoryKeyLens)(data)
				return R.compose(
					R.reject(R.isNil),
					R.applySpec(_createFromMemoryPaths(memory_key)),
				)(data)
			},
		]),
	)

const Responder = (_memoryKeyLens, func_parser, d_templates={}) => {
	const getRespondFunc = makeGetFunc(default_respond_func)
	const memoryKeyLens = R.compose(
		R.lensPath(['event']),
		_memoryKeyLens
	)

	const parseTemplate = (d) => {
		const templateObj = R.compose(
			R.prop(R.__, d_templates),
			R.prop('name'),
		)(d)

		const path_args = makePathArgs(d)
		const _createFromMemoryPaths = makeCreateFromMemoryPaths(d)

		const default_args = R.pick(
			R.propOr([], d['type'])(d_args),
		)(d)

		const default_values = R.propOr({}, 'defaults')(d)
		const formatters = parseFormatters(func_parser)(d)
		const platform = d['platform'] || 'line'

		return (data) => R.compose(
			(x) => msg.Raw({platform, msg: x}),
			templateObj.create,
			R.evolve(formatters),
			R.mergeRight(default_values),
			R.mergeRight(default_args),
			R.mergeRight(R.propOr({}, 'project', data)),
			mergePathAndMemory(
				path_args,
				_createFromMemoryPaths,
				memoryKeyLens,
			),
		)(data)
	}
	
	const parseMapper = (d) => {
		const path_args = makePathArgs(d)

		const _createFromMemoryPaths = makeCreateFromMemoryPaths(d)

		const default_args = R.pick(
			R.propOr([], d['type'])(d_args),
		)(d)

		const default_values = R.propOr({}, 'defaults')(d)

		const formatters = parseFormatters(func_parser)(d)

		return (data) => R.compose(
			({key, dict}) => {
				const sub_dos = R.prop(key)(dict)
				if (!sub_dos) {
					throw new Error(`${key} not found in dict`)
				}

				const fs = R.map(parse)(sub_dos)
				return R.juxt(fs)(data)
			},
			R.evolve(formatters),
			R.mergeRight(default_values),
			R.mergeRight(default_args),
			mergePathAndMemory(
				path_args,
				_createFromMemoryPaths,
				memoryKeyLens,
			),
		)(data)
	}

	const parseCond = (_parse) => (d) => {
		const _cond = func_parser(d['cond'])
		const applies = R.juxt(d['do'].map(parse))
		const _else = d['default'] || [{ type: 'nothing' }]
		const else_applies = R.juxt(_else.map(parse))

		return R.ifElse(
			R.compose(_cond, R.prop('project')),
			applies,
			else_applies,
		)
	}
	
	const parse = (d) => {
		if (d['type'] === 'template') {
			return parseTemplate(d)
		}

		if (d['type'] === 'mapper') {
			return parseMapper(d)
		}

		if (d['type'] === 'cond') {
			return parseCond(parse)(d)
		}

		const { key, value } = extractKeyValue(d)
		const get_f = getRespondFunc(d['type'])

		const path_args = makePathArgs(d)
		const _createFromMemoryPaths = makeCreateFromMemoryPaths(d)
		const formatters = parseFormatters(func_parser)(d)
		const default_args = R.pick(
			R.propOr([], d['type'])(d_args),
		)(d)

		const default_values = R.propOr({}, 'defaults')(d)

		return (data) =>
			R.compose(
				get_f({
					memory_key: R.view(memoryKeyLens)(data),
				}),
				R.evolve(formatters),
				R.mergeRight(default_values),
				R.mergeRight(default_args),
				mergePathAndMemory(
					path_args,
					_createFromMemoryPaths,
					memoryKeyLens,
				),
			)(data)
	}

	const run = (ls=[]) => (data) => {
		//runOnInit: data => { event, project }
		//runOnNext: data => { event, project, response }
		//runOnExpire: data => { event }
		//runOnFallbackExpire: data => { event, response }

		//flatten because do: type: mapper
		const apply_ls = R.flatten(ls.map((f) => f(data)))

		if (ls.length === 0) {
			throw new Error('no responder')
		}
		return R.pipe(
			...apply_ls,
		)
	}

	const runOnNext = (d_next_ctx, step=[], addon_contexts=[]) => {
		const setContext = _makeSetContext(d_next_ctx)
		const setAddonContexts = R.map(_makeSetContext, addon_contexts)

		return (data) => {
			const memory_key = R.view(memoryKeyLens)(data)
			const ls_set_addon = R.map((f) => f(memory_key), setAddonContexts)

			const _step = [
				setContext(memory_key),
				...ls_set_addon,
				...step, 
			]

			return run(_step)(data)
		}
	}

	const runOnFallbackExpire = (_step=[]) => {
		return (data) => {
			const memory_key = R.view(memoryKeyLens)(data)
			const memory = R.view(lens.responseMemory)(data)
			const ctxs = R.pathOr({}, [memory_key, 'contexts'])(memory)

			if (R.prop('_expired')(ctxs)) {
				return run(_step)(data)
			}

			return R.identity
		}
	}

	const runOnExpire = () => {
		return (data) => {
			const memory_key = R.view(memoryKeyLens)(data)
			const memory = R.compose(
				R.assoc('response_key', memory_key),
				R.view(lens.eventMemory),
			)(data)
			const response = R.set(lens.memory.root(), memory)(default_response)

			return run([
				setExpiredContext(memory_key),
			])(data)(response)
		}
	}

	const runOnInit = (ls) => {
		return (data) => {
			const memory_key = R.view(memoryKeyLens)(data)
			const memory = R.compose(
				R.assoc('response_key', memory_key),
				R.view(lens.eventMemory),
			)(data)
			const response = R.set(lens.memory.root(), memory)(default_response)

			return run(ls)(data)(response)
		}
	}
		

	return {
		parse,
		run,
		runOnInit,
		runOnNext,
		runOnExpire,
		runOnFallbackExpire,
	}
}

module.exports = Responder
