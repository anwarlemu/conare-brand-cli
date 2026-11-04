<script setup lang="ts">
// Rows of one kind of thing. `product` (console2.css .v2-table): a paper head in sentence case, 12px muted; 40px rows
// (48px on phones); IDs in mono, numbers in tabular figures. `settings` (.c-table under the console): the plainer table
// Settings and the audit log share, its first and last columns on a 16px inset and a last column of buttons one width
// (92px). Rows with class `is-link` take the paper fill under the pointer. `framed` puts it in a hairline box that
// scrolls sideways on its own, so a phone never scrolls the page. Write the <thead> and <tbody> in the slot.
withDefaults(defineProps<{ variant?: 'product' | 'settings', framed?: boolean, label?: string }>(), { variant: 'product' })
</script>

<template>
  <div v-if="framed" class="overflow-x-auto border border-edge bg-surface" :role="label ? 'region' : undefined" :aria-label="label" :tabindex="label ? 0 : undefined">
    <table class="ds-table" :data-variant="variant"><slot /></table>
  </div>
  <table v-else class="ds-table" :data-variant="variant"><slot /></table>
</template>

<style>
.ds-table { position: relative; width: 100%; border-collapse: collapse; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-table th { height: var(--ds-size-control-md); padding: 0 12px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-regular); text-align: left; white-space: nowrap; vertical-align: middle; }
.ds-table th.text-right { text-align: right; }
.ds-table td { height: var(--ds-size-row); padding: 4px 12px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); vertical-align: middle; }
.ds-table tbody tr:last-child td { border-bottom: 0; }
.ds-table tbody tr.is-link { cursor: pointer; }
@media (hover: hover) and (pointer: fine) { .ds-table tbody tr.is-link:hover td { background: color-mix(in srgb, var(--ds-color-surface-subtle) 70%, var(--ds-color-off-white)); } }
.ds-table tbody tr.is-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
/* Settings: a 16px inset at both ends, 6px cell padding, heads in sentence case. */
.ds-table[data-variant="settings"] td { padding: 6px 12px; }
.ds-table[data-variant="settings"] :is(th, td):first-child { padding-left: 16px; }
.ds-table[data-variant="settings"] :is(th, td):last-child { padding-right: 16px; }
.ds-table[data-variant="settings"] th::first-letter { text-transform: uppercase; }
.ds-table[data-variant="settings"] td:last-child :is(button, a):only-child { width: 92px; }
@media (pointer: coarse), (max-width: 767px) {
  .ds-table[data-variant="product"] td { height: 48px; }
  .ds-table[data-variant="product"] th { height: var(--ds-size-control-lg); }
}
@media (max-width: 359px) { .ds-table[data-variant="product"] :is(th, td) { padding-inline: 8px; } }
/* Beside a sidebar, a tablet has less room than its width suggests. */
@media (min-width: 768px) and (max-width: 1023px) { .ds-table :is(th, td) { padding-inline: 8px; } }
</style>
