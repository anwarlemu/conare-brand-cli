<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, type Component } from 'vue'
import { Braces, Database, Search } from 'lucide-vue-next'

// One box for everything (Command.vue, .v2-cmd): documents as you type, namespaces, pages and actions. It opens many
// times a day, from ⌘K, / or the sidebar's search, so it shows and hides without animation. 560px wide, 15vh from the
// top on a page dimmed 24%, square, a hairline, no shadow: the website's dark window by default (`tone: 'dark'`, a
// title bar with the mark and a Search tag, key chips at the foot), or on the paper (`tone: 'light'`). The input
// keeps focus: arrows move the highlighted row (the menus' row with its red square), Enter runs it, Tab stays in the
// box, Escape or a press on the dimmed page closes and focus returns to what opened it. Rows are Menu's rows; the
// highlight follows the arrows and the pointer alike. Documents come from the app: listen for `query` (the text as
// typed; debounce it) and pass `documents` and `searching`. `select` hands back the row picked.
export interface PaletteDocument { id: string, namespace?: string, text?: string, logo?: string | null }
export interface PaletteNamespace { name: string, documents: number, logo?: string | null }
export interface PaletteLink { id?: string, label: string, icon?: Component, href?: string }
export type PalettePick =
  | { kind: 'search', query: string }
  | { kind: 'document', document: PaletteDocument }
  | { kind: 'namespace', namespace: PaletteNamespace }
  | { kind: 'page', page: PaletteLink }
  | { kind: 'action', action: PaletteLink }

const props = withDefaults(defineProps<{
  pages: PaletteLink[]
  actions?: PaletteLink[]
  namespaces?: PaletteNamespace[]
  documents?: PaletteDocument[]
  searching?: boolean
  tone?: 'dark' | 'light'
  title?: string
  placeholder?: string
}>(), { actions: () => [], namespaces: () => [], documents: () => [], tone: 'dark', title: 'Conare', placeholder: 'Search documents, namespaces and pages' })
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ query: [text: string], select: [pick: PalettePick] }>()

const dialog = ref<HTMLDialogElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const text = ref('')
const q = computed(() => text.value.trim())
watch(q, value => emit('query', value))

interface Row { id: string, group: string, label: string, pick: PalettePick, icon?: Component, logo?: string | null, meta?: string, text?: string, mono?: boolean }
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const has = (label: string) => !q.value || label.toLowerCase().includes(q.value.toLowerCase())
const logoOf = (namespace?: string) => props.namespaces.find(n => n.name === namespace)?.logo ?? null
const rows = computed<Row[]>(() => {
  const list: Row[] = []
  if (q.value) {
    list.push({ id: 'search', group: '', label: `Search documents for "${q.value}"`, icon: Search, pick: { kind: 'search', query: q.value } })
    for (const d of props.documents) list.push({ id: `doc:${d.namespace}/${d.id}`, group: 'Documents', label: d.id, mono: true, logo: d.logo ?? logoOf(d.namespace), meta: d.namespace, text: d.text, pick: { kind: 'document', document: d } })
  }
  // With nothing typed, the five largest namespaces, so the pages stay in view.
  const namespaces = props.namespaces.filter(n => has(n.name))
  for (const n of q.value ? namespaces : namespaces.slice(0, 5)) list.push({ id: `ns:${n.name}`, group: 'Namespaces', label: n.name, mono: true, logo: n.logo, meta: compact.format(n.documents), pick: { kind: 'namespace', namespace: n } })
  for (const p of props.pages.filter(p => has(p.label))) list.push({ id: `page:${p.id ?? p.label}`, group: 'Pages', label: p.label, icon: p.icon, pick: { kind: 'page', page: p } })
  for (const a of props.actions.filter(a => has(a.label))) list.push({ id: `act:${a.id ?? a.label}`, group: 'Actions', label: a.label, icon: a.icon, pick: { kind: 'action', action: a } })
  return list
})
const groups = computed(() => {
  const out: Array<{ label: string, rows: Row[] }> = []
  for (const row of rows.value) {
    const last = out.at(-1)
    if (last && last.label === row.group) last.rows.push(row)
    else out.push({ label: row.group, rows: [row] })
  }
  return out
})

// The highlighted row is kept by id, so documents arriving later don't move it.
const activeId = ref('')
const activeIndex = computed(() => Math.max(0, rows.value.findIndex(r => r.id === activeId.value)))
watch(q, () => { activeId.value = '' })
function move(step: number) {
  const n = rows.value.length
  if (!n) return
  activeId.value = rows.value[(activeIndex.value + step + n) % n]!.id
  void nextTick(() => document.getElementById(`ds-cmd-${activeIndex.value}`)?.scrollIntoView({ block: 'nearest' }))
}
function run(row: Row | undefined) {
  if (!row) return
  emit('select', row.pick)
  if (row.pick.kind !== 'search') open.value = false
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
  else if (event.key === 'Enter') { event.preventDefault(); run(rows.value[activeIndex.value]) }
  // Focus stays in the box: the rows are reached by arrows, not Tab.
  else if (event.key === 'Tab') event.preventDefault()
}

let returnTo: HTMLElement | null = null
function show() {
  const d = dialog.value
  if (!d || d.open) return
  returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
  d.showModal()
  input.value?.focus()
}
watch(open, async (now) => {
  await nextTick()
  if (now) show()
  else {
    if (dialog.value?.open) dialog.value.close()
    text.value = ''
    returnTo?.focus({ preventScroll: true })
  }
})
onMounted(() => { if (open.value) show() })
// The dialog's own Escape (cancel) and a press on the dimmed page, which lands on the dialog element itself.
function onCancel(event: Event) {
  event.preventDefault()
  open.value = false
}
function onDown(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}
</script>

<template>
  <dialog data-ds="command-palette" ref="dialog" class="ds-cmd" :data-tone="tone" aria-label="search and jump" @cancel="onCancel" @mousedown="onDown">
    <div v-if="tone === 'dark'" class="ds-cmd-bar" aria-hidden="true">
      <slot name="mark" />
      <span>{{ title }}</span><span class="ds-cmd-tag">Search</span>
    </div>
    <label class="ds-cmd-box">
      <Search :size="14" :stroke-width="1.5" class="ds-cmd-muted shrink-0" aria-hidden="true" />
      <input
        ref="input"
        v-model="text"
        enterkeyhint="search"
        role="combobox"
        aria-controls="ds-cmd-list"
        aria-autocomplete="list"
        aria-expanded="true"
        :aria-activedescendant="rows.length ? `ds-cmd-${activeIndex}` : undefined"
        :placeholder="placeholder"
        :aria-label="placeholder.toLowerCase()"
        autocomplete="off"
        spellcheck="false"
        @keydown="onKey"
      >
    </label>
    <div id="ds-cmd-list" class="ds-cmd-list" role="listbox" aria-label="results">
      <div v-for="g in groups" :key="g.label || 'search'" role="group" :aria-label="g.label || undefined">
        <p v-if="g.label" class="ds-cmd-label" aria-hidden="true">{{ g.label }}<span v-if="g.label === 'Documents' && searching">Searching</span></p>
        <div
          v-for="row in g.rows"
          :id="`ds-cmd-${rows.indexOf(row)}`"
          :key="row.id"
          role="option"
          class="ds-cmd-row"
          :data-doc="row.text ? true : undefined"
          :aria-selected="rows.indexOf(row) === activeIndex"
          :data-active="rows.indexOf(row) === activeIndex || undefined"
          @mousemove="activeId = row.id"
          @click="run(row)"
        >
          <img v-if="row.logo" :src="row.logo" alt="" width="14" height="14" class="size-3.5 shrink-0 object-contain">
          <component :is="row.icon" v-else-if="row.icon" :size="14" :stroke-width="1.5" class="ds-cmd-muted shrink-0" aria-hidden="true" />
          <Braces v-else-if="row.group === 'Documents'" :size="14" :stroke-width="1.5" class="ds-cmd-muted shrink-0" aria-hidden="true" />
          <Database v-else :size="14" :stroke-width="1.5" class="ds-cmd-muted shrink-0" aria-hidden="true" />
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="flex min-w-0 items-baseline gap-2">
              <span v-if="row.text && row.meta" class="ds-cmd-muted shrink-0 type-code-sm">{{ row.meta }}</span>
              <span class="truncate" :class="row.mono && 'type-code-sm'">{{ row.label }}</span>
            </span>
            <span v-if="row.text" class="ds-cmd-muted truncate type-meta">{{ row.text }}</span>
          </span>
          <span v-if="row.meta && !row.text" class="ds-cmd-muted min-w-10 text-right text-meta tabular-nums">{{ row.meta }}</span>
        </div>
      </div>
      <p v-if="!rows.length" class="ds-cmd-muted px-3.5 py-2 type-meta">Nothing matches "{{ q }}".</p>
    </div>
    <div v-if="tone === 'dark'" class="ds-cmd-foot" aria-hidden="true">
      <span class="ds-cmd-key">↑↓ move</span><span class="ds-cmd-key">↵ open</span><span class="ds-cmd-key">esc close</span>
    </div>
  </dialog>
</template>

<style>
/* No transition or animation anywhere: it opens and closes at once. */
.ds-cmd { position: fixed; inset: 15vh auto auto 50%; display: none; width: min(var(--ds-layout-palette), calc(100vw - 32px)); max-width: none; max-height: none; flex-direction: column; margin: 0; padding: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); overscroll-behavior: contain; transform: translateX(-50%); }
.ds-cmd[open] { display: flex; }
.ds-cmd::backdrop { background: var(--ds-color-scrim-palette); }
.ds-cmd-muted { color: var(--ds-color-fg-muted); }
.ds-cmd-box { display: flex; height: 44px; flex-shrink: 0; align-items: center; gap: var(--ds-space-md); padding: 0 14px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-cmd-box input { min-width: 0; flex: 1; background: transparent; color: inherit; font-size: var(--ds-text-body); outline: none; }
.ds-cmd-box input::placeholder { color: var(--ds-color-fg-muted); }
/* iOS zooms into a field under 16px. */
@media (pointer: coarse), (max-width: 767px) { .ds-cmd-box input { font-size: var(--ds-text-input); } }
.ds-cmd-list { max-height: min(400px, 60vh); overflow-y: auto; overscroll-behavior: contain; padding: var(--ds-space-xs); }
.ds-cmd-label { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-md); padding: 6px 10px 4px 14px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
.ds-cmd-row { position: relative; display: flex; height: var(--ds-size-control-md); align-items: center; gap: var(--ds-space-md); padding: 0 10px 0 14px; color: inherit; cursor: pointer; }
.ds-cmd-row::before { position: absolute; top: 50%; left: 5px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; }
.ds-cmd-row[data-active] { background: var(--ds-color-surface-subtle); }
.ds-cmd-row[data-active]::before { opacity: 1; }
.ds-cmd-row[data-doc] { height: auto; min-height: 44px; padding-top: 6px; padding-bottom: 6px; }
.ds-cmd-foot { display: flex; align-items: center; gap: var(--ds-space-sm); padding: 8px 12px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-cmd-key { padding: 1px 6px; background: var(--ds-color-surface-subtle); }
/* The website's dark window (console2.css .v2-cmd[data-skin="1"]). */
.ds-cmd[data-tone="dark"] { border-color: var(--ds-color-neutral-300); background: var(--ds-color-neutral-100); color: var(--ds-color-off-white); }
.ds-cmd-bar { display: flex; height: 40px; flex-shrink: 0; align-items: center; gap: var(--ds-space-md); padding: 0 16px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-neutral-300); }
.ds-cmd-tag { padding: 1px 6px; background: var(--ds-color-neutral-200); color: var(--ds-color-neutral-600); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-cmd[data-tone="dark"] :is(.ds-cmd-box, .ds-cmd-foot) { border-color: var(--ds-color-neutral-300); }
.ds-cmd[data-tone="dark"] :is(.ds-cmd-muted, .ds-cmd-label, .ds-cmd-foot, .ds-cmd-box input::placeholder) { color: var(--ds-color-neutral-500); }
.ds-cmd[data-tone="dark"] .ds-cmd-row[data-active] { background: var(--ds-color-neutral-200); }
.ds-cmd[data-tone="dark"] .ds-cmd-key { background: var(--ds-color-neutral-200); color: var(--ds-color-neutral-600); }
.ds-cmd[data-tone="dark"] .ds-cmd-row img { filter: invert(1); }
@media (max-width: 767px) { .ds-cmd-foot { display: none; } }
@media (pointer: coarse), (max-width: 767px) { .ds-cmd-row { height: auto; min-height: 44px; } }
</style>
