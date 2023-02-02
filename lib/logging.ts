import { TokenReplacer } from "x//optic/formatters"
import { ConsoleStream, Logger } from "x//optic"

export function logger(name: string): Logger {
  const log = new Logger(name)
  const formatter = new TokenReplacer()
    .withFormat("[{logger}] {dateTime} {level} {msg} {metadata}")
    .withDateTimeFormat("YYYY-MM-DD hh:mm:ss.SSS")
    .withLevelPadding(10)
    .withColor()
  log.addStream(new ConsoleStream().withFormat(formatter))

  // disable logging unless we really want it
  if (["0", "false", "no"].includes(Deno.env.get("YAVASH_LOG_ENABLED")!)) {
    log.enabled(false)
  }

  return log
}
