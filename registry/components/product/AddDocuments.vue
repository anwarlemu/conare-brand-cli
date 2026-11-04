<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import Button from '@/components/ui/Button.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import Tabs from '@/components/ui/Tabs.vue'

// Write first documents from the console: upload files or paste text (the console's AddDocuments.vue). A text file is
// one document (its id from its name); a PDF, Word document, PowerPoint deck or Excel workbook becomes one document
// whose hits cite their page, slide or sheet. It checks the namespace's name and the files' types, then emits `upload`
// or `paste`; the app writes them and passes back `writing`, then `notice` or `error`. `connect` is the way to an app.
export interface PastedDocument { id: string, text: string }
const props = withDefaults(defineProps<{ writing?: boolean, notice?: string, error?: string }>(), { notice: '', error: '' })
const namespace = defineModel<string>('namespace', { default: 'uploads' })
const emit = defineEmits<{ upload: [namespace: string, files: File[]], paste: [namespace: string, doc: PastedDocument], connect: [], browse: [namespace: string] }>()

const mode = ref<'upload' | 'paste'>('upload')
const files = ref<File[]>([])
const pasteId = ref('')
const pasteText = ref('')
const rejected = ref('')
const ids = useId()

const NAMESPACE = /^[a-z0-9][a-z0-9_-]{0,63}$/
const TEXT = /\.(txt|md|markdown|mdx|csv|tsv|json|jsonl|ndjson|html?|xml|ya?ml|log|rst|tex)$/i
const FILE = /\.(pdf|xlsx|docx|docm|dotx|pptx|pptm|potx|ppsx)$/i
const ACCEPT = '.txt,.md,.markdown,.mdx,.csv,.tsv,.json,.jsonl,.ndjson,.html,.htm,.xml,.yaml,.yml,.log,.rst,.tex,text/*,.pdf,application/pdf,.xlsx,.docx,.docm,.dotx,.pptx,.pptm,.potx,.ppsx'
const valid = computed(() => NAMESPACE.test(namespace.value))
const shownError = computed(() => rejected.value || props.error)

// An API document id: a letter or digit first, then A-Z a-z 0-9 . _ : - (240 at most, room for a "-N").
function docId(name: string) {
  return name.replace(/[^A-Za-z0-9._:-]+/g, '-').replace(/^[^A-Za-z0-9]+/, '').replace(/-+$/, '').slice(0, 240) || 'document'
}
function choose(picked: File[]) {
  rejected.value = ''
  const bad = picked.filter(f => !FILE.test(f.name) && !TEXT.test(f.name) && !f.type.startsWith('text/'))
  files.value = picked.filter(f => !bad.includes(f))
  if (bad.length) rejected.value = `${bad.map(f => f.name).join(', ')}: not a file this can read. Upload text (.txt, .md, .csv, .json, .html), PDF, Word (.docx), PowerPoint (.pptx) or Excel (.xlsx).`
}
const dragging = ref(false)
function drop(event: DragEvent) {
  dragging.value = false
  choose(Array.from(event.dataTransfer?.files ?? []))
}
function upload() {
  if (files.value.length && valid.value) emit('upload', namespace.value, files.value)
}
function paste() {
  if (!pasteText.value.trim() || !valid.value) return
  const id = docId(pasteId.value.trim() || `note-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`)
  emit('paste', namespace.value, { id, text: pasteText.value })
}
// Written: the form clears for the next ones.
watch(() => props.notice, (now) => {
  if (!now) return
  files.value = []
  pasteText.value = ''
  pasteId.value = ''
})
</script>

<template>
  <div class="flex flex-col gap-3 text-ui">
    <div class="flex flex-wrap items-center gap-3">
      <Tabs v-model="mode" :options="[{ value: 'upload', label: 'Upload files' }, { value: 'paste', label: 'Paste text' }]" label="how to add documents" />
      <span class="type-meta text-fg-muted">or <button type="button" class="ds-adddocs-link" @click="emit('connect')">connect an app</button></span>
    </div>

    <div class="max-w-xs">
      <Field v-slot="{ id, hintId }" label="Namespace" :error="valid ? undefined : 'Use a-z, 0-9, _ and -, up to 64 characters.'">
        <Input :id="id" v-model="namespace" class="font-code" :aria-describedby="hintId" :invalid="!valid" required autocomplete="off" />
      </Field>
    </div>

    <form v-if="mode === 'upload'" class="flex flex-col gap-3" @submit.prevent="upload">
      <label class="ds-adddocs-drop" :data-drag="dragging || undefined" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="drop">
        <span class="font-medium">{{ files.length ? `${files.length} ${files.length === 1 ? 'file' : 'files'} selected` : 'Choose or drop files' }}</span>
        <span class="text-fg-muted">{{ files.length ? files.map(f => f.name).join(', ') : '.txt, .md, .csv, .json, .html, .pdf, .docx, .pptx, .xlsx. Each file is one document.' }}</span>
        <input type="file" multiple class="sr-only" aria-label="choose files" :accept="ACCEPT" @change="choose(Array.from(($event.target as HTMLInputElement).files ?? []))">
      </label>
      <div><Button type="submit" :disabled="writing || !files.length || !valid">{{ writing ? 'Writing' : 'Add documents' }}</Button></div>
    </form>

    <form v-else class="flex flex-col gap-3" @submit.prevent="paste">
      <div class="max-w-md">
        <Field v-slot="{ id }" label="Id (optional)">
          <Input :id="id" v-model="pasteId" class="font-code" placeholder="refund-policy" maxlength="240" autocomplete="off" />
        </Field>
      </div>
      <div class="flex flex-col gap-1.5">
        <label :for="`${ids}-text`" class="type-meta text-fg-soft">Text</label>
        <textarea :id="`${ids}-text`" v-model="pasteText" class="ds-adddocs-text" rows="6" placeholder="Refunds are available for 30 days after purchase." required />
      </div>
      <div><Button type="submit" :disabled="writing || !pasteText.trim() || !valid">{{ writing ? 'Writing' : 'Add document' }}</Button></div>
    </form>

    <p v-if="notice" role="status">{{ notice }} <button type="button" class="ds-adddocs-link" @click="emit('browse', namespace)">Browse</button></p>
    <p v-if="shownError" class="bg-surface-danger px-3 py-2 text-fg" role="alert">{{ shownError }}</p>
  </div>
</template>

<style>
.ds-adddocs-drop { display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-xs); padding: 24px 16px; border: var(--ds-border-hairline) dashed var(--ds-color-edge-strong); text-align: center; cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-adddocs-drop:hover { border-color: var(--ds-color-edge-focus); } }
.ds-adddocs-drop[data-drag] { border-color: var(--ds-color-edge-focus); background: var(--ds-color-surface-subtle); }
.ds-adddocs-drop:has(:focus-visible) { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
.ds-adddocs-text { width: 100%; padding: 6px 10px; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); outline: none; resize: vertical; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-adddocs-text::placeholder { color: var(--ds-color-fg-muted); }
.ds-adddocs-text:focus { border-color: var(--ds-color-edge-focus); }
.ds-adddocs-link { color: var(--ds-color-fg); text-decoration: underline; text-decoration-color: var(--ds-color-edge-strong); text-underline-offset: 4px; cursor: pointer; transition: text-decoration-color var(--ds-duration-enter) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-adddocs-link:hover { text-decoration-color: var(--ds-color-edge-focus); } }
.ds-adddocs-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
@media (pointer: coarse), (max-width: 767px) { .ds-adddocs-text { font-size: var(--ds-text-input); line-height: var(--ds-text-input-leading); } }
</style>
