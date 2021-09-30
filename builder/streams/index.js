const { of, throwError } = require('rxjs')
const { catchError } = require('rxjs/operators')
const rest = require('./rest')
const pipeCreator = require('../pipeCreator')

const _create$ = (d) => {
	switch(d['type']) {
		case 'constant':
			return (x) => of(d['value'])
		case 'get':
			return rest.get$(d)
		case 'post':
			return rest.post$(d)
		default:
			const pipeByType = pipeCreator.byType(d)
			return (x) => of(x).pipe(pipeByType)
	}
}

//only useStream (only stream able to handle Error)
//if not interest on error may use $$pipe instead
const create$ = (ops_builder) => (d) => {
	const s$ = _create$(d)
	const ls = d['pipe'] || []
	const ls_ops = ls.map(ops_builder)
	const ls_error = d['error'] || [{$$trace: ['error: ']}, { $$block: [] }]
	const ls_error_ops = ls_error.map(ops_builder)
		
	return (x) => s$(x)
		.pipe(
			...ls_ops,
			catchError((e) => {
				const data = { name: d['name'], ...e}
				if (d['error']) {
					return of(data).pipe(...ls_error_ops)
				}

				return throwError(data)
			})
		)
}

module.exports = {
  create$,
}