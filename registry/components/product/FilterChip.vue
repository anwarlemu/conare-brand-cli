<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'

// One filter as a menu button under the search box (search/FilterChip.vue, console2.css .v2-scope): "App", or
// "App: Slack" once chosen, with an ink edge while something is chosen or the menu is open. The menu is a radio list on
// Menu's panel, "Any" first (the empty value: '' or 0), a check on the pick. 28px, 40px on phones.
const props = withDefaults(defineProps<{ label: string, any: string, options: Array<{ value: T, label: string }>, width?: string }>(), { width: '200px' })
const model = defineModel<T>({ required: true })
const empty = computed(() => (typeof props.options[0]?.value === 'number' ? 0 : '') as T)
const all = computed(() => [{ value: empty.value, label: props.any }, ...props.options])
const chosen = computed(() => props.options.find(o => o.value === model.value)?.label ?? '')
const trigger = computed(() => [
  'inline-flex h-control-sm cursor-pointer items-center gap-1.5 border px-2 text-meta text-fg whitespace-nowrap transition-[border-color,background-color] duration-120 ease-standard',
  'hover:border-edge-focus active:bg-surface-subtle aria-expanded:border-edge-focus aria-expanded:bg-surface focus-visible:outline-offset-1',
  'max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui',
  chosen.value ? 'border-edge-focus bg-surface' : 'border-edge bg-surface-subtle',
].join(' '))
</script>

<template>
  <Menu :label="label" :width="width" :trigger-class="trigger">
    <template #trigger="{ open }">
      {{ label }}<template v-if="chosen">: <span class="font-medium">{{ chosen }}</span></template>
      <ChevronDown :size="12" :stroke-width="1.5" class="text-fg-muted transition-[rotate] duration-120 ease-out motion-reduce:transition-none" :class="open && 'rotate-180'" aria-hidden="true" />
    </template>
    <div class="flex max-h-75 flex-col overflow-y-auto">
      <MenuItem v-for="o in all" :key="o.value" role="menuitemradio" :aria-checked="model === o.value" @select="model = o.value">
        <span class="min-w-0 flex-1 truncate">{{ o.label }}</span>
        <Check :size="14" :stroke-width="1.5" class="shrink-0" :class="model === o.value ? '' : 'invisible'" aria-hidden="true" />
      </MenuItem>
    </div>
  </Menu>
</template>
