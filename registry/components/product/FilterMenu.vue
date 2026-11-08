<script setup lang="ts">
import { computed } from 'vue'
import { Check, ListFilter } from 'lucide-vue-next'
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
import MenuLabel from '@/components/ui/MenuLabel.vue'
import MenuSeparator from '@/components/ui/MenuSeparator.vue'

// Every filter in one menu from the search box's bar (search/FilterMenu.vue): the scope chip's button (.v2-scope)
// reading Filters, with a count on ink (.v2-filter-count) once any is on, and a 240px menu of radio groups, each
// under its label. A second press on what is chosen clears it; the menu stays open for the next pick. v-model maps
// each group's key to its value ('' or 0 for none).
export interface FilterGroup { key: string, label: string, options: Array<{ value: string | number, label: string }> }
const props = defineProps<{ groups: FilterGroup[] }>()
const model = defineModel<Record<string, string | number>>({ required: true })
const count = computed(() => props.groups.filter(g => model.value[g.key]).length)
function pick(key: string, value: string | number) {
  model.value = { ...model.value, [key]: model.value[key] === value ? (typeof value === 'number' ? 0 : '') : value }
}
</script>

<template>
  <Menu data-ds="filter-menu"
    label="filters"
    width="240px"
    trigger-class="inline-flex h-control-sm cursor-pointer items-center gap-1.5 border border-edge bg-surface-subtle px-2 text-meta text-fg transition-[border-color] duration-120 ease-standard hover:border-edge-focus aria-expanded:border-edge-focus aria-expanded:bg-surface active:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-edge-focus"
  >
    <template #trigger>
      <ListFilter :size="12" :stroke-width="1.5" class="text-fg-muted" aria-hidden="true" />
      Filters<span v-if="count" class="inline-flex h-4 min-w-4 items-center justify-center bg-surface-inverse px-1 text-caption leading-4 text-fg-inverse tabular-nums">{{ count }}</span>
    </template>
    <div class="flex max-h-88 flex-col overflow-y-auto">
      <template v-for="(g, i) in groups" :key="g.key">
        <MenuSeparator v-if="i" />
        <MenuLabel>{{ g.label }}</MenuLabel>
        <div role="group" :aria-label="g.label" class="flex flex-col">
          <MenuItem v-for="o in g.options" :key="o.value" role="menuitemradio" :aria-checked="model[g.key] === o.value" keep-open @select="pick(g.key, o.value)">
            <span class="min-w-0 flex-1 truncate text-left">{{ o.label }}</span>
            <Check :size="14" :stroke-width="1.5" class="shrink-0" :class="model[g.key] !== o.value && 'invisible'" aria-hidden="true" />
          </MenuItem>
        </div>
      </template>
    </div>
  </Menu>
</template>
