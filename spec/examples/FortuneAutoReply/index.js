const ctx = {
  name: 'awaiting_fortune_auto_reply',
}

const fortune_love = [
  'พบรักกะทันหัน หรือมีคนที่คุยที่ไม่คิดว่าจะติดต่อมา ติดต่อมาแบบเซอร์ไพรส์ คุณมีความสุขแต่แป๊บเดียว เพราะคุยๆ แล้วเค้าก็หายไปอีกแล้ว',
  'มีคนคุย แต่ความสัมพันธ์แบบความรักไม่เท่ากัน มีคนใดคนหนึ่งน้อยใจตลอด วันนี้ก็เช่นเดียวกัน',
  'เป็นมิตรภาพแบบเพื่อน ราบรื่นดีค่ะวันนี้ ส่วนใหญ่เป็นเรื่องของการสังสรรค์ในหมู่เพื่อนฝูง',
  'วันนี้มีเหตุให้เสียเงิน ใครยังโสด ต้องระวังรักไม่เปิดเผยสถานะ หากรู้ว่าตัวเองเป็นรักซ้อน หรือเป็นตัวสำรอง ถ้าคุณไม่เขยิบออกมา คุณจะต้องเสียใจช้ำใจ',
  'ระวังคนรักเก่าติดต่อมา มีผลกระทบกับคนรักคนปัจจุบัน คงไม่มีใครอยากเห็นแฟนเก่ากลับมาอี๋อ๋ออีกหรอกนะคะ',
  'นก',
]

const random_append_int = [
  { $juxt: [[
    { $randInt: [5]},
    '$identity',
  ]]},
  { $apply: ['$append']},
]

const fortune_auto_reply = {
  name: 'fortune_auto_reply',
  type: 'text',
  startswith: '/love',
  sub: {
    ctx,
    do: [{ type: 'context', ctx: { name: '_purge' }}],
  },
  pipe: [
    { $$mapPipe: [
      { $always: [[]] },
      ...random_append_int,
      ...random_append_int,
      ...random_append_int,
      { $map: [{
        $compose: [
          { $call: [{ $flip: [ '$nth'] }, fortune_love ] },
        ],
      }]},
    ]},
  ],
  do: [
    {
      type: 'text',
      text: 'เลือกเซียมซี quick reply ได้เลยค่ะ',
    },
    {
      type: 'quick_reply_text',
      label: 'เซียมซี 1',
      paths: { text: [0] },
    },
    {
      type: 'quick_reply_text',
      label: 'เซียมซี 2',
      paths: { text: [1] },
    },
    {
      type: 'quick_reply_text',
      label: 'เซียมซี 3',
      paths: { text: [2] },
    },
  ],
  next: {
    to: ctx,
  },
}

module.exports = fortune_auto_reply