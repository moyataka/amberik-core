const R = require('ramda')
const event = require('./event')
const response = require('./response')

module.exports = {
	getEvent: R.prop('event'),
	getResponse: R.prop('response'),
	event,
	response,
}
