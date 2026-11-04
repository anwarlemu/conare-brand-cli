<script setup lang="ts">
import DocsInline from '@/components/site/DocsInline.vue'

// A docs table (docs/Table.vue): ruled rows under a paper head, or none for a key-value table, whose first column is
// set in ink. Cells take DocsInline. It scrolls sideways in its own frame on a phone.
defineProps<{ head?: string[], rows: string[][], label?: string }>()
</script>

<template>
  <div class="ds-docs-table overflow-x-auto border border-edge" role="region" :aria-label="label ?? head?.join(', ') ?? 'table'" tabindex="0">
    <table class="w-full text-left type-body">
      <thead v-if="head" class="bg-surface-subtle text-fg-muted">
        <tr><th v-for="h in head" :key="h" class="px-4 py-3 text-meta font-normal whitespace-nowrap">{{ h }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row[0]">
          <td v-for="(cell, c) in row" :key="c" class="px-4 py-3 align-top" :class="c === 0 ? 'min-w-35 text-fg' : 'text-fg-muted'"><DocsInline :text="cell" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.ds-docs-table tr + tr, .ds-docs-table thead + tbody tr:first-child { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
</style>
