<script setup lang="ts">
import Meter from '@/components/ui/Meter.vue'
import Table from '@/components/ui/Table.vue'
import { formatNumber } from '@/composables/useChart'
// What drives a total: each row's share as a bar, the largest red. Point at a row, or focus it, and its percent rolls
// up to what it cost.
const lines = [
  { name: 'sec-filings', queries: 50908, share: 21, cost: '$26.59' },
  { name: 'contracts', queries: 33658, share: 14, cost: '$17.58' },
  { name: 'slack', queries: 18317, share: 7, cost: '$9.57' },
  { name: 'crm', queries: 14127, share: 6, cost: '$7.38' },
]
</script>

<template>
  <Table framed label="share of credits used">
    <thead><tr><th class="sm:w-40">Namespace</th><th><span class="sr-only">Share bar</span></th><th class="w-24 text-right">Queries</th><th class="w-32 text-right">% of credits used</th></tr></thead>
    <tbody>
      <tr v-for="(l, i) in lines" :key="l.name" class="share-row" tabindex="0">
        <td class="type-code-sm">{{ l.name }}</td>
        <td><Meter :value="l.share * 3" :tone="i ? 'default' : 'top'" decorative /></td>
        <td class="text-right tabular-nums">{{ formatNumber(l.queries) }}</td>
        <td class="text-right font-medium tabular-nums">
          <span class="share-roll"><span class="share-a">{{ l.share }}%</span><span class="share-b">{{ l.cost }}</span></span>
        </td>
      </tr>
    </tbody>
  </Table>
</template>

<style>
/* The percent rolls up to the cost under the pointer or focus, both in one cell, so nothing moves. */
.share-roll { position: relative; display: block; overflow: hidden; line-height: 1.4; }
.share-a, .share-b { display: block; transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
.share-b { position: absolute; inset-inline: 0; top: 0; transform: translateY(110%); }
.share-row:focus-visible .share-a { transform: translateY(-110%); }
.share-row:focus-visible .share-b { transform: none; }
@media (hover: hover) and (pointer: fine) {
  .share-row:hover .share-a { transform: translateY(-110%); }
  .share-row:hover .share-b { transform: none; }
}
@media (prefers-reduced-motion: reduce) { .share-a, .share-b { transition: none; } }
</style>
