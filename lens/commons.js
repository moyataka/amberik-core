const {
	lensPath,
	compose,
	head,
	tail,
	prop,
} = require('ramda')

//Check whether lens exists
const lensObjPath = (obj_lens) => (ls_path=[], full_path=[]) => {
	if (full_path.length === 0) {
		full_path = ls_path
	}

	if (ls_path.length === 0) {
		return lensPath(full_path)
	}

	const h = head(ls_path)
	const obj = prop(h)(obj_lens)

	if (obj) {
		return lensObjPath(obj)(tail(ls_path), full_path)
	}

	throw Error(`lens ${h} of path ${full_path} not found`)
}

module.exports = {
	makeRoot: (rootLens) => {
		return (_lens=lensPath([])) => compose(rootLens, _lens)
	},
	lensObjPath,
}
