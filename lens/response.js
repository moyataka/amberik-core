const { 
	lens,
	lensPath,
	always,
	identity,
	compose,
} = require('ramda')
const { makeRoot } = require('./commons')
const memory = require('./memory')

const rootLens = lensPath(['response'])
module.exports = {
	root: makeRoot(rootLens),
	memory,
	memoryId: memory.root(memory.id),
}
