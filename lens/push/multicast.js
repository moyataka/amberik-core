const { always, lens, lensPath, identity } = require('ramda')
const { v4: uuidv4 } = require('uuid')

const multicastLens = lensPath([])

module.exports = {
	platform: lens(always('line'), identity),
	type: lens(always('multicast'), identity),
	timestamp: lens(() => Date.now(), identity),
	sourceId: lens(uuidv4, identity),
	sourceType: lens(always('push'), identity),
	multicast: multicastLens,
}
