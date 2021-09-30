const ask = {
	type: 'text',
	text: 'กรุณาพิมพ์ ชื่อและนามสกุลของท่านโดยไม่ต้องมีคำนำหน้าชื่อ\nตัวอย่าง: กนก ดีวันดีคืน',
}

const fail1 = {
	type: 'text',
	text: 'ท่านกรอกข้อมูลไม่ถูกต้อง\n\nกรุณาพิมพ์ชื่อและนามสกุล ของท่านโดยไม่ต้องมีคำนำหน้าชื่อ\nตัวอย่าง: กนก ดีวันดีคืน',
}

const fail2 = {
	type: 'text',
	text: 'ท่านกรอกข้อมูลไม่ถูกต้อง\n\nกรุณาติดต่อ เพื่อลงทะเบียนรับประกันสินค้า'
}

const ctx = {
	name: 'awaiting_fullname',
	do: [ask],	
	timeout: 30,
	metadata: {
		dropoff_id: 10100,
	},
}

module.exports = {
	ask,
	ctx,
	fail1,
	fail2,
}
