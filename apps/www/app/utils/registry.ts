import type { Component } from 'vue'
import data from '~/registry.generated.json'

// What the site lists (written by scripts/build-registry.ts) and the sources it shows, read from the registry files.

export interface SiteExample { name: string, label: string, center: boolean, half: boolean }
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

const raw = import.meta.glob(['@/components/**/*.vue', '@/composables/*.ts', '@/examples/*/*.vue'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>
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
export const addCommand = (name: string) => `npx -y ${SOURCE} add ${name}`
