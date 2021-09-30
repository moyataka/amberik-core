const axios = require('axios')
const qs = require('querystring')
const { from } = require('rxjs')
const { map, mergeMap } = require('rxjs/operators')
const cfg = require('../../configs')
const Memo = require('../../memo')

const issueToken = () => {
	const options = {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data: qs.stringify({
			grant_type: 'client_credentials',
			client_id: cfg.line.channel_id,
			client_secret: cfg.line.channel_secret,
		}),
		url: cfg.line.url['accessToken'],
	}

	return axios(options)
		.then(({data}) => data)
}

const isShortLivedToken = () => {
	if (cfg.line.token_type === 'short-lived') {
		return true
	}
	if (!cfg.line.channel_access_token) {
		return true
	}
	return false
}

function* tokener() {
	var memo = {}
	if (isShortLivedToken()) {
		memo = Memo(cfg.getMemo())
	}

	while (true) {
		yield new Promise(async (resolve, reject) => {
			if (!isShortLivedToken()) {
				resolve(cfg.line.channel_access_token)
			} else {
				var token = await memo.getBotState('token')
				if (!token) {
					const data = await issueToken()
					token	= data['access_token']

					if (data['expires_in'] > 3600) {
						await memo.setBotState('token', token, data['expires_in'] - 3600)
					}
				}

				resolve(token)
			}
		})
	}
}

const genToken = tokener()
const getOptions = (url, token) => ({
  method: 'post',
	headers: { Authorization: `Bearer ${token}` },
  url,
})

module.exports = {
  reply$: (replyToken, messages) => {
		return from(genToken.next().value)
			.pipe(
				mergeMap((token) => {
					const options = getOptions(cfg.line.url['reply'], token)
					options['data'] = { replyToken, messages }
					return from(axios(options))
				}),
				map(({status}) => status),
			)
			/*
    return from(axios(options)
      .then(({status}) => status)
			.catch(({response}) => {
				throw {
					status: response.status,
					statusText: response.statusText,
					details: JSON.stringify(response.data),
				}
			}))
			*/
  },
	multicast$: (to, messages) => {
		return from(genToken.next().value)
			.pipe(
				mergeMap((token) => {
					const options = getOptions(cfg.line.url['multicast'], token)
					options['data'] = { to, messages }
					return from(axios(options))
				}),
			)	
	},
	downloadImageBuffer$: (provider, url) => {
		const options = {
			url,
			responseType: 'arraybuffer',
		}

		if (provider === 'line') {
			return from(genToken.next().value)
				.pipe(
					mergeMap((token) => {
						options['headers'] = { Authorization: `Bearer ${token}` }
						return from(axios(options))
					}),
					map((res) => res.data)
				)
		}
	}
}
