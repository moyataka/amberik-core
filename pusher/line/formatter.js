const R = require('ramda')
const { line: c } = require('../../constants')
const sel = require('../../selector')
//const { line:templates } = require('../../templates')

const formatText = R.identity
const formatImage = ({url}) => {
	return {
		type: c.MESSAGE_TYPE_IMAGE,
		originalContentUrl: url,
		previewImageUrl: url,
	}
}

const formatImageMap = ({
	url,
	width,
	height,
	alt_text,
	is_multiple_size,
	actions,
}) => {
	const baseUrl = is_multiple_size ? url : url + '?ignore='

	return {
		type: c.MESSAGE_TYPE_IMAGEMAP,
		baseUrl,
		altText: alt_text,
		baseSize: {
			width, height,
		},
		actions,
	}
}

	/*
const formatTemplate = (d) => {
	const { name, data } = d
	return templates[name](data)
}
*/

const formatRaw = R.ifElse(
	R.propEq('platform', 'line'),
	R.prop('msg'),
	() => null,
)

const formatQuickReply = (d) => {
  const e = { type: 'action' }
	const image_url = R.prop('image_url', d)
	const new_d = R.dissoc('imageUrl', d)

	return R.compose(
		R.ifElse(
			() => image_url,
			R.assoc('imageUrl', image_url),
			R.identity,
		),
		R.assoc('action', new_d),
	)(e)
}

const isMessageType = (msg_type) => R.compose(
  R.equals(msg_type),
  R.prop('type'),
)

const condFormatMessage = R.cond([
  [isMessageType(c.MESSAGE_TYPE_TEXT), formatText],
	[isMessageType(c.MESSAGE_TYPE_IMAGE), formatImage],
	[isMessageType(c.MESSAGE_TYPE_IMAGEMAP), formatImageMap],
	//[isMessageType('template'), formatTemplate],
	[isMessageType('raw'), formatRaw],
])

const addQuickReplies = (quick_replies) => (messages) => 
  R.assocPath(
    [messages.length - 1, 'quickReply', 'items'],
    R.map(formatQuickReply)(quick_replies),
  )(messages)

module.exports = (data) => {
  const quick_replies = sel.response.getQuickReplies(data)

  return R.compose(
    R.ifElse(
      () => quick_replies.length > 0,
      addQuickReplies(quick_replies),
      R.identity,
    ),
		//R.tap(console.log),
		R.filter(R.compose(R.not, R.isNil)),
		R.map(condFormatMessage),
    sel.response.getMessages,
  )(data)
}
