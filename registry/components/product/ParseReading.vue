<script setup lang="ts">
import { computed } from 'vue'
import ParseOutput from '@/components/product/ParseOutput.vue'
import ParsePlain from '@/components/product/ParsePlain.vue'
import ParseRegions from '@/components/product/ParseRegions.vue'
import ParseSheet from '@/components/product/ParseSheet.vue'
import { useParsePoint, type ParseAnswer } from '@/composables/useParse'
import Count from '@/components/ui/Count.vue'

// A file as Conare read it (parse/Reading.vue), three ways. 1 "Page beside text" (the one that ships): the page on the
// paper beside the dark window of what was read, with four facts over it (how long, regions, tables, OCR; the counts
// roll up as they land), joined by pointing. 2 "Regions": the page's structure, every region numbered with its
// confidence. 3 "Plain or Conare": a plain reader's text and Conare's on the same page, one handle between them.
const props = withDefaults(defineProps<{ answer: ParseAnswer, version?: 1 | 2 | 3 }>(), { version: 1 })
const { on, lit, pick } = useParsePoint()
const facts = computed(() => {
  const p = props.answer.part
  const tables = p.blocks.filter(b => b.type === 'table').length
  const all: Array<{ label: string, value: string, count?: number }> = [
    { label: 'Read in', value: `${(props.answer.took_ms / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} s` },
    { label: 'Regions', value: '', count: p.blocks.length },
    { label: 'Tables', value: '', count: tables },
    { label: 'OCR', value: p.ocr ? `${Math.round((p.confidence ?? 0) * 100)}% sure` : 'Not needed' },
  ]
  return all
})
</script>

<template>
  <section v-if="version === 1" class="m-1.25 grid grid-cols-2 border border-edge outline outline-offset-4 outline-edge max-lg:grid-cols-1" aria-label="the page and what was read">
    <div class="flex min-w-0 flex-col gap-2 bg-surface-subtle p-4">
      <ParseSheet class="border border-edge" :part="answer.part" :scan="answer.scan" :on="lit" plays @point="on = $event" @pick="pick" />
      <p class="flex justify-between gap-4 type-meta text-fg-muted"><span class="truncate">{{ answer.name }}</span><span class="shrink-0">Page {{ answer.page }} of {{ answer.pages }}</span></p>
    </div>
    <div class="flex min-w-0 flex-col bg-code text-code-fg">
      <dl class="grid grid-cols-4 border-b border-code-edge max-md:grid-cols-2">
        <div v-for="(f, i) in facts" :key="f.label" class="min-w-0 px-4 py-3" :class="[i > 0 && 'border-code-edge md:border-l', i % 2 === 1 && 'max-md:border-l', i > 1 && 'max-md:border-t']">
          <dt class="type-meta text-code-muted">{{ f.label }}</dt>
          <dd class="text-body tabular-nums"><Count v-if="f.count != null" :value="f.count" rolls /><template v-else>{{ f.value }}</template></dd>
        </div>
      </dl>
      <ParseOutput :answer="answer" :on="lit" plays @point="on = $event" @pick="pick" />
    </div>
  </section>
  <ParseRegions v-else-if="version === 2" :answer="answer" />
  <ParsePlain v-else :answer="answer" />
</template>
