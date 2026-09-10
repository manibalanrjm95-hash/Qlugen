import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const before = JSON.parse(await readFile('.tmp/heading-audit/before.json', 'utf8'))
const after = JSON.parse(await readFile('.tmp/heading-audit/after.json', 'utf8'))
const differences = []
let checked = 0
for (const [route, original] of Object.entries(before)) {
  const current = after[route]
  assert.ok(current, `Missing route ${route}`)
  const occurrences = new Map()
  for (const node of original.visual) {
    const occurrence = occurrences.get(node.text) || 0
    occurrences.set(node.text, occurrence + 1)
    const replacement = current.visual.filter(item => item.text === node.text)[occurrence]
    if (!replacement) {
      differences.push({ route, text: node.text, issue: 'Missing original text' })
      continue
    }
    checked++
    for (const [property, expected] of Object.entries(node.style)) {
      if (replacement.style[property] !== expected) differences.push({ route, text: node.text, property, before: expected, after: replacement.style[property] })
    }
    for (const dimension of ['width', 'height']) {
      if (Math.abs(node[dimension] - replacement[dimension]) > 0.2) differences.push({ route, text: node.text, property: dimension, before: node[dimension], after: replacement[dimension] })
    }
  }
}
console.log(JSON.stringify({ checked, differences }, null, 2))
assert.equal(differences.length, 0, 'Heading corrections must preserve existing visual styles and dimensions')
