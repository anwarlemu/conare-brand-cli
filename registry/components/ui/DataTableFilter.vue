<script setup lang="ts">
import { computed } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'

// One filter as a menu button over a table (search/FilterChip.vue on .v2-scope): "App", or "App: Slack" once chosen,
// on the paper with a hairline that turns ink under the pointer and while it is on or open. The menu lists "Any"
// first, a check on the pick; choosing closes it.
const props = withDefaults(defineProps<{ label: string, options: string[], any?: string }>(), { any: 'Any' })
const model = defineModel<string>({ default: '' })
const choices = computed(() => [{ value: '', label: props.any }, ...props.options.map(o => ({ value: o, label: o }))])
</script>

<template>
  <Menu :label="label" width="200px" class="ds-filter-wrap" :data-on="model || undefined" trigger-class="ds-filter">
    <template #trigger="{ open }">
      {{ label }}<template v-if="model">: <span class="font-medium">{{ model }}</span></template>
      <ChevronDown :size="12" :stroke-width="1.5" class="ds-filter-chev text-fg-muted" :class="open && 'rotate-180'" aria-hidden="true" />
    </template>
    <MenuItem v-for="c in choices" :key="c.value" :current="model === c.value" @select="model = c.value">
      <span class="min-w-0 flex-1 truncate">{{ c.label }}</span>
      <Check :size="14" :stroke-width="1.5" class="shrink-0" :class="model === c.value ? '' : 'invisible'" aria-hidden="true" />
    </MenuItem>
  </Menu>
</template>

<style>
.ds-filter { display: inline-flex; height: var(--ds-size-control-sm); align-items: center; gap: var(--ds-space-sm); padding: 0 var(--ds-space-md); border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); color: var(--ds-color-fg); font-size: var(--ds-text-meta); white-space: nowrap; cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-filter[aria-expanded="true"], .ds-filter-wrap[data-on] > .ds-filter { border-color: var(--ds-color-edge-focus); background: var(--ds-color-surface); }
@media (hover: hover) and (pointer: fine) { .ds-filter:hover { border-color: var(--ds-color-edge-focus); } }
.ds-filter:active { background: var(--ds-color-surface-subtle); }
.ds-filter:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 1px; }
/* The chevron turns as the menu opens (.v2-chev): quicker to open than to settle. */
.ds-filter-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out); }
.ds-filter-chev.rotate-180 { transition-duration: var(--ds-duration-slide); }
@media (pointer: coarse), (max-width: 767px) { .ds-filter { height: var(--ds-size-control-touch); font-size: var(--ds-text-ui); } }
@media (prefers-reduced-motion: reduce) { .ds-filter-chev { transition: none; } }
</style>
