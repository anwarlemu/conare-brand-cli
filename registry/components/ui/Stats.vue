<script setup lang="ts">
// A row of stats (console2.css .v2-stats): two columns on phones, three from 640px, cells split by hairlines. On a
// phone an odd last stat takes the whole row. Put Stat in the slot; four at most.
</script>

<template>
  <div data-ds="stats" class="ds-stats"><slot /></div>
</template>

<style>
.ds-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: var(--ds-border-hairline) solid var(--ds-color-edge); border-left: var(--ds-border-hairline) solid var(--ds-color-edge); }
@media (min-width: 640px) { .ds-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 639px) { .ds-stats > :last-child:nth-child(odd) { grid-column: 1 / -1; } }
</style>
