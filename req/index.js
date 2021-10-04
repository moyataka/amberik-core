const getBearerToken = (req) => {
	return R.compose(
			R.nth(1),
			R.split('Bearer '),
			R.defaultTo('Bearer '),
		)(req.get('Authorization'))
}

module.exports = {
	getBearerToken,
}