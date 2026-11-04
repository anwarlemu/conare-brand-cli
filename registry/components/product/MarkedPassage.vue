<script setup lang="ts">
import { computed } from 'vue'
import { marks } from '@/composables/useSearchResults'

// A passage with the query's words in medium weight and ink (Marked.vue), for search results. Words of three letters
// or fewer don't count.
const props = defineProps<{ text: string, query: string }>()
const runs = computed(() => marks(props.text, props.query))
</script>

<template>
  <span><template v-for="(r, i) in runs" :key="i"><strong v-if="r.hit" class="font-medium text-fg">{{ r.text }}</strong><template v-else>{{ r.text }}</template></template></span>
</template>
