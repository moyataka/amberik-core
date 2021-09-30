const imgComp = (url) => {
  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
            "type": "image",
            "url": url,
            "size": "full",
            "aspectMode": "cover",
            "aspectRatio": "2:3",
            "gravity": "top"
        }
      ],
      "paddingAll": "0px"
    }
  }
}

module.exports = ({data=[]}) => {
  return {
    "type":"flex",
    "altText":"images",
    "contents":{
      "contents": data.map(imgComp),
      "type":"carousel"
    }
  }
}