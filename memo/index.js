const { of, pipe, from } = require('rxjs')
const { map, mergeMap } = require('rxjs/operators')
const R = require('ramda')
const local = require('./local')
const redis = require('../services/db/redis')
const sel = require('../selector')
const lens = require('../lens')

const genKey = (prefix, id) => `${prefix}:state:${id}`
const makeSetMemory$ = ({
	db,
	prefix,
	formatter=R.identity,
	expire_minutes=60*24*7,
}) => {
	return (data) => {
		const memory = R.view(lens.responseMemory)(data)
		const memory_id = R.view(lens.memory.id)(memory)

		if (memory_id && memory_id !== false) {
			return from(
				db.set(
					genKey(prefix, memory_id),
					R.compose(
						formatter,
						R.dissoc('id'),
					)(memory),
					expire_minutes*60,
				)
			)
		}

		return of('no memory id')
	}
}

const makeGetMemory$ = ({
	db,
	prefix,
	formatter=R.identity,
}) => {
	return (memory_id) => {
		return from(db.get(genKey(prefix, memory_id)))
			.pipe(
				map(formatter),
			)
	}
}

const createLocal = (cfg) => {
	const db = local()
	console.log('memo: use local')

	return {
		setMemory$: makeSetMemory$({
			db,
			prefix: cfg.bot.name,
		}),
		getMemory$: makeGetMemory$({
			db,
			prefix: cfg.bot.name,
		}),
	}
}

const createRedis = (cfg) => {
	const db = redis(R.pick(['host', 'password'])(cfg))
	console.log(`memo: use redis`)
	console.log(`memo: memory expire time is ${cfg.expire_minutes} mins`)

	return {
		setBotMemory: (key, value, expire_seconds) => {
			if (key === 'memory') {
				throw new Error('key name `memory` be reserved for msg state only')
			}
			return db.set(
				`${cfg.bot.name}:${key}`,
				value,
				expire_seconds,
			)
		},
		getBotMemory: (key) => db.get(`${cfg.bot.name}:${key}`),
		setMemory$: makeSetMemory$({
			db,
			prefix: cfg.bot.name,
			formatter: JSON.stringify,
			expire_minutes: cfg.expire_minutes,
		}),
		getMemory$: makeGetMemory$({
			db,
			prefix: cfg.bot.name,
			formatter: JSON.parse,
		}),
	}
}

module.exports = (cfg) => {
	switch(cfg.type) {
		case 'redis':
			return createRedis(cfg)
		default:
			return createLocal(cfg)
	}
}
