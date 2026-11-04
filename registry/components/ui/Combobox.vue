<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { Check, ChevronsUpDown, Search } from 'lucide-vue-next'
import PopoverPanel from '@/components/ui/PopoverPanel.vue'
import { usePopover, type Align, type Side } from '@/composables/usePopover'

// A list to pick one option from, with a filter over it (ScopeMenu.vue, generalized): Menu's square panel in a
// hairline, 32px rows with the red square marker on the row the arrows or the pointer are on, the pick checked at the
// end. The filter is the console's 28px field with its 12px glyph (.v2-input-icon); `filter: 'auto'` shows it past
// six options, as the scope menu does, and `false` makes it a plain listbox (Select). `pinned` options stay above a
// hairline and are never filtered ("Every namespace"). Arrows, Home and End move, Enter picks, typing filters (or,
// with no filter, jumps to the option it starts), Escape closes and returns focus to the trigger. The panel portals,
// flips and stays inside the viewport. Slots: `trigger` (the button's content), `option`, `empty`.
defineOptions({ inheritAttrs: false })
export interface ComboOption { value: string | number, label: string, hint?: string, disabled?: boolean, pinned?: boolean }
const props = withDefaults(defineProps<{
  options: ComboOption[]
  label: string
  placeholder?: string
  filter?: boolean | 'auto'
  filterLabel?: string
  width?: string
  side?: Side
  align?: Align
  matchWidth?: boolean
  triggerClass?: string
  disabled?: boolean
}>(), { placeholder: 'Choose', filter: true, filterLabel: 'Filter', side: 'bottom', align: 'start' })
const model = defineModel<string | number>({ default: '' })
const emit = defineEmits<{ select: [option: ComboOption] }>()

const pop = usePopover({ side: props.side, align: props.align, matchWidth: props.matchWidth, gap: 4 })
const id = `combobox-${useId()}`
const query = ref('')
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)

const filtering = computed(() => props.filter === 'auto' ? props.options.filter(o => !o.pinned).length > 6 : props.filter)
const selected = computed(() => props.options.find(o => o.value === model.value))
const pinned = computed(() => props.options.filter(o => o.pinned))
const rest = computed(() => {
  const q = query.value.trim().toLowerCase()
  const all = props.options.filter(o => !o.pinned)
  return q ? all.filter(o => o.label.toLowerCase().includes(q)) : all
})
const visible = computed(() => [...pinned.value, ...rest.value])
const optionId = (i: number) => `${id}-${i}`

function enabled(i: number) { return !visible.value[i]?.disabled }
function move(to: number, step = 1) {
  const n = visible.value.length
  if (!n) return
  for (let k = 0; k < n; k++) {
    const i = ((to + k * step) % n + n) % n
    if (enabled(i)) {
      active.value = i
      void nextTick(() => document.getElementById(optionId(i))?.scrollIntoView({ block: 'nearest' }))
      return
    }
  }
}
watch(query, () => move(0))

async function open(keyboard: boolean) {
  query.value = ''
  await pop.show({ keyboard })
  const at = visible.value.findIndex(o => o.value === model.value)
  move(at >= 0 ? at : 0)
  await nextTick()
  ;(filtering.value ? input.value : list.value)?.focus({ preventScroll: true })
}
function pick(option: ComboOption | undefined, keyboard: boolean) {
  if (!option || option.disabled) return
  model.value = option.value
  emit('select', option)
  pop.hide(true, keyboard)
}
function onTrigger(event: MouseEvent) {
  if (pop.open.value) pop.hide(false, event.detail === 0)
  else void open(event.detail === 0)
}
function onTriggerKey(event: KeyboardEvent) {
  if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !pop.open.value) {
    event.preventDefault()
    void open(true)
  }
}
// With no filter, typing jumps to the option that starts with what was typed in the last half second.
let typed = ''
let typedAt = 0
function onKey(event: KeyboardEvent) {
  const k = event.key
  if (k === 'ArrowDown' || k === 'ArrowUp') {
    event.preventDefault()
    move(active.value + (k === 'ArrowDown' ? 1 : -1), k === 'ArrowDown' ? 1 : -1)
  }
  else if ((k === 'Home' || k === 'End') && !filtering.value) {
    event.preventDefault()
    move(k === 'Home' ? 0 : visible.value.length - 1, k === 'Home' ? 1 : -1)
  }
  else if (k === 'Enter' || (k === ' ' && !filtering.value)) {
    event.preventDefault()
    pick(visible.value[active.value], true)
  }
  else if (!filtering.value && k.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const now = Date.now()
    typed = now - typedAt > 500 ? k.toLowerCase() : typed + k.toLowerCase()
    typedAt = now
    const i = visible.value.findIndex(o => !o.disabled && o.label.toLowerCase().startsWith(typed))
    if (i >= 0) move(i)
  }
}
const activeId = computed(() => (pop.open.value && visible.value.length ? optionId(active.value) : undefined))
</script>

<template>
  <button
    v-bind="$attrs"
    :ref="(el) => { pop.anchor.value = el as HTMLElement | null }"
    type="button"
    :class="triggerClass ?? 'group inline-flex h-control-md w-full min-w-0 cursor-pointer items-center gap-2 border border-edge-strong bg-surface px-2.5 text-left text-ui text-fg outline-none transition-[border-color] duration-120 ease-standard focus-visible:border-edge-focus aria-expanded:border-edge-focus disabled:cursor-not-allowed disabled:text-fg-muted max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch'"
    aria-haspopup="listbox"
    :aria-expanded="pop.open.value"
    :aria-controls="pop.open.value ? `${id}-list` : undefined"
    :aria-label="label"
    :disabled="disabled"
    @click="onTrigger"
    @keydown="onTriggerKey"
  >
    <slot name="trigger" :selected="selected" :open="pop.open.value">
      <span class="min-w-0 flex-1 truncate" :class="!selected && 'text-fg-muted'">{{ selected?.label ?? placeholder }}</span>
      <ChevronsUpDown :size="12" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />
    </slot>
  </button>
  <PopoverPanel :pop="pop" class="flex flex-col p-1" :style="{ width }">
    <label v-if="filtering" class="relative mb-1 block">
      <Search :size="12" :stroke-width="1.5" class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
      <input
        ref="input"
        v-model="query"
        class="h-control-sm w-full border border-edge-strong bg-surface pr-2.5 pl-7 text-meta text-fg outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus max-md:h-control-touch max-md:text-input"
        role="combobox"
        :aria-label="filterLabel"
        :placeholder="filterLabel"
        aria-autocomplete="list"
        aria-expanded="true"
        :aria-controls="`${id}-list`"
        :aria-activedescendant="activeId"
        autocomplete="off"
        spellcheck="false"
        @keydown="onKey"
      >
    </label>
    <div
      :id="`${id}-list`"
      ref="list"
      role="listbox"
      :aria-label="label"
      :tabindex="filtering ? -1 : 0"
      :aria-activedescendant="filtering ? undefined : activeId"
      class="flex max-h-65 flex-col overflow-y-auto outline-none"
      @keydown="onKey"
    >
      <template v-for="(o, i) in visible" :key="`${o.pinned ? 'p' : 'o'}-${o.value}`">
        <div v-if="i === pinned.length && pinned.length && rest.length" class="-mx-1 my-1 h-px shrink-0 bg-edge" role="separator" />
        <div
          :id="optionId(i)"
          role="option"
          class="ds-option"
          :aria-selected="o.value === model"
          :aria-disabled="o.disabled || undefined"
          :data-active="i === active || undefined"
          @pointermove="!o.disabled && (active = i)"
          @mousedown.prevent
          @click="pick(o, false)"
        >
          <slot name="option" :option="o" :selected="o.value === model">
            <span class="min-w-0 flex-1 truncate">{{ o.label }}</span>
            <span v-if="o.hint" class="min-w-10 text-right text-meta text-fg-muted tabular-nums">{{ o.hint }}</span>
            <Check :size="14" :stroke-width="1.5" class="shrink-0" :class="o.value !== model && 'invisible'" aria-hidden="true" />
          </slot>
        </div>
      </template>
      <p v-if="!rest.length && query" class="px-3.5 py-2 type-meta text-fg-muted"><slot name="empty" :query="query">Nothing matches "{{ query }}".</slot></p>
    </div>
  </PopoverPanel>
</template>

<style>
/* A row of a listbox: Menu's row (console2.css .v2-menu-item). The highlight follows the arrows and the pointer alike,
   as in the command palette, so hover itself draws nothing. */
.ds-option { position: relative; display: flex; height: var(--ds-size-control-md); flex-shrink: 0; align-items: center; gap: var(--ds-space-md); padding: 0 10px 0 14px; color: var(--ds-color-fg); font-size: var(--ds-text-ui); cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-option::before { position: absolute; top: 50%; left: 5px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-option[data-active] { background: var(--ds-color-surface-subtle); }
.ds-option[data-active]::before { opacity: 1; }
.ds-option[aria-disabled="true"] { color: var(--ds-color-fg-muted); cursor: not-allowed; }
@media (pointer: coarse), (max-width: 767px) { .ds-option { height: auto; min-height: 44px; } }
</style>
