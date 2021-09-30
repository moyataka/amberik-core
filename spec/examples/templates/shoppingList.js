const genContent = ({name, image, price, link}) => {
  return  {
    "type": "bubble",
    "hero": {
      "type": "image",
      "size": "full",
      "aspectRatio": "13:13",
      "aspectMode": "fit",
      "url": image,
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
        {
          "type": "text",
          "text": name,
          "wrap": false,
          "weight": "bold",
          "size": "md"
        },
        {
          "type": "box",
          "layout": "baseline",
          "contents": [
            {
              "type": "text",
              "text": price,
              "wrap": true,
              "weight": "bold",
              "size": "xl",
              "flex": 0
            }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
        {
          "type": "button",
          "style": "primary",
          "height": "sm",
          "action": {
            "type": "uri",
            "label": "ซื้อเลย!",
            "uri": encodeURI(link)
          }
        }
      ]
    }
  }
}

module.exports = ({data=[]}) => {
  return {
    type: 'flex',
    altText: 'Items List',
    contents: {
      "type": "carousel",
      "contents": data.map(genContent)
    },
  }
}