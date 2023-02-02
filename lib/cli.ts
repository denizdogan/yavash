import { defaultPort } from "./constants.ts"
import { run } from "./app.ts"
import { logger } from "./logging.ts"

const log = logger("cli")

export function main() {
  // kill -15 <pid> (default )
  Deno.addSignalListener("SIGTERM", () => {
    log.info("SIGTERM")
    Deno.exit(1)
  })

  // The SIGINT signal is sent to a process by its controlling terminal when a
  // user wishes to interrupt the process. This is typically initiated by
  // pressing Ctrl+C.
  Deno.addSignalListener("SIGINT", () => {
    log.info("SIGINT")
    Deno.exit(1)
  })

  // The SIGABRT and SIGIOT signal is sent to a process to tell it to abort,
  // i.e. to terminate. The signal is usually initiated by the process itself
  // when it calls abort() function of the C Standard Library, but it can be
  // sent to the process from outside like any other signal.
  Deno.addSignalListener("SIGABRT", () => {
    log.info("SIGABRT")
    Deno.exit(0)
  })

  const port = +(Deno.env.get("YAVASH_PORT") || defaultPort)
  log.info(`configured for ${port}`)

  try {
    const options = { port }
    run(options)
  } catch (err: unknown) {
    log.error(`unknown error: ${err}\n`)
    Deno.exit(16)
  }
}
