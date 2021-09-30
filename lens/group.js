const {
	lensPath,
	compose,
} = require('ramda')
const { makeRoot } = require('./commons')
const rootLens = lensPath(['group'])

module.exports = {
	root: makeRoot(rootLens),
	id: lensPath(['id']),
}
