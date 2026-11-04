<script setup lang="ts">
import DocsInline from '@/components/site/DocsInline.vue'

// An endpoint's parameters or fields (docs/Fields.vue), one ruled row each: the name in the mono, its type and
// "required" or its default beside it, then what it is and its limits. A field's own fields sit under it behind a
// toggle, in the same rows a step in; the toggle's plus turns to a minus when open.
export type DocsField = { name: string, type: string, required?: boolean, default?: string, text?: string, notes?: string[], children?: DocsField[] }
defineProps<{ fields: DocsField[], nested?: boolean }>()
</script>

<template>
  <ul class="ds-docs-params flex flex-col" :class="nested && 'border-s border-edge ps-4'">
    <li v-for="f in fields" :key="f.name" class="py-4">
      <p class="flex flex-wrap items-center gap-x-2 gap-y-1 type-code" dir="ltr">
        <span class="font-medium text-fg">{{ f.name }}</span>
        <span class="ds-docs-tag">{{ f.type }}</span>
        <span v-if="f.required" class="ds-docs-tag" data-required>required</span>
        <span v-if="f.default !== undefined" class="ds-docs-tag">default: {{ f.default }}</span>
      </p>
      <p v-if="f.text" class="mt-2 type-body-lg text-fg-muted"><DocsInline :text="f.text" /></p>
      <p v-for="n in f.notes" :key="n" class="mt-1.5 type-ui text-fg-muted"><DocsInline :text="n" /></p>
      <details v-if="f.children" class="ds-docs-more mt-3">
        <summary class="ds-docs-btn inline-flex h-7 cursor-pointer list-none items-center gap-1.5 px-2.5 text-meta leading-4">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" class="ds-docs-sign"><path d="M5 1.5v7M1.5 5h7" /></svg>
          {{ f.children.length }} {{ f.children.length === 1 ? 'field' : 'fields' }}
        </summary>
        <DocsFields :fields="f.children" nested class="mt-2" />
      </details>
    </li>
  </ul>
</template>

<style>
.ds-docs-params > li + li { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-docs-tag { border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); padding: 0 calc(var(--ds-space-xs) + 1px); font-size: var(--ds-text-caption); line-height: 18px; color: var(--ds-color-fg-muted); }
.ds-docs-tag[data-required] { border-color: color-mix(in srgb, var(--ds-color-edge-accent) 40%, transparent); background: var(--ds-color-surface-danger); color: var(--ds-color-edge-accent); }
.ds-docs-btn { border: var(--ds-border-hairline) solid var(--ds-color-edge); color: var(--ds-color-fg); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-docs-btn:hover { background: var(--ds-color-surface-subtle); } }
.ds-docs-more summary::-webkit-details-marker { display: none; }
.ds-docs-more[open] > summary .ds-docs-sign path { d: path("M1.5 5h7"); }
</style>
