<script setup lang="ts">
// The subprocessors as a policy page's ruled table (SubprocessorTable.vue, home.css .legal-table): who, what for,
// what data and where, each name linking to its data-processing terms. The double rule frames it; on a phone it
// scrolls sideways inside its frame (a keyboard reaches it too), never the page.
export type Subprocessor = { name: string, terms: string, purpose: string, data: string, location: string }
withDefaults(defineProps<{ rows: readonly Subprocessor[], label?: string }>(), { label: 'subprocessors' })
</script>

<template>
  <div data-ds="subprocessor-table" class="ds-legal-table overflow-x-auto border border-edge outline outline-offset-4 outline-edge" role="region" :aria-label="label" tabindex="0">
    <table class="w-full min-w-160 text-left type-body">
      <thead>
        <tr>
          <th>Subprocessor</th>
          <th>Purpose of processing</th>
          <th>Data categories</th>
          <th>Processing location</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in rows" :key="p.name">
          <td><a :href="p.terms" target="_blank" rel="noopener">{{ p.name }}</a></td>
          <td>{{ p.purpose }}</td>
          <td>{{ p.data }}</td>
          <td>{{ p.location }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.ds-legal-table th { padding: var(--ds-space-lg) var(--ds-space-xl); background: var(--ds-color-surface-subtle); font-family: var(--ds-font-text); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-regular); color: var(--ds-color-fg-muted); white-space: nowrap; }
.ds-legal-table td { padding: var(--ds-space-lg) var(--ds-space-xl); vertical-align: top; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
/* Links in the red, underlined at 40% that turns full under the pointer (home.css .legal a). */
.ds-legal-table a { color: var(--ds-color-fg-accent-display); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--ds-color-fg-accent-display) 40%, transparent); text-underline-offset: 4px; transition: text-decoration-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-legal-table a:hover { text-decoration-color: var(--ds-color-fg-accent-display); } }
</style>
