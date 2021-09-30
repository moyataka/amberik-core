const R = require('ramda')
const act = require('./act')

const withState = (callback) => (outp) => {
	const current_state = R.pathOr({}, ['state', 'value'])(outp)
	const f = callback(current_state) 
	return f(outp)
}

const withSwitch = (callback) => (outp) => {
	const current_switch = R.pathOr({}, ['state', 'switch'])(outp)
	const f = callback(current_switch) 
	return f(outp)
}

const withContexts = (callback) => (outp) => {
	const current_contexts = R.pathOr({}, ['state', 'contexts'])(outp)
	const f = callback(current_contexts) 
	return f(outp)
}

const withContext = (name) => (callback) => (outp) => {
	const target_context = R.pathOr({}, ['state', 'contexts', name])(outp)
	if (R.isEmpty(target_context)) {
		return outp
	}
	const f = callback(target_context) 
	return f(outp)
}

const quickReply = (action) => R.evolve({
	quick_replies: R.append(action),
})

const setQuickReplyContentType = R.assoc('content_type', 'quick_reply')

module.exports = {
	Raw: ({platform, msg}) => R.evolve({
		messages: R.append({ type: 'raw', platform, msg }),
	}),
	Text: ({text}) => R.evolve({
		messages: R.append({type: 'text', text }),
	}),
	Image: ({url}) => R.evolve({
		messages: R.append({ type: 'image', url }),
	}),
	ImageMap: ({
		url,
		alt_text='imagemap',
		width=1040,
		height=1040,
		actions=[],
		is_multiple_size=false,
	}) => R.evolve({
		messages: R.append({ 
			type: 'imagemap',
			url,
			width,
			height,
			alt_text,
			actions,
			is_multiple_size,
		}),
	}),
	/*
	Template: (name, data) => R.evolve({
			messages: R.append({ type: 'template', name, data }),
	}),
	*/
	QuickReplyText: R.compose(
		quickReply,
		act.Text,
		setQuickReplyContentType,
		R.pick(['label', 'text']),
	),
	QuickReplyDatePicker: R.compose(
		quickReply,
		act.DatePicker,
		setQuickReplyContentType,
		R.pick(['label', 'mode', 'data', 'initial']),
	),
	QuickReplyCamera: R.compose(
		quickReply,
		act.Camera,
		setQuickReplyContentType,
		R.pick(['label']),
	),
	QuickReplyCameraRoll: R.compose(
		quickReply,
		act.CameraRoll,
		setQuickReplyContentType,
		R.pick(['label']),
	),
	QuickReplyPostback: R.compose(
		quickReply,
		act.Postback,
		setQuickReplyContentType,
		R.pick(['label', 'data']),
	),
	/*
	WithState: withState,
	*/
	State: ({memory_key, key, value}) =>
		R.assocPath(['memory', memory_key, 'state', key], value),
	StateAll: ({memory_key, key, value}) =>
		R.assocPath(['memory', memory_key, 'state'], value),
	StateReset: ({memory_key}) =>
		R.assocPath(['memory', memory_key, 'state'], {}),
	Switch: ({memory_key, to}) =>
		R.assocPath(['memory', memory_key, 'switch', 'to'], to),
	Target: ({key, value}) =>
		R.assocPath(['target', key], value),
	/*
	StateDissoc: (key)  => R.dissocPath(['state', 'value', key]),
	StateAll: R.assocPath(['state', 'value']),
	StateClear: () => R.assocPath(['state', 'value'], {}),
	StateMerge: (state) => withState(
		(current_state) => R.assocPath(
			['state', 'value'],
			R.mergeDeepRight(current_state, state)
		)
	),
	WithSwitch: withSwitch,
	Switch: (target, at=[]) => R.evolve({
		state: R.assoc('switch', { target, at }),
	}),
	SwitchAll: R.assocPath(['state', 'switch']),
	SwitchLast: R.assocPath(['state', 'switch', 'last']),
	WithContexts: withContexts,
	WithContext: withContext,
	*/
	Context: ({memory_key, ctx={}}) => {
		if (!ctx.name) {
			return R.identity
		}
		const _lens = R.lensPath(['memory', memory_key, 'contexts', ctx.name])
		return R.set(_lens, ctx)
		/*
		return R.evolve({
			state: {
				contexts: R.compose(
					R.mergeRight({
						[ctx.name]: ctx,
					}),
				),
			},
		})
		*/
	},
	ContextAll: ({memory_key, ctxs={}}) => {
		const _lens = R.lensPath(['memory', memory_key, 'contexts'])
		return R.set(_lens, ctxs)
	},
	/*
	ContextAdd: (ctx) => R.evolve({
		state: {
			contexts: R.mergeRight({
				[ctx.name]: ctx,
			}),
		},
	}),
	ContextAll: R.assocPath(['state', 'contexts']),
	ContextClear: () => R.assocPath(['state', 'contexts'], {}),
	MessagesClear: () => R.assocPath(['messages'], []),
	Reset: R.assocPath(['state'], {}),
	*/
}
