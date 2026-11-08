<script setup lang="ts">
import { computed } from 'vue'
import { Check, ChevronDown, Database, Layers } from 'lucide-vue-next'
import Combobox, { type ComboOption } from '@/components/ui/Combobox.vue'

// Where a search looks (ScopeMenu.vue): every namespace, or one. The button is the search bar's 28px chip
// (.v2-scope: a hairline on the paper, ink under the pointer and while open), the namespace in mono once one is
// picked, a 12px chevron that turns over as it opens. The 288px panel lists Every namespace over a hairline, then each
// namespace with its mark (its app's logo, or `ownMark` for a namespace written by API or upload, Conare's own kind),
// its name in mono and its size, the pick checked; a filter shows past six. `single`: a namespace must be chosen (a
// place to put a file), so there is no Every namespace. On Combobox: arrows, typing, Enter and Escape.
export interface ScopeOption { name: string, documents: number, logo?: string | null }
const props = defineProps<{ options: ScopeOption[], single?: boolean, ownMark?: string }>()
const scope = defineModel<string>({ default: '' })

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const total = computed(() => props.options.reduce((a, o) => a + o.documents, 0))
const list = computed<ComboOption[]>(() => [
  ...(props.single ? [] : [{ value: '', label: 'Every namespace', hint: compact.format(total.value), pinned: true }]),
  ...props.options.map(o => ({ value: o.name, label: o.name, hint: compact.format(o.documents) })),
])
const logoOf = (name: string | number) => props.options.find(o => o.name === name)?.logo ?? null
const label = computed(() => scope.value || (props.single ? 'Choose a namespace' : 'every namespace'))
</script>

<template>
  <Combobox data-ds="scope-menu"
    v-model="scope"
    :options="list"
    :label="single ? 'add to' : 'search in'"
    filter="auto"
    filter-label="Filter namespaces"
    width="288px"
    :disabled="!options.length"
    trigger-class="group inline-flex h-control-sm max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui cursor-pointer items-center gap-1.5 border border-edge bg-surface-subtle px-2 text-meta text-fg transition-[border-color] duration-120 ease-standard hover:border-edge-focus aria-expanded:border-edge-focus aria-expanded:bg-surface active:enabled:bg-surface-subtle disabled:cursor-not-allowed disabled:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-edge-focus"
  >
    <template #trigger>
      <img v-if="logoOf(scope)" :src="logoOf(scope)!" alt="" width="12" height="12" class="size-3 object-contain">
      <Database v-else :size="12" :stroke-width="1.5" class="text-fg-muted" aria-hidden="true" />
      <span class="sr-only">{{ single ? 'add to' : 'search in' }}</span>
      <span class="max-w-45 truncate" :class="scope && 'type-code-sm'">{{ label }}</span>
      <ChevronDown :size="12" :stroke-width="1.5" class="text-fg-muted transition-[rotate] duration-120 ease-out group-aria-expanded:rotate-180 group-aria-expanded:duration-180 motion-reduce:transition-none" aria-hidden="true" />
    </template>
    <template #option="{ option, selected }">
      <Database v-if="option.pinned" :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />
      <img v-else-if="logoOf(option.value)" :src="logoOf(option.value)!" alt="" width="14" height="14" class="size-3.5 shrink-0 object-contain">
      <img v-else-if="ownMark" :src="ownMark" alt="" width="14" height="14" class="size-3.5 shrink-0 object-contain">
      <Layers v-else :size="14" :stroke-width="1.5" class="shrink-0 text-fg" aria-hidden="true" />
      <span class="min-w-0 flex-1 truncate" :class="!option.pinned && 'type-code-sm'">{{ option.label }}</span>
      <span class="min-w-10 text-right text-meta text-fg-muted tabular-nums">{{ option.hint }}</span>
      <Check :size="14" :stroke-width="1.5" class="shrink-0" :class="!selected && 'invisible'" aria-hidden="true" />
    </template>
    <template #empty="{ query }">No namespace matches "{{ query }}".</template>
  </Combobox>
</template>
