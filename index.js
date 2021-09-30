const R = require('ramda')
const axios = require('axios')
const { from, throwError, iif, of, Subject, forkJoin } = require('rxjs')
const { map, filter, defaultIfEmpty, tap, mergeMap, retryWhen } = require('rxjs/operators')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const configs = require('./configs')
const Memo = require('./memo')
const parser = require('./parser')
const pusher = require('./pusher')
const flow = require('./flow')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const memo = Memo(configs.getMemo())
const line$ = new Subject()
const flow$ = flow.initFlow$(memo)()

const filterLineEmptyEvent = R.compose(
	R.ifElse(
		R.isEmpty,
		R.compose(
			R.F,
			R.tap(() => console.log('got empty events')),
		),
		R.T,
	),
	R.prop('events'),
)

line$.pipe(
	filter(filterLineEmptyEvent),
	mergeMap(parser.line$),
	mergeMap(flow$),
	mergeMap((data) => forkJoin([
		pusher.send$(data),
		memo.setMemory$(data),
	])),
	retryWhen(e => e.pipe(tap(console.error))),
).subscribe()

app.post('/', (req, res) => {
	line$.next(req.body)
	res.send({})
})

const getBearerToken = (req) => {
	return R.compose(
			R.nth(1),
			R.split('Bearer '),
			R.defaultTo('Bearer '),
		)(req.get('Authorization'))
}

app.post('/multicast', (req, res) => {
	of(req.body)
		.pipe(
			map((body) => {
				const token = getBearerToken(req)
				if (token === configs.bot.multicast.token) {
					return body
				}
				throw { response: {
					status: 401,
					data: 'Bearer token invalid',
				}}
			}),
			mergeMap(parser.multicast$),
			mergeMap(flow$),
			defaultIfEmpty(false),
			mergeMap(v => iif(
				() => (v === false),
				throwError({
					response: { status: 500, data: 'flow not found' },
				}),
				of(v),
			)),
			mergeMap(pusher.send$),
		).subscribe({
			next: (x) => {
				res.status(x.status).send(x.statusText)
			},
			error: ({response}) => {
				res.status(response.status).send(response.data)
			},
		})
})

app.get('/healthz', (req, res) => {
	res.send('ok')
})

app.listen(3000, () => console.log('webhook start!'))
