const {
	lensPath,
	compose,
} = require('ramda')
const { makeRoot } = require('./commons')
const rootLens = lensPath(['message'])

module.exports = {
	root: makeRoot(rootLens),
	text: lensPath(['text']),
	image: lensPath(['image']),
}
