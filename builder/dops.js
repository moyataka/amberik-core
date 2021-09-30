const R = require('ramda')
const dfunc = require('./dfunc')
const { pipe } = require('rxjs')
const { tap, map, filter, delay } = require('rxjs/operators')
const { getMemoryKeyLens } = require('./commons')
const selector = require('../selector')

module.exports = {
	tap: () => tap,
	map: () => map,
	block: () => () => filter(() => (false)),
	trace: () => (prefix='') => tap((x) => console.log(prefix, x)),
	filter: () => filter,
	mapPath: () => (xs) => map(R.path(xs)),
	mapPipe: () => 
		(...list_f) => map(
			R.pipe(...list_f)
		),
	filterPipe: () =>
		(...list_f) => filter(
			R.pipe(...list_f)
		),
	filterTextStartsWith: () => 
		(txt) => filter(
			R.pipe(
				selector.event.getMessageText,
				R.defaultTo(''),
				R.startsWith(txt),
			)	
		),
	filterTextIsIn: () =>
		(...txts) => filter(R.contains(R.__, txts)),
	filterTextContain: () =>
		(txt) => filter(R.contains(txt)),
	filterByEventSelector: () =>
		(sel_name) => {
			if (!R.prop(sel_name)(selector.event)) {
				throw new Error(`not found event selector ${sel_name} `)
			}

			return filter(selector.event[sel_name])
		},
	filterRetainRemainEqual: (d_flow) => {
		const mKeyLens = getMemoryKeyLens(d_flow)
		const { name } = d_flow.ctx

		return (target_retain) => filter((event) => {
			const memory_key = R.view(mKeyLens)(event)
			const retain = R.path([
				'memory', memory_key, 'contexts', name, 'retain'
			])(event)

			if (target_retain === retain) {
				return true
			}

			return false
		})
	},
	mapToByEventSelector: () =>
		(sel_name) => {
			if (!R.prop(sel_name)(selector.event)) {
				throw new Error(`not found event selector ${sel_name} `)
			}

			return map(selector.event[sel_name])
		},
	mapToEventMessageText: () =>
		() => map(selector.event.getMessageText),
	mapToEventPostback: () =>
		() => map(selector.event.getPostback),
	mapToStateKey: (d_flow) => {
		const mKeyLens = getMemoryKeyLens(d_flow)

		return (key) => pipe(
			map((event) => {
				const memory_key = R.view(mKeyLens)(event)
				const value = R.path([
					'memory',
					memory_key,
					'state',
					key
				])(event)

				return value
			}),
			filter(R.compose(R.not, R.isNil)),
		)
	},
	mapToMemory: (d_flow) => {
		const mKeyLens = getMemoryKeyLens(d_flow)

		return () => map((event) => {
			const memory_key = R.view(mKeyLens)(event)
			const value = R.path([
				'memory',
				memory_key,
			])(event)

			return value || {}
		})
	},
	replaceText: () =>
		(_from, _to) => map(
			dfunc.replace(_from, _to),
		),
	delay: () => delay,
	assocTimestamp: () => 
		(field_name='timestamp') => map((data) => {
			const timestamp = new Date(Date.now()).toISOString()
			return R.assoc(field_name, timestamp)(data)
		}),
	assocTimestampIfNil: () =>
		(field_name='timestamp') => map((data) => {
			if (!R.prop(data, field_name)) {
				const timestamp = new Date(Date.now()).toISOString()
				return R.assoc(field_name, timestamp)(data)
			}

			return data
		}),
}
