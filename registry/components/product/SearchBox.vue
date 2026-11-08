<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { ArrowUp, Check, ClipboardType, CornerDownLeft, FileText, Image, Plug, Plus, X } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
import MenuLabel from '@/components/ui/MenuLabel.vue'
import MenuSeparator from '@/components/ui/MenuSeparator.vue'
import PixelButton from '@/components/ui/PixelButton.vue'

// The search box as Explorer has it (design-system field/Search, console2.css .v2-searchbox, .v2-attach), and the
// library's input group: a field with controls before and after it. The question in a 14px textarea; the files
// attached, each showing adding, then added (or failed); a bar with the plus for more data (files, photos and scans,
// pasted text, an app), the `scope` slot for where it looks, the Enter cue and the red arrow, live once there is a
// question. Enter searches, Shift+Enter breaks the line. Files can be dropped on it. The hairline turns ink while
// anything inside has focus. It calls nothing: it emits `submit`, `files`, `paste`, `connect` and `remove`, and the app
// owns `attached`.
export interface Attachment { key: string, name: string, state: 'adding' | 'added' | 'failed' }
const props = withDefaults(defineProps<{
  attached?: Attachment[]
  label?: string
  placeholder?: string
  /** Where added data goes, named in the add menu. */
  target?: string
  busy?: boolean
  accept?: string
  addMenu?: boolean
}>(), { attached: () => [], label: 'question', placeholder: 'Ask a question your documents answer', target: 'uploads', accept: '.pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.json,.html', addMenu: true })
const question = defineModel<string>({ default: '' })
const emit = defineEmits<{ submit: [question: string], files: [files: File[]], paste: [text: string], connect: [], remove: [key: string] }>()
const id = useId()

const dragging = ref(false)
function onDrop(event: DragEvent) {
  dragging.value = false
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) emit('files', files)
}
const fileInput = ref<HTMLInputElement | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)
function onFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) emit('files', files)
  input.value = ''
}

const pasting = ref(false)
const pasted = ref('')
const pasteArea = ref<HTMLTextAreaElement | null>(null)
function startPaste() {
  pasting.value = true
  nextTick(() => pasteArea.value?.focus())
}
function addPasted() {
  emit('paste', pasted.value.trim())
  pasted.value = ''
  pasting.value = false
}

function submit() {
  if (!question.value.trim() || props.busy) return
  emit('submit', question.value.trim())
}
function onKey(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  submit()
}
</script>

<template>
  <form data-ds="search-box" class="ds-searchbox w-full" role="search" :data-drag="dragging || undefined" @submit.prevent="submit" @dragover.prevent="dragging = true" @dragleave.self="dragging = false" @drop.prevent="onDrop">
    <label class="sr-only" :for="`${id}-q`">{{ label }}</label>
    <textarea :id="`${id}-q`" v-model="question" rows="2" :placeholder="dragging ? 'Drop files to add them' : placeholder" @keydown="onKey" />
    <div v-if="pasting" class="mx-3 mt-1 flex flex-col gap-2 border border-edge bg-surface-subtle p-2">
      <label class="sr-only" :for="`${id}-paste`">text to add</label>
      <textarea :id="`${id}-paste`" ref="pasteArea" v-model="pasted" rows="3" class="w-full resize-none bg-transparent type-ui outline-none placeholder:text-fg-muted" placeholder="Paste a note, an email or a policy" @keydown.esc.stop="pasting = false" />
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="pasting = false">Cancel</Button>
        <PixelButton :disabled="!pasted.trim()" @click="addPasted">Add text</PixelButton>
      </div>
    </div>
    <ul v-if="attached.length" class="flex flex-wrap gap-2 px-3 pt-1" aria-label="attached files">
      <li v-for="a in attached" :key="a.key" class="ds-attach" :data-state="a.state">
        <DotMatrix v-if="a.state === 'adding'" />
        <X v-else-if="a.state === 'failed'" :size="12" :stroke-width="1.5" aria-hidden="true" />
        <Check v-else :size="12" :stroke-width="2" aria-hidden="true" />
        <span class="max-w-50 truncate">{{ a.name }}</span>
        <span class="sr-only">{{ a.state }}</span>
        <button type="button" class="ds-attach-x" :aria-label="`remove ${a.name} from the list`" @click="emit('remove', a.key)"><X :size="12" :stroke-width="1.5" aria-hidden="true" /></button>
      </li>
    </ul>
    <div class="ds-searchbox-bar">
      <template v-if="addMenu">
        <input ref="fileInput" type="file" multiple class="sr-only" tabindex="-1" aria-hidden="true" :accept="accept" @change="onFiles">
        <input ref="photoInput" type="file" multiple class="sr-only" tabindex="-1" aria-hidden="true" accept="image/png,image/jpeg,image/webp,image/tiff" @change="onFiles">
        <Menu label="add data" trigger-label="add data" width="244px" trigger-class="ds-addbtn">
          <template #trigger><Plus :size="14" :stroke-width="1.5" aria-hidden="true" /></template>
          <MenuLabel><span>Add to <span class="font-code">{{ target }}</span></span></MenuLabel>
          <MenuItem @select="fileInput?.click()"><FileText :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" /><span class="flex-1">Files</span><span class="type-meta text-fg-muted">PDF, Word, slides</span></MenuItem>
          <MenuItem @select="photoInput?.click()"><Image :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" /><span class="flex-1">Photos and scans</span></MenuItem>
          <MenuItem @select="startPaste"><ClipboardType :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" /><span class="flex-1">Paste text</span></MenuItem>
          <MenuSeparator />
          <MenuItem @select="emit('connect')"><Plug :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" /><span class="flex-1">Connect an app</span></MenuItem>
        </Menu>
      </template>
      <slot name="scope" />
      <span class="ml-auto hidden items-center gap-1 type-meta text-fg-muted sm:flex"><CornerDownLeft :size="12" :stroke-width="1.5" aria-hidden="true" />to search</span>
      <Button type="submit" variant="primary" icon class="ml-auto sm:ml-0" :disabled="!question.trim() || busy" :aria-label="busy ? 'searching' : 'search'">
        <DotMatrix v-if="busy" tone="inverse" />
        <ArrowUp v-else :size="14" :stroke-width="1.5" aria-hidden="true" />
      </Button>
    </div>
  </form>
</template>

<style>
.ds-searchbox { border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-searchbox:focus-within, .ds-searchbox[data-drag] { border-color: var(--ds-color-edge-focus); }
.ds-searchbox[data-drag] { background: var(--ds-color-surface-subtle); }
.ds-searchbox > textarea { display: block; width: 100%; min-height: 56px; padding: 12px 12px 0; resize: none; background: transparent; color: var(--ds-color-fg); font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); outline: none; }
.ds-searchbox textarea::placeholder { color: var(--ds-color-fg-muted); }
.ds-searchbox-bar { display: flex; align-items: center; gap: var(--ds-space-md); padding: 8px; }
.ds-addbtn { display: inline-flex; width: var(--ds-size-control-sm); height: var(--ds-size-control-sm); align-items: center; justify-content: center; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); color: var(--ds-color-fg); cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-addbtn[aria-expanded="true"] { border-color: var(--ds-color-edge-focus); background: var(--ds-color-surface); }
@media (hover: hover) and (pointer: fine) { .ds-addbtn:hover { border-color: var(--ds-color-edge-focus); } }
.ds-addbtn:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 1px; }
.ds-attach { display: inline-flex; height: 26px; align-items: center; gap: var(--ds-space-sm); padding: 0 2px 0 8px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); font-size: var(--ds-text-meta); animation: ds-attach-in var(--ds-duration-enter) var(--ds-easing-out) both; }
.ds-attach[data-state="added"] > svg:first-child { color: var(--ds-color-fg); }
.ds-attach[data-state="failed"] { border-color: var(--ds-color-home-red-press); color: var(--ds-color-fg-danger); }
.ds-attach-x { display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center; color: var(--ds-color-fg-muted); cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-attach-x:hover { color: var(--ds-color-fg); } }
@keyframes ds-attach-in { from { opacity: 0; transform: translateY(6px); } }
@media (pointer: coarse), (max-width: 767px) {
  .ds-addbtn { width: var(--ds-size-control-touch); height: var(--ds-size-control-touch); }
  .ds-attach-x { position: relative; }
  .ds-attach-x::after { position: absolute; inset: -10px; content: ""; }
}
@media (prefers-reduced-motion: reduce) { .ds-attach { animation-name: ds-attach-fade; } }
@keyframes ds-attach-fade { from { opacity: 0; } }
</style>
