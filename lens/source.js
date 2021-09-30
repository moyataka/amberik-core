const {
	lensPath,
	compose,
} = require('ramda')
const group = require('./group')
const { makeRoot } = require('./commons')
const rootLens = lensPath(['source'])

module.exports = {
	root: makeRoot(rootLens),
	id: lensPath(['id']),
	type: lensPath(['type']),

	group,
	groupId: group.root(group.id),
}
