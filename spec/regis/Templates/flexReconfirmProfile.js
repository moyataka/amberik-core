const { withFlex } = require('./commons')

module.exports = ({
	logo_url='https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
	full_name='{{full_name}}',
	mobile_number='{{mobile_number}}',
	email='{{email}}',
	birthdate='{{birthdate}}',
	alt_text,
}) => {
	return withFlex(alt_text)({
		"type": "bubble",
		"header": {
			"type": "box",
			"layout": "vertical",
			"contents": [
				{
					"type": "image",
					"url": logo_url,
					"aspectMode": "fit",
					"size": "80%",
					"aspectRatio": "20:6"
				}
			],
			"backgroundColor": "#121441"
		},
		"body": {
			"type": "box",
			"layout": "vertical",
			"contents": [
				{
					"type": "box",
					"layout": "vertical",
					"contents": [
						{
							"type": "text",
							"text": "โปรดยืนยันข้อมูลเดิมของท่าน",
							"weight": "bold",
							"size": "xl",
							"margin": "none",
							"color": "#121441",
							"wrap": true,
							"align": "start"
						},
						{
							"type": "text",
							"text": "ระบบพบข้อมูลเดิมของท่านในระบบ ท่านสามารถยืนยันเพื่อข้ามขั้นตอนการขอข้อมูลส่วนบุคคลได้ทันที หรือหากท่านมีข้อมูลจะแก้ไข ท่านสามารถแก้ไขข้อมูลได้จากคลิกปุ่มด้านล่าง",
							"wrap": true,
							"color": "#B1B1B1",
							"size": "xs",
							"margin": "xs"
						}
					]
				},
				{
					"type": "box",
					"layout": "vertical",
					"margin": "xl",
					"spacing": "sm",
					"contents": [
						{
							"type": "box",
							"layout": "horizontal",
							"contents": [
								{
									"type": "text",
									"text": "ผู้ลงทะเบียน",
									"size": "sm",
									"color": "#555555",
									"flex": 1,
									"margin": "none"
								},
								{
									"type": "text",
									"text": full_name,
									"size": "sm",
									"color": "#111111",
									"align": "start",
									"margin": "xxl"
								}
							],
							"margin": "none"
						},
						{
							"type": "box",
							"layout": "horizontal",
							"contents": [
								{
									"type": "text",
									"text": "เบอร์โทร",
									"size": "sm",
									"color": "#555555",
									"flex": 1
								},
								{
									"type": "text",
									"text": mobile_number,
									"size": "sm",
									"color": "#111111",
									"align": "start",
									"margin": "xxl"
								}
							],
							"margin": "md"
						},
						{
							"type": "box",
							"layout": "horizontal",
							"contents": [
								{
									"type": "text",
									"text": "อีเมล์",
									"size": "sm",
									"color": "#555555",
									"flex": 1,
									"wrap": true
								},
								{
									"type": "text",
									"text": email,
									"size": "sm",
									"color": "#111111",
									"align": "start",
									"margin": "xxl",
									"wrap": true
								}
							],
							"margin": "md"
						},
						{
							"type": "box",
							"layout": "horizontal",
							"contents": [
								{
									"type": "text",
									"text": "วันเดือนปีเกิด",
									"size": "sm",
									"color": "#555555",
									"flex": 1,
									"margin": "none"
								},
								{
									"type": "text",
									"text": birthdate,
									"size": "sm",
									"color": "#111111",
									"align": "start",
									"margin": "xxl"
								}
							],
							"spacing": "none",
							"margin": "md"
						}
					]
				}
			]
		},
		"footer": {
			"type": "box",
			"layout": "vertical",
			"contents": [
				{
					"type": "box",
					"layout": "vertical",
					"contents": [
						{
							"type": "text",
							"text": "ยืนยันข้อมูลและ",
							"wrap": true,
							"size": "md",
							"align": "center",
							"gravity": "center",
							"margin": "none",
							"color": "#FFFFFF",
							"offsetTop": "md"
						},
						{
							"type": "text",
							"text": "ลงทะเบียนสินค้าเพื่อรับสิทธิ์",
							"wrap": true,
							"size": "md",
							"align": "center",
							"gravity": "center",
							"margin": "none",
							"color": "#FFFFFF",
							"offsetTop": "md"
						}
					],
					"backgroundColor": "#121441",
					"borderWidth": "none",
					"height": "60px",
					"cornerRadius": "md",
					"action": {
						"type": "message",
						"label": "ยืนยันข้อมูล",
						"text": "ยืนยันข้อมูล",
					},
					"margin": "none"
				}
			]
		},
		"styles": {
			"footer": {
				"separator": false
			}
		}
	})
}
