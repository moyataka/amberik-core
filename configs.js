const url = {
  'reply': 'https://api.line.me/v2/bot/message/reply',
	'multicast': 'https://api.line.me/v2/bot/message/multicast',
	'accessToken': 'https://api.line.me/v2/oauth/accessToken',
}

const bot = {
	name: process.env.BOT_NAME || 'amberik',
	spec_dir: process.env.BOT_SPEC_DIR || '',
	workflow: process.env.BOT_WORKFLOW || '',
	multicast: {
		token: process.env.BOT_MULTICAST_TOKEN,
	},
}

module.exports = {
	bot,
  line: {
		//token_type: 'long-lived',
		channel_id: process.env.LINE_CHANNEL_ID,
		channel_secret: process.env.LINE_CHANNEL_SECRET,
		channel_access_token: process.env.LINE_CHANNEL_ACCESS_TOKEN,
		url,
  },
	getMemo: () => ({
		bot,
		type: process.env.MEMO_TYPE,
		host: process.env.MEMO_HOST,
		password: process.env.MEMO_PASSWORD,
		expire_minutes: 60*24, 
	}),
}
