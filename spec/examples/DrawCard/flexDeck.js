const { toLabelSym, createNewDeckArray } = require('./cards')

const gray = '#D3D3D3'
const CardComp = (txt, disabled=false) => {
  const [label, sym, color] = toLabelSym(txt)
  const text_color = disabled ? gray : '#000000'
  const sym_color = disabled ? gray : (color === 'red' ? '#FF0000' : '#000000')

  return {
    "type": "box",
    "layout": "horizontal",
    "contents": [
      {
        "type": "text",
        "text": label,
        "align": "center",
        "offsetStart": "sm",
        "color": text_color,
      },
      {
        "type": "text",
        "text": sym,
        "align": "start",
        "color": sym_color,
      }
    ],
    "spacing": "none",
    "margin": "none",
    "offsetEnd": "none"
  }
}

module.exports = ({deck, idx}) => {
  const all_card = createNewDeckArray()
  const graveyard = deck.slice(0, idx+1)
  const remain = 52 - idx - 1

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "box",
          "layout": "horizontal",
          "contents": all_card.map((_sub) => {
            return {
              type: 'box',
              layout: 'vertical',
              contents: _sub.map((x) => {
                return CardComp(x, graveyard.includes(x))
              })
            }
          }),
          "justifyContent": "space-between",
          "alignItems": "flex-start",
          "spacing": "none"
        },
        {
          "type": "text",
          "text": `Remaining: ${remain} Draws`,
          "align": "center",
          "margin": "xl"
        }
      ]
    }
  }
}