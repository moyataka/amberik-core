const $replyAllMember711 = {
	$compose: [
		{ $hasAnyWord: [['7-11', 'เซเว่น']] },
	],
}

const keyword_match = {
	name: 'keyword-matching',
	type: 'text',
	pipe: [
		{
			$$map: [ { $cond: [[
				[ $replyAllMember711, { $always: ['มี All Member มั้ยคะ'] }],
			]] }]
		},
	],
	do: [
		{
			type: 'text',
			paths: {
				text: []
			},
		},
	],
}

module.exports = keyword_match