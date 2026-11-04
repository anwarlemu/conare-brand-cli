<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, Copy } from 'lucide-vue-next'
import TextSwap from '@/components/visuals/TextSwap.vue'
// Two labels in one cell, so nothing around them moves: the first leaves up, the next arrives from below, each with a
// touch of blur, and a check draws itself. Here it swaps by itself.
const on = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { on.value = !on.value }, 1800) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <TextSwap :on="on" class="text-ui">
    <template #a><Copy :size="12" :stroke-width="1.5" aria-hidden="true" />Copy prompt</template>
    <template #b><Check :size="12" :stroke-width="2" aria-hidden="true" />Copied</template>
  </TextSwap>
</template>
