const { from, of } = require('rxjs')
const { map, tap } = require('rxjs/operators')
const R = require('ramda')
const c = require('../../constants')
const lensLine = require('../../lens/line')
const lens = require('../../lens')

const genContentUrl = (msg_id) => `https://api-data.line.me/v2/bot/message/${msg_id}/content` 
const getMessage = (e) => {
	const msg_type = R.view(lensLine.eventMessageType)(e)

	const out = {
		id: R.view(lensLine.eventMessageId)(e),
		text: '',
	}

	if (msg_type === c.line.MESSAGE_TYPE_TEXT){
		out['text'] = R.view(lensLine.eventMessageText)(e)
	}

	if (msg_type === c.line.MESSAGE_TYPE_IMAGE){
		const provider_type = R.view(lensLine.eventMessageContentProviderType)(e)

		out['image'] = {
			provider: provider_type,
			url: R.ifElse(
				() => R.equals(provider_type, c.line.MESSAGE_CONTENT_PROVIDER_TYPE_EXTERNAL),
				R.view(lensLine.eventMessageContentProviderOriginalUrl),
				R.compose(
					genContentUrl,
					R.view(lensLine.eventMessageId),
				),
			)(e),
		}
	}

	return out
}

const mapByLens = (lens_from, lens_to) =>
	(x) => {
	//	console.log(R.view(lens_from)(x))
	//	console.log(R.set(lens_to, 'xxx')({}))
		return R.set(
			lens_to,
			R.view(lens_from)(x)
		)({})
	}

const setEvent = R.compose(
	R.reduce(R.mergeDeepRight, {}),
	R.juxt([
		mapByLens(lensLine['eventPlatform'], lens.event.platform),
		mapByLens(lensLine['eventType'], lens.event.type),
		mapByLens(lensLine['eventToken'], lens.event.token),
		mapByLens(lensLine['eventTimestamp'], lens.event.timestamp),
		mapByLens(lensLine['eventPostback'], lens.event.postback.root()),
		mapByLens(lensLine['eventSourceUserId'], lens.event.sourceUserId),
		mapByLens(lensLine['eventSourceGroupId'], lens.event.sourceGroupId),
		mapByLens(lensLine['eventSourceType'], lens.event.sourceType),
		(d) => R.set(
			lens.event.message.root(),
			getMessage(d),
		)({}),
		(d) => R.set(
			lens.event.raw.root(),
			d,
		)({}),
	]),
)

const createEvent$ = (data) => {
	const events = R.view(lensLine.events)(data)
	const datas = R.map((e) => {
		return {
			...data,
			events: [e],
		}
	})(events)

	return of(...datas).pipe(
		map(setEvent),
	)
}

module.exports = createEvent$
