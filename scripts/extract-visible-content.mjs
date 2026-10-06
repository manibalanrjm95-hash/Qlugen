import fs from 'node:fs'
import path from 'node:path'
import * as parser from '@babel/parser'
import traverseModule from '@babel/traverse'
import generateModule from '@babel/generator'
import * as t from '@babel/types'

const traverse = traverseModule.default || traverseModule
const generate = generateModule.default || generateModule
const files = process.argv.slice(2)

const categoryFor = file => {
  if (file.includes(`${path.sep}capabilities${path.sep}`)) return 'capabilities'
  if (file.includes(`${path.sep}industries${path.sep}`)) return 'industries'
  if (file.includes(`${path.sep}agentic${path.sep}`)) return 'agentic-ai'
  if (file.includes(`${path.sep}insights${path.sep}`)) return 'insights'
  if (file.includes(`${path.sep}company${path.sep}`)) return 'company'
  if (file.endsWith(`${path.sep}HowWeWork.jsx`)) return 'how-we-work'
  if (file.endsWith(`${path.sep}Technology.jsx`)) return 'technology'
  if (file.includes(`${path.sep}legal${path.sep}`)) return 'legal'
  return 'pages'
}

const slugFor = file => path.basename(file, '.jsx')
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .toLowerCase()

const jsonPathFor = file => {
  const category = categoryFor(file)
  const slug = slugFor(file)
  const overviewNames = new Set(['capabilities-overview', 'industries-overview', 'agentic-overview', 'insights-overview', 'company'])
  if (category === 'how-we-work') return 'src/content/how-we-work.json'
  if (category === 'technology') return 'src/content/technology.json'
  if (category === 'legal') return `src/content/legal/${slug}.json`
  if (overviewNames.has(slug)) return `src/content/${category}/overview.json`
  const detailDir = category === 'company' ? 'pages' : 'details'
  return `src/content/${category}/${detailDir}/${slug}.json`
}

const importPathFor = (file, jsonPath) => {
  let rel = path.relative(path.dirname(file), jsonPath).replaceAll(path.sep, '/')
  if (!rel.startsWith('.')) rel = `./${rel}`
  return rel
}

const keyBase = value => value
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 48) || 'content'

const shouldExtract = value => {
  const text = value.trim()
  if (text.length < 2) return false
  if (/^[{}()[\].,;:+*/<>=!?|-]+$/.test(text)) return false
  if (/^(true|false|null|undefined)$/i.test(text)) return false
  if (/^var\(--/.test(text)) return false
  if (/^#[0-9a-f]{3,8}$/i.test(text)) return false
  if (/^rgba?\(/i.test(text)) return false
  if (/^\d+(\.\d+)?(rem|px|vw|vh|%)?$/.test(text)) return false
  return /[A-Za-z0-9]/.test(text)
}

const contentObjectKeys = new Set([
  'eyebrow', 'title', 'heading', 'subheading', 'description', 'desc', 'body',
  'label', 'tag', 'date', 'readTime', 'excerpt', 'num', 'name', 'role', 'bio',
  'quote', 'author', 'stat', 'value', 'text', 'placeholder', 'helperText',
  'successText', 'errorText', 'ctaLabel', 'btnText', 'btnLabel', 'image',
  'img', 'heroImage', 'mediaPoster', 'alt', 'imageAlt', 'logo', 'logoAlt'
])

const jsxTextParents = new Set([
  'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em',
  'li', 'blockquote', 'button', 'label', 'a', 'Link', 'RouterLink', 'Button'
])

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8')
  if (source.includes('/* cms-extracted */')) continue

  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['jsx'],
  })

  const data = {}
  const counts = new Map()
  const add = value => {
    const clean = value.trim().replace(/\s+/g, ' ')
    let key = keyBase(clean)
    const count = counts.get(key) || 0
    counts.set(key, count + 1)
    if (count) key = `${key}-${count + 1}`
    data[key] = clean
    return t.memberExpression(t.identifier('content'), t.stringLiteral(key), true)
  }

  traverse(ast, {
    StringLiteral(pathRef) {
      const value = pathRef.node.value
      if (!shouldExtract(value)) return
      const parent = pathRef.parent
      if (t.isImportDeclaration(parent) || t.isExportNamedDeclaration(parent)) return
      if (t.isJSXAttribute(parent)) {
        const attrName = parent.name?.name
        if (!['alt', 'aria-label', 'placeholder', 'title', 'src', 'heading', 'sub', 'btnText'].includes(attrName)) return
        pathRef.replaceWith(t.jsxExpressionContainer(add(value)))
        return
      }
      if (t.isObjectProperty(parent)) {
        const key = t.isIdentifier(parent.key) ? parent.key.name : parent.key.value
        if (!contentObjectKeys.has(key)) return
        pathRef.replaceWith(add(value))
      }
    },
    JSXText(pathRef) {
      const value = pathRef.node.value
      if (!shouldExtract(value)) return
      const parentName = pathRef.parent.openingElement?.name
      const tag = t.isJSXIdentifier(parentName) ? parentName.name : ''
      if (!jsxTextParents.has(tag)) return
      pathRef.replaceWith(t.jsxExpressionContainer(add(value)))
    },
  })

  if (Object.keys(data).length === 0) continue

  const jsonPath = jsonPathFor(file)
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true })
  fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`)

  const importPath = importPathFor(file, jsonPath)
  ast.program.body.splice(0, 0, t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier('content'))],
    t.stringLiteral(importPath),
  ))
  ast.program.body.splice(0, 0, t.expressionStatement(t.stringLiteral('cms-extracted')))

  source = generate(ast, { jsescOption: { minimal: true } }).code
  fs.writeFileSync(file, source)
}
