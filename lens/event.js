const { 
	lens,
	lensPath,
	always,
	identity,
	compose,
} = require('ramda')
const { makeRoot } = require('./commons')
const memory = require('./memory')
const message = require('./message')
const raw = require('./raw')
const source = require('./source')
const postback = require('./postback')
const multicast = require('./multicast')

const rootLens = lensPath(['event'])

const platformLens = lensPath(['platform'])
const typeLens = lensPath(['type'])
const tokenLens = lensPath(['token'])
const timestampLens = lensPath(['timestamp'])
const idLens = lensPath(['id'])
const groupIdLens = lensPath(['group', 'id'])

const sourceLens = lensPath(['source'])
const fSource = (_lens) => compose(sourceLens, _lens)

module.exports = {
	root: makeRoot(rootLens),
	platform:	platformLens,
	type: typeLens,
	token: tokenLens,
	timestamp: timestampLens,
	postback,
	postbackData: postback.root(postback.data),
	postbackParams: postback.root(postback.params),
	multicast,
	multicastData: multicast.root(multicast.data),

	sourceUserId: source.root(source.id),
	sourceGroupId: source.root(source.groupId),
	sourceType: source.root(source.type),

	message,
	messageText: message.root(message.text),
	messageImage: message.root(message.image),
	raw,

	memory,
	memoryId: memory.root(memory.id),
}
