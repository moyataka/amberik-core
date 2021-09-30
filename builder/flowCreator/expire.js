const { of } = require('rxjs')
const pipeCreator = require('../pipeCreator')

const create$ = (d, inst_respond, memoryKeyLens) => {
  const ctx_name = d.ctx.name
  const _pipe = pipeCreator.makePipeExpire(
    memoryKeyLens,
    inst_respond,
  )(ctx_name)

  return (event) => of(event).pipe(_pipe)
}

module.exports = {
  create$,
}