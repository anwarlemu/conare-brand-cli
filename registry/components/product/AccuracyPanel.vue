<script setup lang="ts">
import { ref } from 'vue'
import { Check, Link2, Plus, RotateCw } from 'lucide-vue-next'
import AccuracyAdd from '@/components/product/AccuracyAdd.vue'
import AccuracyAtWork from '@/components/product/AccuracyAtWork.vue'
import type { AccuracyRow, AccuracyView } from '@/components/product/AccuracyDetail.vue'
import AccuracyOpens from '@/components/product/AccuracyOpens.vue'
import AccuracySheet from '@/components/product/AccuracySheet.vue'
import AccuracyTwo from '@/components/product/AccuracyTwo.vue'
import AccuracyVerdict from '@/components/product/AccuracyVerdict.vue'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Tabs from '@/components/ui/Tabs.vue'
import { useCopy } from '@/composables/useCopy'

// Accuracy, Performance's second view (accuracy/Panel.vue): a team's own questions and whether Conare reached the
// right page. The bar holds Performance's two views and the test's actions: Add questions (opening in place; the
// question sheet takes them in its first row instead), Copy link, and Run again as the page's one dark button. Under it,
// one of the four views: 4 "Test at work" ships; 1 "Verdict first", 2 "Two searches" and 3 "Question sheet" are the
// takes beside it. The app owns the test: it answers `run`, `add`, `fix`, `search`, `remove` and the tab.
const props = withDefaults(defineProps<{ view: AccuracyView, version?: 1 | 2 | 3 | 4, link?: string, asked?: string[], busy?: boolean }>(), { version: 4, link: '', asked: () => [] })
const emit = defineEmits<{ run: [], add: [questions: string[]], fix: [row: AccuracyRow], search: [row: AccuracyRow], remove: [row: AccuracyRow] }>()
const tab = defineModel<'searches' | 'accuracy'>('tab', { default: 'accuracy' })
const adding = ref(false)
const { copied, copy } = useCopy()
function more(questions: string[]) {
  adding.value = false
  emit('add', questions)
  emit('run')
}
const pass = { onFix: (r: AccuracyRow) => emit('fix', r), onSearch: (r: AccuracyRow) => emit('search', r), onRemove: (r: AccuracyRow) => emit('remove', r) }
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <Tabs v-model="tab" :options="[{ value: 'searches', label: 'Searches' }, { value: 'accuracy', label: 'Accuracy' }]" label="performance" />
    <div class="flex flex-wrap items-center gap-2">
      <Button v-if="version !== 3" press :aria-expanded="adding" @click="adding = !adding"><Plus :size="12" :stroke-width="1.5" aria-hidden="true" />Add questions</Button>
      <Button press @click="copy(props.link)">
        <Check v-if="copied" :size="12" :stroke-width="2" aria-hidden="true" /><Link2 v-else :size="12" :stroke-width="1.5" aria-hidden="true" />{{ copied ? 'Link copied' : 'Copy link' }}
      </Button>
      <PixelButton :disabled="view.state === 'running' || busy" @click="emit('run')">
        <RotateCw :size="12" :stroke-width="1.5" aria-hidden="true" />{{ view.state === 'running' ? 'Running' : 'Run again' }}
      </PixelButton>
    </div>
  </div>
  <AccuracyOpens :open="adding && version !== 3"><AccuracyAdd :asked="asked" @add="more" @close="adding = false" /></AccuracyOpens>
  <AccuracyVerdict v-if="version === 1" :view="view" v-bind="pass" />
  <AccuracyTwo v-else-if="version === 2" :view="view" v-bind="pass" />
  <AccuracySheet v-else-if="version === 3" :view="view" v-bind="pass" @add="emit('add', $event)" />
  <AccuracyAtWork v-else :view="view" v-bind="pass" />
</template>
