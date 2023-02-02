import { Program } from "./grammar.ts"

export type ServerOptions = {
  port: number
}

export interface Received {
  connection: Deno.Conn
  requestEvent: Deno.RequestEvent
  requestTime: number
  history: { [key: string]: string }[]
}

export interface Parsed extends Received {
  program: Program
}

export interface Proxied extends Parsed {
  response: Promise<Response>
}
