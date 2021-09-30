const { withFlex } = require('./commons')

module.exports = ({
	logo_url='https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
	full_name='{{full_name}}',
	mobile_number='{{mobile_number}}',
	email='{{email}}',
	birthdate='{{birthdate}}',
	serial_number='{{serial_number}}',
	product_number='{{product_number}}',
	purchase_date='{{purchase_date}}',
	purchase_channel='{{purchase_channel}}',
	footer='ท่านสามารถถ่ายรูปหน้าจอ (screen capture) เพื่อใช้เป็นหลักฐานยืนยันการรับประกันสินค้ากับทางบริษัท',
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
					"type": "text",
					"text": "ลงทะเบียนรับประกันเสร็จสมบูรณ์",
					"weight": "bold",
					"size": "xl",
					"margin": "none",
					"color": "#121441",
					"wrap": true,
					"align": "start"
				},
				{
					"type": "box",
					"layout": "vertical",
					"margin": "md",
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
						},
						{
							"type": "separator",
							"margin": "xxl"
						},
						{
							"type": "box",
							"layout": "horizontal",
							"contents": [
								{
									"type": "text",
									"text": "Serial No.",
									"size": "sm",
									"color": "#555555"
								},
								{
									"type": "text",
									"text": serial_number,
									"size": "sm",
									"color": "#111111",
									"align": "start",
									"wrap": true,
									"margin": "xxl"
								}
							],
							"margin": "xxl"
						},
						{
							"type": "box",
							"layout": "horizontal",
							"margin": "md",
							"contents": [
								{
									"type": "text",
									"text": "Product No.",
									"size": "sm",
									"color": "#555555",
									"flex": 1
								},
								{
									"type": "text",
									"text": product_number,
									"size": "sm",
									"color": "#111111",
									"align": "start",
									"margin": "xxl"
								}
							]
						},
						{
							"type": "box",
							"layout": "horizontal",
							"contents": [
								{
									"type": "text",
									"text": "วันซื้อสินค้า",
									"size": "sm",
									"color": "#555555",
									"flex": 1
								},
								{
									"type": "text",
									"text": purchase_date,
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
									"text": "สถานที่ซื้อสินค้า",
									"size": "sm",
									"color": "#555555",
									"flex": 1
								},
								{
									"type": "text",
									"text": purchase_channel,
									"size": "sm",
									"color": "#111111",
									"align": "start",
									"wrap": true,
									"margin": "xl"
								}
							],
							"margin": "md"
						},
						{
							"type": "spacer",
							"size": "md"
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
					"type": "text",
					"text": footer,
					"wrap": true,
					"size": "sm",
					"color": "#121441",
					"margin": "md",
					"gravity": "bottom",
					"align": "start",
					"weight": "bold"
				},
				{
					"type": "spacer",
					"size": "md"
				}
			],
			"margin": "md",
			"spacing": "none"
		},
		"styles": {
			"footer": {
				"separator": true
			}
		}
	})
}
