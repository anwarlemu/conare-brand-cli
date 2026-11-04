<script setup lang="ts">
import { computed } from 'vue'

// The way a number moved, in the website button's pixel arrow (usage/TrendArrow.vue): lit squares on a grid of dim
// ones, red going up, ink going down (turned over). `bare` is a solid pixel triangle with no grid, for beside a stat.
// It holds still: the branch's step on card hover is left out, since icons never move on hover.
const props = defineProps<{ down?: boolean, bare?: boolean }>()
const CELL = 3
const SIZE = 5
const ROWS = computed(() => (props.bare ? 3 : SIZE))
const INK = computed(() => (props.bare ? CELL : 2))
const WIDE = computed(() => SIZE * CELL - (props.bare ? 0 : 1))
const TALL = computed(() => ROWS.value * CELL - (props.bare ? 0 : 1))
const GRID = Array.from({ length: SIZE * SIZE }, (_, k) => [k % SIZE, Math.floor(k / SIZE)] as const)
// [column, row] of the lit squares, pointing up.
const ARROW: Array<[number, number]> = [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [2, 2], [4, 2], [2, 3], [2, 4]]
const TRIANGLE: Array<[number, number]> = [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2]]
const lit = computed(() => (props.bare ? TRIANGLE : ARROW))
</script>

<template>
  <svg class="shrink-0 overflow-hidden" :class="down && 'rotate-180'" :width="WIDE" :height="TALL" :viewBox="`0 0 ${WIDE} ${TALL}`" aria-hidden="true">
    <g v-if="!bare" class="fill-neutral-700"><rect v-for="[x, y] in GRID" :key="`${x}-${y}`" :x="x * CELL" :y="y * CELL" width="2" height="2" /></g>
    <g :class="down ? 'fill-fg' : 'fill-edge-accent'"><rect v-for="[x, y] in lit" :key="`${x}-${y}`" :x="x * CELL" :y="y * CELL" :width="INK" :height="INK" /></g>
  </svg>
</template>
