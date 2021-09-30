const {
	lensPath,
	compose,
} = require('ramda')
const { makeRoot } = require('./commons')
const _index = lensPath(['multicast'])

module.exports = {
	_index,
	root: makeRoot(_index),
}
