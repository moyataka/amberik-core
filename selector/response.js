const R = require('ramda')

const getContexts = (memory_key) => 
	R.pathOr({}, ['memory', memory_key, 'contexts'])

module.exports = {
	getTarget: R.propOr({}, 'target'),
	getMessages: R.propOr([], 'messages') ,
	getQuickReplies: R.propOr([], 'quick_replies'),
	getState: R.propOr({}, 'state'),
	getContexts,   
}
