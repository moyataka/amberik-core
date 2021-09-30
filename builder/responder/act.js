const R = require('ramda')

const isQuickReply = R.equals('quick_reply')

module.exports = {
	Text: ({content_type, label, text,  x, y, width, height}) => {
		const obj = { 
			type: 'message',
			label, text: text ? text : label ,
			area: {
				x, y, width, height,
			},
		}

		if (isQuickReply(content_type)) {
			return R.dissoc('area')(obj)
		}

		return obj
	},
	Postback: ({label, text, data}) => ({
		type: 'postback',
		label: label,
		data: data,
		text: text ? text : label,
	}),
	Camera: ({label}) => ({
		type: 'camera',
		label,
	}),
	CameraRoll: ({label}) => ({
		type: 'cameraRoll',
		label, 
	}),
	DatePicker: ({label, mode, data='undefined', initial=null}) => ({
		type: 'datetimepicker',
		label,
		data, 
		mode,
		initial,
	}),
	LinkUri: ({label, uri, x, y, width, height}) => ({
		type:"uri",
		label,
		linkUri: uri,
		area: {
			x, y, width, height
		},
	}),
	withIconUrl: (image_url) => (f) => R.compose(
		R.assoc('image_url', image_url),
		f,
	),
}
