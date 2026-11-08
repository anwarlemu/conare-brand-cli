<script setup lang="ts">
import CodeBlock from '@/components/ui/CodeBlock.vue'
import DocsFields, { type DocsField } from '@/components/site/DocsFields.vue'
import DocsInline from '@/components/site/DocsInline.vue'
import DocsTable from '@/components/site/DocsTable.vue'

// A docs page's body, block by block (docs/Blocks.vue): paragraphs, headings (steps are the smaller ones), lists led
// by a red square, callouts (a warning on the wash), tables, code in the one code window, an endpoint's fields, and the
// link cards, each in the double rule with a pixel pattern that turns red under the pointer. Text takes `code`,
// **bold** and [links](href). `wide` drops the 880px measure, for a page of cards. Follows the theme (data-theme).
export type DocsBlock =
  | { kind: 'p', text: string }
  | { kind: 'h2' | 'h3', id: string, text: string }
  | { kind: 'list', items: string[] }
  | { kind: 'callout', tone: 'note' | 'warning' | 'caution' | (string & {}), text: string }
  | { kind: 'table', head?: string[], rows: string[][] }
  | { kind: 'code', samples: { label: string, code: string }[] }
  | { kind: 'cards', items: { title: string, body: string, href: string }[] }
  | { kind: 'fields', media?: string, fields: DocsField[] }
export type { DocsField }

defineProps<{ blocks: DocsBlock[], wide?: boolean }>()

// The hero tabs' pixel patterns, each a path on a 16px square of 2px cells, centred.
const pattern = (on: (x: number, y: number) => boolean) => {
  const lit: [number, number][] = []
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (on(x, y)) lit.push([x, y])
  const ox = (16 - (Math.max(...lit.map(c => c[0])) + Math.min(...lit.map(c => c[0])) + 1) * 2) / 2
  const oy = (16 - (Math.max(...lit.map(c => c[1])) + Math.min(...lit.map(c => c[1])) + 1) * 2) / 2
  return lit.map(([x, y]) => `M${x * 2 + ox} ${y * 2 + oy}h2v2h-2Z`).join('')
}
const PATTERNS = [
  pattern((x, y) => x % 2 === 0 && y % 2 === 0),
  pattern((x, y) => (x + y) % 3 === 0),
  pattern((x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0),
  pattern((_, y) => y % 2 === 0),
]
</script>

<template>
  <div data-ds="docs-blocks" class="flex flex-col gap-5 text-fg" :class="!wide && 'max-w-220'">
    <template v-for="(b, i) in blocks" :key="i">
      <h2 v-if="b.kind === 'h2'" :id="b.id" class="mt-10 scroll-mt-28 text-docs-heading tracking-tight">{{ b.text }}</h2>
      <h3 v-else-if="b.kind === 'h3'" :id="b.id" class="mt-4 scroll-mt-28 text-heading-4 font-medium">{{ b.text }}</h3>
      <p v-else-if="b.kind === 'p'" class="text-input leading-7 text-fg-muted"><DocsInline :text="b.text" /></p>
      <ul v-else-if="b.kind === 'list'" class="flex flex-col gap-2 text-input leading-7 text-fg-muted">
        <li v-for="t in b.items" :key="t" class="flex gap-3">
          <span aria-hidden="true" class="mt-2.75 size-1.5 shrink-0 bg-edge-accent" />
          <span><DocsInline :text="t" /></span>
        </li>
      </ul>
      <div v-else-if="b.kind === 'callout'" class="ds-docs-callout flex gap-3 px-4 py-3 type-body-lg" :data-tone="b.tone">
        <span aria-hidden="true" class="mt-2.25 size-1.5 shrink-0 bg-edge-accent" />
        <span><DocsInline :text="b.text" /></span>
      </div>
      <DocsTable v-else-if="b.kind === 'table'" :head="b.head" :rows="b.rows" />
      <div v-else-if="b.kind === 'fields'">
        <p v-if="b.media" class="-mt-2 mb-1 type-code-sm text-fg-muted" dir="ltr">{{ b.media }}</p>
        <DocsFields :fields="b.fields" />
      </div>
      <CodeBlock v-else-if="b.kind === 'code'" class="my-2" :samples="b.samples.length > 1 ? b.samples : undefined" :code="b.samples.length > 1 ? undefined : b.samples[0]?.code" :label="b.samples.length > 1 ? undefined : b.samples[0]?.label" />
      <ul v-else-if="b.kind === 'cards'" class="my-4 grid gap-6 sm:grid-cols-2">
        <li v-for="(c, j) in b.items" :key="c.title" class="border border-edge-strong outline outline-offset-4 outline-edge-strong">
          <a :href="c.href" class="ds-docs-card flex h-full flex-col gap-4 p-5">
            <svg width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" class="ds-docs-card-mark"><path :d="PATTERNS[j % 4]" fill="currentColor" /></svg>
            <span>
              <span class="block type-heading-3">{{ c.title }}</span>
              <span class="mt-1 block type-body text-fg-muted"><DocsInline :text="c.body" /></span>
            </span>
          </a>
        </li>
      </ul>
    </template>
  </div>
</template>

<style>
.ds-docs-callout { border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); color: var(--ds-color-fg); }
.ds-docs-callout:is([data-tone="warning"], [data-tone="caution"]) { border-color: color-mix(in srgb, var(--ds-color-edge-accent) 30%, transparent); background: var(--ds-color-surface-danger); }
.ds-docs-card { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-docs-card-mark { color: var(--ds-color-fg-faint); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-docs-card:hover { background: var(--ds-color-surface-subtle); }
  .ds-docs-card:hover .ds-docs-card-mark { color: var(--ds-color-edge-accent); }
}
</style>
