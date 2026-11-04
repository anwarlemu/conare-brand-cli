<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import FixButton, { type FixState } from '@/components/product/FixButton.vue'
// The fix for a failure, as a namespace's row has it, and in the failure's own red as Home's banner has it: hover runs
// its squares across; a press signs in, counts the changes as they come back, and ends on the check. Here each comes
// back to the start after a few seconds.
const states = ref<Record<'dark' | 'red', FixState>>({ dark: 'broken', red: 'broken' })
const counts = ref({ dark: 0, red: 0 })
const timers: Array<ReturnType<typeof setTimeout>> = []
function press(which: 'dark' | 'red') {
  states.value[which] = 'signing'
  timers.push(setTimeout(() => { states.value[which] = 'catching'; counts.value[which] = 1240 }, 1000))
  timers.push(setTimeout(() => { states.value[which] = 'done' }, 2800))
  timers.push(setTimeout(() => { states.value[which] = 'broken'; counts.value[which] = 0 }, 6000))
}
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="grid items-center gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">In a row</p>
    <div><FixButton :state="states.dark" app="Acme CRM" :count="counts.dark" @press="press('dark')" /></div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Red, on a calm page</p>
    <div><FixButton :state="states.red" app="Acme CRM" :count="counts.red" tone="red" @press="press('red')" /></div>
  </div>
</template>
