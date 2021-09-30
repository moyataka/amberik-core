module.exports = {
	//use DEFAULT_MAX_RETAIN and DEFAULT_TIMEOUT
	//TODO make it global DEFAULT and configurable
	Context: ({name, retain, timeout, metadata}) => {
		return {
			name,
			metadata,
			...(retain && { retain }), 
			...(timeout && { 
				expired_timestamp: Date.now() + timeout*1000,
				}),
		}
	},
}
