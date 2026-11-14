<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import GlideMark from '@/components/visuals/GlideMark.vue'
import { useGlideMark } from '@/composables/useGlideMark'
// One block for a whole list: it glides to the row under the pointer and rests on the picked one when the pointer
// leaves, so moving down a list is one movement, not a row of flickers.
const rows = ['Queries', 'Documents', 'Indexing', 'Storage']
const at = ref(0)
const list = ref<HTMLElement | null>(null)
const { mark, instant, point, leave, settle } = useGlideMark(list, () => at.value)
watch(at, () => nextTick(settle))
</script>

<template>
  <ul ref="list" class="relative w-105 max-w-full border border-edge bg-surface" @pointerleave="leave">
    <GlideMark :mark="mark" :instant="instant" />
    <li v-for="(r, i) in rows" :key="r" data-glide-row class="relative z-1 border-edge [li+&]:border-t">
      <button
        type="button"
        class="relative flex min-h-row w-full cursor-pointer items-center gap-4 pr-4 pl-5 text-left type-ui before:absolute before:top-1/2 before:left-2 before:-mt-0.5 before:size-1 before:bg-edge-accent before:opacity-0 before:transition-opacity before:duration-120 before:ease-standard focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-accent data-on:before:opacity-100"
        :data-on="at === i || undefined"
        :aria-pressed="at === i"
        @pointerenter="point(i)"
        @focus="point(i)"
        @click="at = i"
      >
        <span class="min-w-0 flex-1 truncate">{{ r }}</span>
      </button>
    </li>
  </ul>
</template>
