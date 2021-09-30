module.exports = (data) => {
  return {
    type: 'flex',
    altText: data.displayName,
    contents: {
      "type": "bubble",
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": data.header1,
            "color": data.colorMain,
            "align": "start",
            "size": "xl",
            "gravity": "center"
          },
          {
            "type": "text",
            "text": data.header2,
            "color": data.colorMain,
            "align": "start",
            "size": "md",
            "gravity": "center"
          },
          {
            "type": "text",
            "text": data.bar1.text,
            "color": data.colorMain,
            "align": "start",
            "size": "xs",
            "gravity": "center",
            "margin": "lg"
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "filler"
                  }
                ],
                "width": (data.bar1.percent * 100) + "%",
                "backgroundColor": data.colorLighter,
                "height": "1px"
              }
            ],
            "backgroundColor": data.colorDarker,
            "height": "1px",
            "margin": "sm"
          },
          {
            "type": "text",
            "text": data.bar2.text,
            "color": data.colorMain,
            "align": "start",
            "size": "xs",
            "gravity": "center",
            "margin": "lg"
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "filler"
                  }
                ],
                "width": (data.bar2.percent * 100) + "%",
                "backgroundColor": data.colorLighter,
                "height": "1px"
              }
            ],
            "backgroundColor": data.colorDarker,
            "height": "1px",
            "margin": "sm"
          },
          {
            "type": "text",
            "text": data.bar3.text,
            "color": data.colorMain,
            "align": "start",
            "size": "xs",
            "gravity": "center",
            "margin": "lg"
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "filler"
                  }
                ],
                "width": (data.bar3.percent * 100) + "%",
                "backgroundColor": data.colorLighter,
                "height": "1px"
              }
            ],
            "backgroundColor": data.colorDarker,
            "height": "1px",
            "margin": "sm"
          }
        ],
        "backgroundColor": data.backgroundColor,
        "paddingTop": "19px",
        "paddingAll": "12px",
        "paddingBottom": "16px"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "backgroundColor": "#1E1E1E",
        "contents": [
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": data.detailText,
                "color": "#8A8A8A",
                "size": "sm",
                "wrap": true
              }
            ],
            "flex": 1
          }
        ],
        "spacing": "md",
        "paddingAll": "12px"
      },
      "styles": {
        "footer": {
          "separator": false
        }
      }
    }
  }
}