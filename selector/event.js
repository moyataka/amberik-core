const R = require('ramda')
const lens = require('../lens/event')

const getContexts = (memory_key) => 
	R.pathOr({}, ['memory', memory_key, 'contexts'])
const getMessageImage = R.view(lens.messageImage)
const getMessageText = R.compose(
	R.replace(/\u200B/g,''),
	R.defaultTo(''),
	R.view(lens.messageText),
)

const getPostback = R.compose(
	R.defaultTo({}),
	R.view(lens.postback._index),
)
const getPostbackData = R.view(lens.postbackData)
const getPostbackParams = R.view(lens.postbackParams)

const getMulticast = R.compose(
	R.defaultTo({}),
	R.view(lens.multicast._index),
)

const getType = R.view(lens.type)

module.exports = {
	getPlatform: R.view(lens.platform),
	getMemoryId: R.view(lens.memoryId),
	getType,
	getIsTypeFollow: R.compose(
		R.equals('follow'),
		getType,
	),
	getIsTypeUnfollow: R.compose(
		R.equals('unfollow'),
		getType,
	),
	getToken: R.view(lens.token),
	getUserId: R.view(lens.sourceUserId),
	getMessageId: R.path(['message', 'id']),
	getMessageText,
	getIsMessageText: R.compose(
		R.not,
		R.isEmpty,
		getMessageText,
	),
	getMessageImage,
	getIsMessageImage: R.compose(
		R.compose(R.not, R.isNil),
		R.prop('url'),
		R.defaultTo({}),
		getMessageImage,
	),
	getState: R.pathOr({}, ['state', 'value']),
	getStateId: (key) => R.path(['state', 'id']),
	getContexts,
	getContext: (context_name) => R.compose(
		R.prop(context_name),
		getContexts,
	),
	getSwitch: R.pathOr({}, ['state', 'switch']),
	getIsEmptyContexts: R.compose(
		R.isEmpty,
		getContexts,
	),
	getPostback,
	getIsPostback: R.compose(
		R.not,
		R.isEmpty,
		getPostback,
	),
	getPostbackData,
	getPostbackParams,
	getIsPostbackDate: R.compose(
		R.not,
		R.isNil,
		R.prop('date'),
		getPostbackParams,
	),
	getPostbackDate: R.compose(
		R.prop('date'),
		getPostbackParams,
	),
	getMulticast,
	getIsMulticast: R.compose(
		R.not,
		R.isEmpty,
		getMulticast,
	),
	getIsSourceTypeGroup: R.compose(
		R.equals('group'),
		R.view(lens.sourceType),
	),
	getGroupId: R.view(lens.sourceGroupId),
}
