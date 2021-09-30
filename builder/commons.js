const R = require('ramda')

const isObjFunc = R.converge(
	R.and,
	[R.is(Object), R.compose(R.startsWith('$'), R.nth(0), R.keys)]
)

const makeGetFunc = (d_list) => R.compose(
	R.prop(R.__, d_list),
	R.replace(/\$/g, ''),
)

const extractKeyValue = R.applySpec({
	key: R.compose(R.nth(0), R.keys),
	value: R.compose(R.nth(0), R.values),
})

const makeFuncParser = (d_func) => {
	const get_f = makeGetFunc(d_func)
	const self = (x) => {
		const is_func_string = R.startsWith('$')(x)

		if (is_func_string) {
			return get_f(x)
		}

		if (R.is(Array, x)) {
			return x.map(self)
		}

		try {
			const is_obj_func = isObjFunc(x)
			if (is_obj_func) {
				const { key, value } = extractKeyValue(x)
				const func = makeGetFunc(d_func)(key)
				const parse_value = value.map(self)
				return R.apply(func, parse_value)
			}
		} catch {}

		if (R.is(Object, x)) {
			return R.map((v) => {
				if (R.is(Array, v)) {
					return v.map(self)
					/*
					return v.map(self)[0] 
					- cannot use index 0 because error when input is JSON
					- need to change all evolve and applySpec from recursive array to recursive obj func
					Example:
					from

					{ $applySpec: [{
						$profile: [{$always: ['name']}],
					}]}

					to

					{ $applySpec: {
						$profile: { $always: ['name'] },
					}}
					*/
				}
				if (R.is(Object, v)) {
					return self(v)
				}

				return v
			})(x)
		}

		return x
	}

	return self
}

const getMemoryKeyLens = R.compose(
	R.cond([
		[ R.equals('channel'),
			() => {
				const _enhance = (f) => R.ifElse(
					R.compose(
						R.equals('user'),
						R.path(['source', 'type']),
					),
					f(['source', 'id']),
					f(['source', 'group', 'id'])
				)

				return R.lens(
					_enhance(R.path),
					_enhance(R.assoc),
				)
			}],
		[ R.T, () => R.lensPath(['source', 'id'])],
	]),
	R.prop('memo'),
)

module.exports = {
	extractKeyValue,
	makeGetFunc,
	makeFuncParser,
	getMemoryKeyLens,
	isObjFunc,
}
