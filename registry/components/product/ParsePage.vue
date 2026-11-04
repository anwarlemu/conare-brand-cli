<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, FileUp } from 'lucide-vue-next'
import ParseReading from '@/components/product/ParseReading.vue'
import ScopeMenu, { type ScopeOption } from '@/components/product/ScopeMenu.vue'
import Button from '@/components/ui/Button.vue'
import CodePop from '@/components/ui/CodePop.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import type { ParseAnswer } from '@/composables/useParse'

// Parse as a page (pages/dashboard/parse.vue): drop any file and see what Conare read, region by region. Nothing is
// stored. A row of files to try and one of your own (a press or a drop; the row takes a red dashed edge while a file is
// dragged over it), the picked one with a 2px red line along its top and the dot matrix while it reads. Then the reading
// (ParseReading, `version` picks the take), and what comes next: into a namespace (scope-menu, one must be chosen),
// the Markdown, or the API call opening in place (code-pop). The app reads the file: it answers `choose` and `file` and passes the `answer`.
export interface ParseSampleFile { id: string, what: string, line: string, pages: number }
const props = withDefaults(defineProps<{ samples: ParseSampleFile[], answer: ParseAnswer | null, reading?: boolean, version?: 1 | 2 | 3, namespaces?: ScopeOption[], curl?: string, own?: string }>(), { version: 1, namespaces: () => [], curl: '', own: '' })
const chosen = defineModel<string>('chosen', { required: true })
const emit = defineEmits<{ file: [file: File], add: [namespace: string] }>()

const dragging = ref(false)
const input = ref<HTMLInputElement | null>(null)
function take(files: FileList | null | undefined) {
  const f = files?.[0]
  if (f) emit('file', f)
}
function drop(event: DragEvent) {
  dragging.value = false
  take(event.dataTransfer?.files)
}
const into = ref(props.namespaces[0]?.name ?? '')
const added = ref(false)
watch(() => props.answer?.id, () => { added.value = false })
function add() {
  added.value = true
  emit('add', into.value)
}
</script>

<template>
  <div class="ds-parsefiles grid grid-cols-4 gap-2 max-lg:grid-cols-2" :data-drag="dragging || undefined" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="drop">
    <button v-for="s in samples" :key="s.id" type="button" class="ds-parsefile" :aria-pressed="chosen === s.id" @click="chosen = s.id">
      <span class="min-w-0">
        <span class="block truncate type-ui-strong">{{ s.what }}</span>
        <span class="block truncate type-meta text-fg-muted">{{ s.line }}, {{ s.pages }} {{ s.pages === 1 ? 'page' : 'pages' }}</span>
      </span>
      <DotMatrix v-if="chosen === s.id && reading" />
      <Check v-else-if="chosen === s.id" :size="14" :stroke-width="1.5" class="shrink-0 max-sm:hidden" aria-hidden="true" />
    </button>
    <button type="button" class="ds-parsefile" @click="input?.click()">
      <span class="min-w-0">
        <span class="block truncate type-ui-strong">Your file</span>
        <span class="block truncate type-meta text-fg-muted">Drop it here</span>
      </span>
      <FileUp :size="14" :stroke-width="1.5" class="shrink-0 max-sm:hidden" aria-hidden="true" />
    </button>
    <input ref="input" type="file" class="sr-only" tabindex="-1" aria-label="choose a file to parse" @change="take(($event.target as HTMLInputElement).files)">
  </div>

  <p v-if="!answer" class="type-meta text-fg-muted">Reading.</p>
  <template v-else>
    <ParseReading :key="answer.id + answer.name" :answer="answer" :version="version" />
    <div class="flex flex-wrap items-center gap-2">
      <p v-if="added" class="inline-flex items-center gap-1.5 type-meta" role="status"><Check :size="12" :stroke-width="2" aria-hidden="true" />Added to <span class="font-code">{{ into }}</span></p>
      <template v-else-if="namespaces.length">
        <ScopeMenu v-model="into" :options="namespaces" single />
        <Button press :disabled="!into" @click="add">Add to namespace</Button>
      </template>
      <CopyButton :text="answer.markdown" label="Copy Markdown" class="ml-auto" />
      <CodePop v-if="curl" :code="curl" label="API call" title="Parse this file from your code" />
    </div>
    <p v-if="own && answer.name === own" class="type-meta text-fg-muted">This shows a sample reading, not your file.</p>
  </template>
</template>

<style>
.ds-parsefiles { outline: var(--ds-border-hairline) dashed transparent; outline-offset: 4px; transition: outline-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parsefiles[data-drag] { outline-color: var(--ds-color-edge-accent); }
.ds-parsefile { position: relative; display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: var(--ds-space-md); padding: 8px 12px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); text-align: left; cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parsefile::before { position: absolute; inset: -1px -1px auto; height: 2px; background: var(--ds-color-surface-accent); content: ""; transform: scaleX(0); transform-origin: left; transition: transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-parsefile[aria-pressed="true"] { background: var(--ds-color-surface-subtle); }
.ds-parsefile[aria-pressed="true"]::before { transform: scaleX(1); }
.ds-parsefile:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
.ds-parsefile:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
@media (hover: hover) and (pointer: fine) { .ds-parsefile:hover { background: var(--ds-color-surface-subtle); } }
@media (prefers-reduced-motion: reduce) { .ds-parsefile::before { transition: none; } }
</style>
