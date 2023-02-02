import { delay } from "std//async"
import {
  catchError,
  flatMap,
  IErrorContext,
  map,
  Operation,
  pipe,
  throttle,
} from "npm//iter-ops"

import { logger } from "./logging.ts"
import { Parsed, Proxied, Received } from "./types.ts"
import { grammar, semantics } from "./grammar.ts"

const log = logger("ops")

class UserError extends Error {
  constructor(public message: string, public requestEvent: Deno.RequestEvent) {
    super(message)
  }
}

function isUserErrorLike(err: Error): err is UserError {
  return (err as UserError).requestEvent !== undefined
}

// make http request contexts out of tcp connections
export const receive: Operation<Deno.Conn, Received> = flatMap(
  (conn: Deno.Conn) =>
    pipe(
      Deno.serveHttp(conn),
      map((e: Deno.RequestEvent): Received => ({
        connection: conn,
        requestEvent: e,
        requestTime: performance.now(),
        history: [],
      })),
    ),
)

// parse the request configuration
export const parse: Operation<Received, Parsed> = map(
  (ctx: Received, _idx, _state): Parsed => {
    const { url } = ctx.requestEvent.request
    log.info(`parsing: ${url}`)
    ctx.history.push({ "X-Yavash-URL": url })
    try {
      const script = new URL(url).searchParams.get("__YAVASH__")!
      const match = grammar.match(script)
      const output = semantics(match).eval()
      return {
        ...ctx,
        program: output,
      }
    } catch (err) {
      log.error(err)
      throw new UserError(err, ctx.requestEvent)
    }
  },
)

// rate limit processing of requests
// "this request must be sent at least minDelay ms after the last request"
export const minDelay: Operation<Parsed, Parsed> = throttle(
  async (ctx, _idx, st) => {
    const minDelay: number = +ctx.program("minDelay", 0)!
    ctx.history.push({ "X-Yavash-MinDelay": String(minDelay) })
    if (isNaN(minDelay)) {
      log.debug("no minDelay")
      return
    }
    log.debug(`minDelay: ${minDelay}ms`)
    let waitTime = 0
    if (st.last === undefined) {
      st.last = 0
    } else {
      waitTime = Math.max(0, minDelay - ctx.requestTime + st.last)
      log.info(`delaying ${waitTime}ms`)
      await delay(waitTime)
    }
    st.last = performance.now()
  },
)

// make the request and wait for the response
export const proxy: Operation<Parsed, Proxied> = map(
  (ctx: Parsed): Proxied => ({
    ...ctx,
    response: new Promise((resolve, reject) => {
      const target: string = ctx.program("target", 0)!
      ctx.history.push({ "X-Yavash-Target": target })
      if (!target) {
        throw new UserError("no target", ctx.requestEvent)
      }
      const request = ctx.requestEvent.request
      const proxyUrl = new URL(target, request.url)
      const proxied = new Request(proxyUrl, request)
      log.debug(`fetching ${proxyUrl}...`)
      return fetch(proxied).then(resolve, reject)
    }),
  }),
)

// transfer a response to the client
export const send: Operation<Proxied, Proxied> = map(
  (ctx) => {
    const { requestEvent, response } = ctx
    log.debug("responding")
    ctx.history.push({ "X-Yavash-Respond-Time": String(performance.now()) })
    const resp = response.then((r) => {
      return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: {
          ...r.headers,
          ...ctx.history.reduce((sum, cur) => ({ ...sum, ...cur }), []),
        },
      })
    })
    requestEvent.respondWith(resp)
    return ctx
  },
)

export const rescue = catchError(
  <T>(err: Error, info: IErrorContext<T>): void => {
    // ctx.index - index of value that threw the error
    // ctx.lastValue - last value successfully received (from the source)
    // ctx.repeats - consecutive error repetition counter
    // ctx.state - error handler state
    // ctx.emit - replace the failed value with a new one
    log.warn(`error at index ${info.index}: ${err.message}`)

    log.error(err)

    if (isUserErrorLike(err)) {
      log.info("found request event")
      err.requestEvent.respondWith(
        new Response(err.message, { status: 400 }),
      )
    }

    if (info.repeats) {
      log.error("repeated error, dropping")
      return
    }

    log.warn("unknown last value, dropping")
  },
)
