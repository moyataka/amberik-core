const R = require('ramda')
const { empty } = require('rxjs')
const sel = require('../selector')
const c = require('../constants')

const sendToLine$ = require('./line')

const isPlatform = (platform) => R.compose(
  R.equals(platform),
	//TODO merge read from response instead of event
	// may response.target.platform
  sel.event.getPlatform,
  R.prop('event'),
)

const send$ = R.ifElse(
	R.compose(
		R.isEmpty,
		sel.response.getMessages,
		R.prop('response'),
	),
	() => empty(),
	R.cond([
		[isPlatform(c.PLATFORM_LINE), sendToLine$],
		[R.T, () => empty()],
	])
)

module.exports = {
	send$,
}
