const { lensPath, compose, map } = require('ramda')
const events = require('./events')

const lensEventsHead = lensPath(['events', 0])
const lensOfEvents = map(
	(l) => compose(lensEventsHead, l)
)(events)

module.exports = {
	event: lensEventsHead,
	events: lensPath(['events']),
	destination: lensPath(['destination']),
	...lensOfEvents,
}

