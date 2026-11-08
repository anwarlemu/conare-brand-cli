<script setup lang="ts">
import { computed } from 'vue'

// A passage with the query's words in medium weight and ink (Marked.vue, utils/marks.ts), so the reader sees why it
// matched. Words of three letters or fewer ("a", "the", "to") don't count. Never a fill or a colour for a match. Each
// word is its own span with its place in `--w`, so a reveal can play the passage in reading order.
const props = defineProps<{ text: string, query: string }>()

function marks(text: string, query: string): Array<{ text: string, hit: boolean }> {
  const words = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? [])]
  if (!words.length) return [{ text, hit: false }]
  const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'giu')
  return text.split(pattern).filter(Boolean).map(part => ({ text: part, hit: words.includes(part.toLowerCase()) }))
}

const words = computed(() => {
  let w = 0
  return marks(props.text, props.query).flatMap(r => r.text.split(/(\s+)/).filter(Boolean).map(t => ({ text: t, hit: r.hit, w: /\s/.test(t) ? -1 : w++ })))
})
</script>

<template>
  <span data-ds="marked-text" class="ds-words"><template v-for="(t, i) in words" :key="i"><template v-if="t.w < 0">{{ t.text }}</template><strong v-else-if="t.hit" class="ds-word font-medium text-fg" :style="{ '--w': t.w }">{{ t.text }}</strong><span v-else class="ds-word" :style="{ '--w': t.w }">{{ t.text }}</span></template></span>
</template>
