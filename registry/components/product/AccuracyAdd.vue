<script setup lang="ts">
import { computed, ref } from 'vue'
import { FileUp, X } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'

// More questions, opened in place (accuracy/Add.vue), on the paper in a hairline. Three ways in: paste a list (one a
// line), upload a CSV (its first column), or take what agents already ask, which needs no typing and is the truest
// test. Adding runs them, since a question only helps answered: `add` gets the questions, `close` the close button.
withDefaults(defineProps<{ asked?: string[] }>(), { asked: () => [] })
const emit = defineEmits<{ add: [questions: string[]], close: [] }>()
const text = ref('')
const lines = computed(() => text.value.split('\n').map(l => l.trim()).filter(Boolean))
const input = ref<HTMLInputElement | null>(null)
async function file(list: FileList | null) {
  const f = list?.[0]
  if (!f) return
  text.value = (await f.text()).split('\n').map(l => l.split(',')[0]!.replace(/^"|"$/g, '').trim()).filter(Boolean).join('\n')
}
const count = (n: number) => `${n} ${n === 1 ? 'question' : 'questions'}`
</script>

<template>
  <section data-ds="accuracy-add" class="grid grid-cols-[minmax(0,1fr)_minmax(0,320px)] gap-6 border border-edge bg-surface-subtle p-4 max-lg:grid-cols-1" aria-label="add questions">
    <div class="min-w-0 flex-1">
      <label class="sr-only" for="eval-more">questions, one a line</label>
      <textarea id="eval-more" v-model="text" class="block w-full resize-y border border-edge-strong bg-surface p-3 text-ui outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus max-md:text-input" rows="5" placeholder="One question a line" />
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <PixelButton :disabled="!lines.length" @click="emit('add', lines)">{{ lines.length ? `Add ${count(lines.length)} and run` : 'Add and run' }}</PixelButton>
        <Button press @click="input?.click()"><FileUp :size="12" :stroke-width="1.5" aria-hidden="true" />Upload a CSV</Button>
        <input ref="input" type="file" accept=".csv,.txt" class="sr-only" tabindex="-1" aria-label="choose a CSV of questions" @change="file(($event.target as HTMLInputElement).files)">
        <Button variant="ghost" icon press class="ml-auto" aria-label="close" @click="emit('close')"><X :size="14" :stroke-width="1.5" /></Button>
      </div>
    </div>
    <div v-if="asked.length">
      <p class="mb-1 type-meta text-fg-muted">What your agents ask most</p>
      <button v-for="q in asked" :key="q" type="button" class="ds-askedq" @click="text = text ? `${text}\n${q}` : q">{{ q }}</button>
    </div>
  </section>
</template>

<style>
.ds-askedq { display: block; width: 100%; overflow: hidden; padding: 6px 4px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); text-align: left; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-askedq:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-askedq:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
@media (hover: hover) and (pointer: fine) { .ds-askedq:hover { background: color-mix(in srgb, var(--ds-color-fg) 5%, var(--ds-color-surface-subtle)); } }
@media (pointer: coarse), (max-width: 767px) { .ds-askedq { min-height: 40px; } }
</style>
