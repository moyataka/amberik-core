const colors = require('./colors')

function invertColor(hex, bw) {
  if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
  }
  var r = parseInt(hex.slice(0, 2), 16),
      g = parseInt(hex.slice(2, 4), 16),
      b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
      // http://stackoverflow.com/a/3943023/112731
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186
          ? '#000000'
          : '#FFFFFF';
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}

const formatTextRGB = (r, g, b) => {
  r_t = padZero(r, 2)
  g_t = padZero(g, 2)
  b_t = padZero(b, 2)
  return `#${r_t}${g_t}${b_t}` 
}

const goodColorFormatter = (color_data) => {
  const {r, g, b} = color_data
  const rgb = formatTextRGB(r, g, b)
  const color_invert = invertColor(rgb, false)
  const sum_rgb = parseInt(r, 16) + parseInt(g, 16) + parseInt(b, 16)
  const bar1_percent = parseInt(r, 16)/(255*1.25)/sum_rgb*255 + 0.2
  const bar2_percent = parseInt(g, 16)/(255*1.25)/sum_rgb*255 + 0.2
  const bar3_percent = parseInt(b, 16)/(255*1.25)/sum_rgb*255 + 0.2

  return {
    displayName: 'Color of The Day',
    backgroundColor: rgb,
    colorMain: invertColor(rgb, true),
    colorDarker: ColorLuminance(rgb, -0.5),
    colorLighter: ColorLuminance(color_invert, -0.2),
    header1: "Color of The Day",
    header2: `${color_data.name_en}`,
    bar1: {
      text: `Love +${bar1_percent*100}% `,
      percent: bar1_percent,
    },
    bar2: {
      text: `Health +${bar2_percent*100}% `,
      percent: bar2_percent,
    },
    bar3: {
      text: `Work +${bar3_percent*100}% `,
      percent: bar3_percent,
    },
    detailText: `${color_data.name_th}, RGB: ${rgb}`,
  }
}

const randMD5 = (user_id) => {
  var md5 = require('md5')
  var now = new Date().toISOString().split('T')[0]

  return md5(now+user_id)
}

const randColorData = (user_id) => {
  const idx =  parseInt(randMD5(user_id).slice(0, 6), 16) % colors.length
  return colors[idx]
}

function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

const goodColorFormater = (color_data) => {
  const {r, g, b} = color_data
  const rgb = formatTextRGB(r, g, b)
  const color_invert = invertColor(rgb, false)
  const sum_rgb = parseInt(r, 16) + parseInt(g, 16) + parseInt(b, 16)
  const bar1_percent = parseInt(r, 16)/(255*1.25)/sum_rgb*255 + 0.2
  const bar2_percent = parseInt(g, 16)/(255*1.25)/sum_rgb*255 + 0.2
  const bar3_percent = parseInt(b, 16)/(255*1.25)/sum_rgb*255 + 0.2

  return {
    displayName: 'Color of The Day',
    backgroundColor: rgb,
    colorMain: invertColor(rgb, true),
    colorDarker: ColorLuminance(rgb, -0.5),
    colorLighter: ColorLuminance(color_invert, -0.2),
    header1: "Color of The Day",
    header2: `${color_data.name_en}`,
    bar1: {
      text: `Love +${bar1_percent*100}% `,
      percent: bar1_percent,
    },
    bar2: {
      text: `Health +${bar2_percent*100}% `,
      percent: bar2_percent,
    },
    bar3: {
      text: `Work +${bar3_percent*100}% `,
      percent: bar3_percent,
    },
    detailText: `${color_data.name_th}, RGB: ${rgb}`,
  }
}

const getGoodColor = (user_id) => {
  return randColorData(user_id)
}

module.exports = {
  getGoodColor,
  goodColorFormater,
} 