<script setup lang="ts">
import { computed } from 'vue'

// A line of docs text with its `code`, **bold** and [links](href) set (docs/Inline.vue): code in the mono on the
// paper, bold in ink, links in the red with a quiet underline that turns full under the pointer.
const props = defineProps<{ text: string }>()
type Part = { kind: 'text' | 'code' | 'bold', text: string } | { kind: 'link', text: string, href: string }
const parts = computed<Part[]>(() => {
  const out: Part[] = []
  const re = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*/g
  let last = 0
  for (const m of props.text.matchAll(re)) {
    if (m.index > last) out.push({ kind: 'text', text: props.text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ kind: 'code', text: m[1] })
    else if (m[4] !== undefined) out.push({ kind: 'bold', text: m[4] })
    else out.push({ kind: 'link', text: m[2]!, href: m[3]! })
    last = m.index + m[0].length
  }
  if (last < props.text.length) out.push({ kind: 'text', text: props.text.slice(last) })
  return out
})
</script>

<template>
  <template v-for="(p, i) in parts" :key="i">
    <code data-ds="docs-inline" v-if="p.kind === 'code'" dir="ltr" class="ds-docs-code">{{ p.text }}</code>
    <a data-ds="docs-inline" v-else-if="p.kind === 'link'" :href="p.href" class="ds-docs-link">{{ p.text }}</a>
    <strong data-ds="docs-inline" v-else-if="p.kind === 'bold'" class="font-medium text-fg">{{ p.text }}</strong>
    <template v-else>{{ p.text }}</template>
  </template>
</template>

<style>
.ds-docs-code { border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); padding: 0 var(--ds-space-xs); font-family: var(--ds-font-code); font-size: 0.86em; }
.ds-docs-link { color: var(--ds-color-edge-accent); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--ds-color-edge-accent) 40%, transparent); text-underline-offset: 3px; transition: text-decoration-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-docs-link:hover { text-decoration-color: var(--ds-color-edge-accent); } }
</style>
