<script setup lang="ts">
import Burst from '@/components/visuals/Burst.vue'
import Grain from '@/components/visuals/Grain.vue'
import RoomGrid from '@/components/visuals/RoomGrid.vue'
// The hero's red frame, with what sits in it.
</script>

<template>
  <div class="relative flex aspect-[2/1] w-full justify-center overflow-hidden bg-home-red px-4 py-10 text-ds-neutral-300">
    <Grain />
    <RoomGrid />
    <Burst :inner="0.01" corners />
  </div>
</template>
