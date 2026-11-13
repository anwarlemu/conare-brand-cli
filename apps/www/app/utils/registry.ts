import type { Component } from 'vue'
import data from '~/registry.generated.json'

// What the site lists (written by scripts/build-registry.ts) and the sources it shows, read from the registry files.

export interface SiteExample { name: string, label: string, center: boolean, half: boolean }
export interface SiteReact { files: string[], dependencies: string[], requires: string[] }
export interface SiteElements { files: string[], tag: string, tags: string[], modules: string[], requires: string[] }
export interface SiteItem {
  name: string
  title: string
  group: string
  description: string
  use_for: string
  never: string[]
  source: string
  body: string
  requires: string[]
  dependencies: string[]
  files: string[]
  examples: SiteExample[]
  flavors: { react?: SiteReact, elements?: SiteElements }
}

export const groups = data.groups as Record<string, string>
export const items = (data.items as SiteItem[]).slice().sort((a, b) => a.title.localeCompare(b.title))
export const findItem = (name: string) => items.find(i => i.name === name)

/** Groups A to Z, each with its items A to Z. */
export const grouped = () => Object.entries(groups)
  .map(([id, label]) => ({ id, label, items: items.filter(i => i.group === id) }))
  .filter(g => g.items.length)
  .sort((a, b) => a.label.localeCompare(b.label))

/** Items in the rail's order, for previous and next. */
export const ordered = () => grouped().flatMap(g => g.items)

const raw = import.meta.glob(['@/components/**/*.vue', '@/composables/*.ts', '@/examples/*/*.vue', '@/react/**/*.ts', '@/react/**/*.tsx', '@/elements/components/**/*.ts', '@/elements/components/**/*.css', '@/elements/controllers/*.ts', '@/elements/examples/*/*.html'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>
/** The source of a registry file, by its registry path (components/ui/Button.vue). */
export function sourceOf(path: string): string {
  const key = Object.keys(raw).find(k => k.endsWith(`/registry/${path}`) || k === `@/${path}` || k.endsWith(`/${path}`))
  return key ? raw[key]! : ''
}

export const exampleComponents = import.meta.glob('@/examples/*/*.vue') as Record<string, () => Promise<{ default: Component }>>
export function exampleLoader(item: string, example: string) {
  const key = Object.keys(exampleComponents).find(k => k.endsWith(`/examples/${item}/${example}.vue`))
  return key ? exampleComponents[key] : undefined
}

export const SOURCE = 'github:anwarlemu/conare-brand-cli#release'
export const elementPrefix = (data as { elementPrefix?: string }).elementPrefix ?? 'ds'
export const assetBase = (data as { assetBase?: string }).assetBase ?? '/ds'

/** The library's three flavors: the Vue source, its React port and its web components. */
export type Flavor = 'vue' | 'react' | 'elements'
export const FLAVORS: { value: Flavor, label: string }[] = [{ value: 'vue', label: 'Vue' }, { value: 'react', label: 'React' }, { value: 'elements', label: 'Web component' }]
export const hasFlavor = (item: SiteItem, flavor: Flavor) => flavor === 'vue' || !!item.flavors?.[flavor]

/** How to add an item: add picks the flavor from the app; --framework names it. */
export const addCommand = (name: string, flavor: Flavor = 'vue') => `npx -y ${SOURCE} add ${name}${flavor === 'vue' ? '' : ` --framework ${flavor}`}`

/** An item's files in a flavor (component sources, then what they import), and its examples' files. */
export function flavorFiles(item: SiteItem, flavor: Flavor) {
  if (flavor === 'react') return { files: item.flavors.react?.files ?? [], examples: item.examples.map(e => `react/examples/${item.name}/${e.name}.tsx`) }
  if (flavor === 'elements') return { files: item.flavors.elements?.files ?? [], examples: item.examples.map(e => `elements/examples/${item.name}/${e.name}.html`) }
  return { files: item.files, examples: item.examples.map(e => `examples/${item.name}/${e.name}.vue`) }
}

/** The tags a page with no build step loads: the brand's stylesheet, then each element module the item needs. */
export function elementTags(item: SiteItem) {
  const el = item.flavors.elements
  if (!el) return ''
  return [`<link rel="stylesheet" href="${assetBase}/brand.css">`, ...el.modules.map(m => `<script type="module" src="${assetBase}/${m}"></script>`)].join('\n')
}
