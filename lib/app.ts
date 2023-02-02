import { pipe } from "npm//iter-ops"

import { logger } from "./logging.ts"
import { minDelay, parse, proxy, receive, rescue, send } from "./ops.ts"
import { ServerOptions } from "./types.ts"

const log = logger("app")

export async function run(options: ServerOptions) {
  const chain = pipe(
    listen(options),
    receive,
    parse,
    minDelay,
    proxy,
    send,
    rescue,
  )

  for await (const _ of chain) {
    log.trace("request processed")
  }
}

function listen({ port }: ServerOptions): Deno.Listener {
  const listener = Deno.listen({ port })
  log.info(`listening on port ${port}`)
  return listener
}
