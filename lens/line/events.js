const { 
	lens,
	lensPath,
	always,
	identity,
	compose,
} = require('ramda')

const replyTokenLens = lensPath(['replyToken'])
const timestampLens = lensPath(['timestamp'])
const typeLens = lensPath(['type'])
const userIdLens = lensPath(['userId'])
const groupIdLens = lensPath(['groupId'])
const idLens = lensPath(['id'])
const postbackLens = lensPath(['postback'])
const textLens = lensPath(['text'])

const sourceLens = lensPath(['source'])
const fSource = (l) => compose(sourceLens, l)

const messageLens = lensPath(['message'])
const fMessage = (l) => compose(messageLens, l)

const providerLens = lensPath(['contentProvider'])
const fMessageProvider = (l) => compose(
	messageLens,
	providerLens,
	l
)

module.exports = {
	eventPlatform: lens(always('line'), identity),
	eventType: typeLens,
	eventToken: replyTokenLens,
	eventTimestamp: timestampLens,
	eventPostback: postbackLens,
	eventSourceUserId: fSource(userIdLens),
	eventSourceGroupId: fSource(groupIdLens),
	eventSourceType: fSource(typeLens),
	eventMessageType: fMessage(typeLens),
	eventMessageId: fMessage(idLens),
	eventMessageText: fMessage(textLens),
	eventMessageContentProvider: fMessage(providerLens),
	eventMessageContentProviderType: fMessageProvider(typeLens),
	eventMessageContentProviderOriginalUrl: fMessageProvider(lensPath(['originalContentUrl'])),
}

