const {
	lensPath,
	compose,
} = require('ramda')
const { makeRoot } = require('./commons')
const rootLens = lensPath(['raw'])

module.exports = {
	root: makeRoot(rootLens),
}
