<script setup lang="ts">
// The website's tag (Tag.vue on conare.ai): 10px capitals on the red, tracked 0.06em, the system's only capitals.
// `framed` adds a second rule 2px outside, as the cards' double rule (the hero's eyebrow).
defineProps<{ framed?: boolean }>()
</script>

<template>
  <span data-ds="site-tag"
    class="inline-block bg-home-red py-0.75 pr-[calc(4px-0.06em)] pl-1 type-tag text-off-white [text-box:trim-both_cap_alphabetic]"
    :class="framed && 'outline outline-offset-2 outline-home-red'"
  ><slot /></span>
</template>
