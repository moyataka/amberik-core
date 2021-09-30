const { map, compose, lensPath, reduce } = require('ramda')
const { lensObjPath, makeRoot } = require('./commons')
const event = require('./event')
const response = require('./response')
const memory = require('./memory')
const message = require('./message')

const root = {
	root: makeRoot(['root']),
	event,
	response,
	memory,
	message,
}

const getLens = lensObjPath(root)

module.exports = {
	...root,
	eventMessage: getLens(['event', 'message']),
	eventMessageText: getLens(['event', 'message', 'text']),
	eventMessageImage: getLens(['event', 'message', 'image']),
	eventMemory: getLens(['event', 'memory']),
	eventMemoryId: getLens(['event', 'memoryId']),
	responseMemory: getLens(['response', 'memory']),
	responseMemoryId: getLens(['response', 'memory', 'id']),
}
