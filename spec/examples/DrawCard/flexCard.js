const { toLabelSym } =require('./cards')

const gray = '#D3D3D3'
module.exports = ({deck, idx}) => {
  const txt = deck[idx]
  const [label, sym, color] = toLabelSym(txt)
  const _label = label === 'T' ? '10': label
  const rgb = color === 'red' ? '#FF0000' : '#000000'

  return {
    "type": "bubble",
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
              "text": `${_label}${sym}`,
              "weight": "bold",
              "align": "center",
              "size": "5xl",
              "color": rgb,
            }
          ],
          "flex": 2,
          "justifyContent": "center"
        },
        idx < 51 ?
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "message",
                  "label": "Draw",
                  "text": "/draw",
                },
                "color": "#32CD32",
                "style": "primary"
              }
            ],
            "backgroundColor": "#32CD32",
            "cornerRadius": "lg"
          }
          :
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "message",
                  "label": "Shuffle",
                  "text": "/shuffle",
                },
                "style": "secondary",
                "color": gray,
              }
            ],
            "backgroundColor": "#32CD32",
            "cornerRadius": "lg"
          }
      ]
    }
  }
}