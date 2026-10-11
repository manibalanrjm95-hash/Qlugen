// Node (build plugin and check scripts): read CMS content straight from disk.
import { readFileSync, readdirSync } from 'node:fs'

const root = new URL('../content/', import.meta.url)

export const readContent = path => JSON.parse(readFileSync(new URL(`${path}.json`, root), 'utf8'))

export const listContent = dir => readdirSync(new URL(`${dir}/`, root))
  .filter(file => file.endsWith('.json'))
  .map(file => `${dir}/${file.slice(0, -'.json'.length)}`)
