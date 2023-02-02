import { assert } from "std//asserts"
import ohm from "npm//ohm-js"

const grammarSource = Deno.readTextFileSync("yavash.ohm")
const examples = {
  good: Deno.readTextFileSync("tests/data/examples-good.txt").split("\n"),
  bad: Deno.readTextFileSync("tests/data/examples-bad.txt").split("\n"),
}

Deno.test("grammar", async (t1) => {
  await t1.step("parse yavash.ohm", async (t2) => {
    const grammar = ohm.grammar(grammarSource)

    await t2.step("parse examples", async (t3) => {
      for (const text of examples.good) {
        await t3.step(`should succeed: ${text}`, () => {
          const match = grammar.match(text)
          assert(match.succeeded(), match.message)
        })
      }

      for (const text of examples.bad) {
        await t3.step(`should fail: ${text}`, () => {
          const match = grammar.match(text)
          assert(match.failed())
        })
      }
    })
  })
})
