const srv = require('../../services/line')
const formatter = require('./formatter')
const sel = require('../../selector')

//inp: ({event, response})
const send = ({event, response}) => {
	const target = sel.response.getTarget(response)
	const msg_type = target.type || sel.event.getType(event)
	const messages = formatter(response)

	switch (msg_type) {
		case 'multicast':
			const to = target.line_uids
			return srv.multicast$(to, messages)
		default:
			//message, postback, follow, unfollow, etc...
			const token = sel.event.getToken(event)
			return srv.reply$(token, messages)
	}
}

module.exports = send
