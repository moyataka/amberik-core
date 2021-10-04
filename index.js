const R = require('ramda')
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
const channel = require('./channel')
const { getBearerToken } = require('./req')

const root_flow = require(`./spec/examples`)
const templates = require(`./spec/examples/templates`)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const memo = Memo(configs.getMemo())
const flow$ = flow.initFlow$(memo, root_flow, templates)()

const line$ = new Subject()
channel.subscribe.line(line$, flow$, pusher, memo)

app.post('/', (req, res) => {
	line$.next(req.body)
	res.send({})
})

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

app.listen(5577, () => console.log('webhook start!'))
