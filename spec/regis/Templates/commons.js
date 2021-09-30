const withFlex = (alt_text='flex') => (contents) => {
	return {
		type: 'flex',
		altText: alt_text,
		contents,
	}
}

module.exports = {
	withFlex,
}
