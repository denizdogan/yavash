import * as fc from "npm//fast-check"

import { grammar } from "../lib/grammar.ts"

fc.configureGlobal({ verbose: true, seed: 9000 + 1 })

/**
 * Array of URLs with query parameters, including "__YAVASH__=target:...".
 */
const urlWithYavashTarget = fc.webUrl({ withQueryParameters: true }).map(
  (target: string): string => {
    const url = new URL("https://fakedomain.com")
    url.searchParams.set("__YAVASH__", `target:"${target}"`)
    return url.toString()
  },
)

Deno.bench({
  name: "parse 100 urls",
  fn: (): void => {
    fc.sample(urlWithYavashTarget, 1000).map((str) => {
      const yavash = new URL(str).searchParams.get("__YAVASH__")
      grammar.match(yavash!)
    })
  },
})
