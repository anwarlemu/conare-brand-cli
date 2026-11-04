<script setup lang="ts">
import { ref } from 'vue'
import { Check, Copy, X } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import AppMark from '@/components/product/AppMark.vue'
import CodePop from '@/components/ui/CodePop.vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import { useCopy } from '@/composables/useCopy'

// The ways data comes in, the fewest clicks first, nothing to name first (the console's namespaces/NewData.vue, take
// 1 with API first, the picks): Send by API leads with one prompt for a coding agent and the request a click away;
// then the likeliest eight apps, each tile's Connect in its corner under the pointer (always there on touch); then one
// quiet line for files, and the whole panel takes a drop. It emits what was picked; the app connects, uploads and
// watches for the first write, passing back `connecting`, `uploading`, `waiting` and `landed`.
export interface App { type: string, name: string, logo?: string | null }
const props = defineProps<{
  apps: App[]
  /** The prompt that sends the documents, and the request it makes. */
  prompt: string
  code: string
  /** Where the first API write lands. */
  namespace: string
  connecting?: string
  uploading?: number
  waiting?: boolean
  landed?: boolean
  error?: string
  /** A close button beside it, where it opens over a page (the namespaces page); Home shows it without. */
  closable?: boolean
}>()
const emit = defineEmits<{ connect: [app: App], files: [files: File[]], copied: [], open: [namespace: string], close: [] }>()
const { copied, copy } = useCopy()
async function copyPrompt() {
  if (await copy(props.prompt)) emit('copied')
}
const picker = ref<HTMLInputElement | null>(null)
const dragging = ref(0)
function dropped(event: DragEvent) {
  dragging.value = 0
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) emit('files', files)
}
function picked(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) emit('files', files)
  input.value = ''
}
</script>

<template>
  <div class="flex items-start gap-3">
  <section class="ds-newdata min-w-0 flex-1" :data-drag="dragging > 0 || undefined" aria-label="add data" @dragenter.prevent="dragging++" @dragover.prevent @dragleave.prevent="dragging--" @drop.prevent="dropped">
    <h3 class="type-ui-strong">Send by API</h3>
    <div class="flex flex-wrap items-center gap-2">
      <PixelButton :done="copied" @click="copyPrompt">
        <span class="ds-newdata-swap" :data-on="copied || undefined">
          <span class="ds-newdata-swap-a"><Copy :size="12" :stroke-width="1.5" aria-hidden="true" />Copy prompt for your agent</span>
          <span class="ds-newdata-swap-b" aria-hidden="true"><Check :size="12" :stroke-width="2" />Copied</span>
        </span>
      </PixelButton>
      <CodePop :code="code" />
    </div>
    <p v-if="waiting" class="flex flex-wrap items-center gap-1.5 type-meta" role="status">
      <template v-if="landed"><Check :size="12" :stroke-width="2" aria-hidden="true" />1 document landed in <span class="type-code-sm">{{ namespace }}</span></template>
      <template v-else><DotMatrix />Waiting for your first document</template>
      <PixelButton v-if="landed" class="ml-auto" @click="emit('open', namespace)">Open {{ namespace }}</PixelButton>
    </p>

    <h3 class="type-ui-strong">Or connect an app</h3>
    <ul class="ds-apptiles">
      <li v-for="a in apps.slice(0, 8)" :key="a.type" class="ds-apptile" :data-busy="connecting === a.type || undefined" @click="emit('connect', a)">
        <AppMark :name="a.name" :logo="a.logo" :size="20" />
        <span class="max-w-full truncate">{{ a.name }}</span>
        <PixelButton class="ds-apptile-go" :disabled="!!connecting" :aria-label="`connect ${a.name}`" @click.stop="emit('connect', a)">{{ connecting === a.type ? 'Opening' : 'Connect' }}</PixelButton>
      </li>
    </ul>

    <p class="type-meta text-fg-muted" aria-live="polite">
      <template v-if="uploading"><DotMatrix class="mr-1.5 inline-grid" />Uploading {{ uploading === 1 ? '1 file' : `${uploading} files` }}</template>
      <template v-else>Or drop files here, or <button type="button" class="ds-newdata-link" @click="picker?.click()">choose files</button>.</template>
    </p>
    <p v-if="error" class="bg-surface-danger px-3 py-2 type-ui text-fg" role="alert">{{ error }}</p>
    <input ref="picker" type="file" multiple hidden @change="picked">
  </section>
  <Button v-if="closable" variant="ghost" icon aria-label="close add data" @click="emit('close')"><X :size="14" :stroke-width="1.5" /></Button>
  </div>
</template>

<style>
.ds-newdata { position: relative; display: flex; flex-direction: column; gap: var(--ds-space-lg); font-size: var(--ds-text-ui); }
.ds-newdata[data-drag]::after { position: absolute; inset: -8px; display: flex; align-items: center; justify-content: center; border: var(--ds-border-hairline) dashed var(--ds-color-edge-focus); background: color-mix(in srgb, var(--ds-color-surface-subtle) 92%, transparent); content: "Drop files to upload"; font-size: var(--ds-text-ui); pointer-events: none; }
.ds-newdata-link { color: inherit; text-decoration: underline; text-decoration-color: var(--ds-color-edge-strong); text-underline-offset: 3px; cursor: pointer; transition: text-decoration-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-newdata-link:hover { text-decoration-color: var(--ds-color-fg); } }
.ds-newdata-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
.ds-newdata-swap { display: grid; }
.ds-newdata-swap > span { display: inline-flex; grid-area: 1 / 1; align-items: center; justify-content: center; gap: var(--ds-space-sm); transition: opacity var(--ds-duration-glide) ease, filter var(--ds-duration-glide) ease, transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-newdata-swap-b { opacity: 0; filter: blur(2px); transform: translateY(5px) scale(0.96); }
.ds-newdata-swap[data-on] .ds-newdata-swap-a { opacity: 0; filter: blur(2px); transform: translateY(-5px) scale(0.96); }
.ds-newdata-swap[data-on] .ds-newdata-swap-b { opacity: 1; filter: none; transform: none; }
.ds-apptiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--ds-space-md); margin: 0; padding: 0; list-style: none; }
@media (min-width: 900px) { .ds-apptiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.ds-apptile { position: relative; display: flex; width: 100%; height: 100%; min-height: 104px; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 12px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-apptile .ds-apptile-go { position: absolute; right: 10px; bottom: 10px; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-apptile:hover { border-color: var(--ds-color-edge-focus); } .ds-apptile:hover .ds-apptile-go { opacity: 1; } }
@media (hover: none) { .ds-apptile .ds-apptile-go { position: static; opacity: 1; } }
.ds-apptile:focus-within { border-color: var(--ds-color-edge-focus); }
.ds-apptile:focus-within .ds-apptile-go, .ds-apptile[data-busy] .ds-apptile-go { opacity: 1; }
@media (max-width: 767px) {
  .ds-apptiles { grid-template-columns: minmax(0, 1fr); gap: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge); }
  .ds-apptiles > li + li { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
  .ds-apptile { height: auto; min-height: 56px; flex-direction: row; align-items: center; justify-content: flex-start; gap: var(--ds-space-lg); padding: 8px 12px; border: 0; }
  .ds-apptile > span { min-width: 0; }
  .ds-apptile .ds-apptile-go { position: static; margin-left: auto; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) { .ds-newdata-swap > span { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; } }
</style>
