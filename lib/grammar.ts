import ohm from "npm//ohm-js"

import { logger } from "./logging.ts"

const log = logger("grm")

const definition = Deno.readTextFileSync("./yavash.ohm")

export interface Program {
  <T>(
    command: string,
    index: number,
  ): T | undefined
}

export const grammar = ohm.grammar(definition)

export const semantics = grammar.createSemantics().addOperation("eval", {
  program: (stmts): Program => {
    const instrs = stmts.children
    log.debug(`parsing ${instrs.length} instructions`)
    const statements = stmts.children
      .map((c) => c.eval())
      .reduce((acc, cur) => ({ ...acc, ...cur }))
    return <T>(command: string, index: number) => {
      if (!Object.prototype.hasOwnProperty.call(statements, command)) {
        return undefined
      }
      const args = statements[command]
      if (args.length < index) {
        return undefined
      }
      return args[index] as T
    }
  },
  instr: (stmt, _end) => stmt.eval(),
  stmt: (ident, params) => {
    const cmd = ident.sourceString
    log.debug(`parsing ${cmd}, ${params.children.length} arg(s)`)
    const args = params.children.map((c) => c.eval())
    return { [cmd]: args }
  },
  params: (_sep, expr) => {
    return expr.eval()
  },
  plain: (expr) => {
    return expr.sourceString
  },
  string(_1, str, _2) {
    return str.sourceString
  },
  numeric_signed(_, num) {
    return +num.sourceString
  },
  numeric_unsigned(num) {
    return +num.sourceString
  },
  // _terminal() {
  //   return this.sourceString
  // },
  // _iter(...children) {
  //   return children.map((c) => c.eval())
  // },
})
