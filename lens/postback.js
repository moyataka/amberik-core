const {
	lensPath,
	compose,
} = require('ramda')
const { makeRoot } = require('./commons')
const _index = lensPath(['postback'])

module.exports = {
	_index,
	root: makeRoot(_index),
	data: lensPath(['data']),
	params: lensPath(['params']),
}
