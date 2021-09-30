
module.exports = (cfg) => {
	const { promisify } = require('util')
	const redis = require('redis')

	const client = redis.createClient(cfg)
	client.set = promisify(client.set).bind(client)
	client.get = promisify(client.get).bind(client)
	client.expire = promisify(client.expire).bind(client)
	
	return {
		get: client.get,
		set: (key, val, expire=-1) => {
			return client.set(key, val)
				.then((r) => {
					if (expire > 0) {
						return client.expire(key, expire)
					}
					return r
				})
		},
	}
}

