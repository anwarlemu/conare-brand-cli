<script setup lang="ts">
import CellBurst from '@/components/visuals/CellBurst.vue'
import Grain from '@/components/visuals/Grain.vue'
// The sheet behind How it works and the blog cards. The same seed draws the same burst; jumble and ledger change its
// pattern.
const bursts = [
  { label: 'How it works, seed 5', seed: 5, jumble: false, ledger: false },
  { label: 'Blog card, jumble', seed: 84, jumble: true, ledger: false },
  { label: 'Ledger', seed: 5, jumble: false, ledger: true },
]
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-3">
    <figure v-for="b in bursts" :key="b.label" class="flex flex-col gap-2">
      <span aria-hidden="true" class="relative grid aspect-[5/4] grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden bg-neutral-200 px-4 text-neutral-300">
        <Grain />
        <span class="pointer-events-none absolute inset-0 opacity-70"><CellBurst :seed="b.seed" :jumble="b.jumble" :ledger="b.ledger" /></span>
      </span>
      <figcaption class="type-meta text-fg-faint">{{ b.label }}</figcaption>
    </figure>
  </div>
</template>
