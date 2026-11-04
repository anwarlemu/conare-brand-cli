<script setup lang="ts">
import { computed } from 'vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import Tag from '@/components/ui/Tag.vue'

// A source's state as a tag (the console's Status.vue): ready in a hairline, syncing and connecting in black with the
// dot matrix at work, error in the red wash with its square. Red marks only a failure.
const props = defineProps<{ status: 'ready' | 'syncing' | 'connecting' | 'error' | (string & {}) }>()
const working = computed(() => props.status === 'syncing' || props.status === 'connecting')
const tone = computed(() => (props.status === 'error' ? 'failed' : working.value ? 'working' : 'default'))
</script>

<template>
  <Tag :tone="tone">
    <template v-if="working" #mark><DotMatrix tone="inverse" class="mt-0.5 mr-0.5" /></template>
    {{ status }}
  </Tag>
</template>
