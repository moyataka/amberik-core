const R = require('ramda')
const Fuse = require('fuse.js')
const { v4: uuidv4 } = require('uuid')
const selector = require('../selector')

const monthTh = {
	'01': 'มกราคม',
	'02': 'กุมภาพันธ์',
	'03': 'มีนาคม',
	'04': 'เมษายน',
	'05': 'พฤษภาคม',
	'06': 'มิถุนายน',
	'07': 'กรกฎาคม',
	'08': 'สิงหาคม',
	'09': 'กันยายน',
	'10': 'ตุลาคม',
	'11': 'พฤศจิกายน',
	'12': 'ธันวาคม',
}

const monthEn = {
	'01': 'January',
	'02': 'February',
	'03': 'March',
	'04': 'April',
	'05': 'May',
	'06': 'June',
	'07': 'July',
	'08': 'August',
	'09': 'September',
	'10': 'October',
	'11': 'November',
	'12': 'December',
}

const months = {
	th: monthTh,
	en: monthEn,
}

module.exports = {
	...R,
	selector: (sel_name) => {
		return selector.event[sel_name]
	},
	echo: R.tap(console.log),
	trace: (prefix='') => (x) => {
		console.log(prefix, x)
		return x
	},
	flipConcat: R.flip(R.concat),
	flipIncludes: R.flip(R.includes),
	flipNth: R.flip(R.nth),
	alwaysToday: R.thunkify(() => {
		return new Date(Date.now()).toISOString().split('T')[0]
	}),
	alwaysNowISOString: R.thunkify(() => {
		return new Date(Date.now()).toISOString()
	}),
	isoStringFromTimestamp: (shift_seconds=0) => (timestamp) => {
		return new Date(timestamp+shift_seconds*1000).toISOString()
	},
	newDate: () => (date_string) => {
		return new Date(date_string)
	},
	dateToFormat: () => (date_obj) => {
		return date_obj.toISOString().split('T')[0]
	},
	formatISODateToFullTextDate: (lang) => (iso_date) => {
		const [ year, month, day ] = iso_date.split('-')
		return `${day} ${months[lang][month]} ${year}`
	},
	formatMobileNumber: (opts) => R.compose(
		R.join(''),
		R.insert(7, '-'),
		R.insert(3, '-'),
	),
	timestamp: () => R.thunkify(() => {
		return String(new Date(Date.now()).getTime())
	})(),
	print: (x) => R.thunkify(console.log)(x),
	capitalize: R.pipe(
		R.split(' '),
		R.map(R.compose(
			R.join(''),
			R.juxt([R.compose(R.toUpper, R.head), R.tail]),
		)),
		R.join(' '),
	),
	test: R.curry((re_str, x) => 
		R.test(new RegExp(re_str), x)
	),
	replace: R.curry((re_str, new_str, x) => 
		R.replace(new RegExp(re_str), new_str, x)
	),
	replaceAll: R.curry((re_str, new_str, x) => 
		R.replace(new RegExp(re_str, 'g'), new_str, x)
	),
	alwaysUUID: () => uuidv4,
	jsonStringify: JSON.stringify,
	patternMapping: R.curry((d, t=undefined) => 
		(x) => R.propOr(t, x)(d)
	),
	mergeArrayObjects: R.curry((key_id, key_val, arr) => {
		return R.compose(
			R.mergeAll,
			R.map((o) => {
				return {
					[o[key_id]]: o[key_val],
				}	
			}),
		)(arr)
	}),
	flattenKey: R.curry((key, d) => {
		const fdata = d[key]

		return R.compose(
			R.mergeLeft(fdata),
			R.dissoc(key),
		)(d)
	}),
	hasAnyWord: (ls_word) => {
		var rg_str = R.join('|', ls_word)
		rg_str = `(${rg_str})`

		return R.test(new RegExp(rg_str))
	},
	randInt: (max_num) => () => {
		return Math.floor((Math.random() * max_num))
	},
	fuzzy: (keys, list, term) => {
		const options = keys ? { keys } : {}
		const fuse = new Fuse(list, options)

		return fuse.search(term)[0]
	},
	textKeyVal: R.curry((text, obj) => {
		var out = text
		for (const [key, val] of Object.entries(obj)) {
			const rg_str = RegExp(`{{${key}}}`, 'g')
			out = out.replace(rg_str, val)
		}
		return out
	}),
}

