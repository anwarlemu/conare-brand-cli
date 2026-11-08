<script setup lang="ts">
// A label that rolls up to a copy of itself (RollText.vue, console2.css and home.css .roll): the label sits in a
// clipped box with a copy parked just below; hovering or keyboard focus on the nearest `.ds-roll-host` slides the label
// up and out as the copy slides in, in 160ms on the console's curve. `pace="site"` moves one line (the website's
// footer), the console's moves 110% so no sliver shows. Only where a pointer can rest: a tap would leave it rolled.
// Reduced motion holds it still.
withDefaults(defineProps<{ text: string, pace?: 'console' | 'site' }>(), { pace: 'console' })
</script>

<template>
  <span data-ds="roll-text" class="ds-roll" :data-pace="pace">
    <span class="ds-roll-a">{{ text }}</span>
    <span class="ds-roll-b" aria-hidden="true">{{ text }}</span>
  </span>
</template>

<style>
.ds-roll { --roll-out: -110%; position: relative; display: block; overflow: hidden; line-height: 1.4; }
.ds-roll[data-pace="site"] { --roll-out: -100%; }
.ds-roll-a, .ds-roll-b { display: block; transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-roll-b { position: absolute; inset-inline: 0; top: 0; transform: translateY(110%); }
.ds-roll-host:focus-visible .ds-roll-a { transform: translateY(var(--roll-out)); }
.ds-roll-host:focus-visible .ds-roll-b { transform: none; }
@media (hover: hover) and (pointer: fine) {
  .ds-roll-host:hover .ds-roll-a { transform: translateY(var(--roll-out)); }
  .ds-roll-host:hover .ds-roll-b { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-roll-a, .ds-roll-b { transition: none; }
  .ds-roll-host:is(:hover, :focus-visible) .ds-roll-a { transform: none; }
  .ds-roll-host:is(:hover, :focus-visible) .ds-roll-b { transform: translateY(110%); }
}
</style>
