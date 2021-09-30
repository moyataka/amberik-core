const R = require('ramda')
const axios = require('axios')
const { from, throwError } = require('rxjs')
const { map, catchError } = require('rxjs/operators')
const queryString = require('query-string')

const genUrl = (_url='', _path_params={}, _params) => {
	var url = String(_url)
	Object.entries(_path_params).map(([k, v]) => {
		url = url.replace(new RegExp(`\:(${k})(?=(\/|$))`, 'g'), v)
	})

	if (_params) {
		return url + '?' + queryString.stringify(_params)
	}

	return url
}

const opErrorHandler = catchError((_err) => {
	const { status, statusText } = R.defaultTo(
		{ status: '000', statusText: ''},
	)(_err.response)

	return throwError({ code: status, data: statusText })
})

const get$ = (d) => ({headers, _paths={}, _params}) => {
	const options = {
		method: 'get',
		headers: headers || d.headers || {},
		url: genUrl(d['url'], _paths, _params),
	}

	return from(axios(options))
		.pipe(
			map(R.prop('data')),
			opErrorHandler,
		)
}

const post$ = (d) => (x={}) => {
	const headers = x.headers || {}
	const data = x.body || x
	const _paths = x['_paths'] || {}

	const options = {
		method: 'post',
		headers,
		url: genUrl(d['url'], _paths),
		data,
	}

	return from(axios(options))
		.pipe(
			map(R.prop('data')),
			opErrorHandler,
		)
}

module.exports = {
	get$,
	post$,
}