<script setup lang="ts">
// Buttons that belong together, sharing a hairline (from agent-prompt's split button, console2.css .v2-split): each
// child overlaps the one before by 1px so two edges read as one, and the one under the pointer or focus sits on top so
// its ink edge shows whole. Secondary buttons, a dark button with its menu arrow (the split button: a 24% white hairline
// divides two dark halves), or a field with its button. `vertical` stacks them. Give it a label for the group.
defineProps<{ label?: string, vertical?: boolean }>()
</script>

<template>
  <div data-ds="button-group" class="ds-btngroup" role="group" :aria-label="label" :data-vertical="vertical || undefined"><slot /></div>
</template>

<style>
.ds-btngroup { display: inline-flex; align-items: stretch; }
.ds-btngroup[data-vertical] { flex-direction: column; }
.ds-btngroup > * { position: relative; }
.ds-btngroup > * + * { margin-left: -1px; }
.ds-btngroup[data-vertical] > * + * { margin-top: -1px; margin-left: 0; }
.ds-btngroup > :is(:hover, :focus-visible, :focus-within) { z-index: 1; }
/* Two dark halves: a hairline of the light colour between them, so they stay one block. */
.ds-btngroup > :is(.bg-action-primary, .ds-px) + :is(.bg-action-primary, .ds-px)::after,
.ds-btngroup > :is(.bg-action-primary, .ds-px) + * > .bg-action-primary::after { position: absolute; inset: 0 auto 0 0; width: 1px; background: color-mix(in srgb, var(--ds-color-fg-inverse) 24%, transparent); content: ""; }
.ds-btngroup > :is(.bg-action-primary, .ds-px) + :is(.bg-action-primary, .ds-px),
.ds-btngroup > :is(.bg-action-primary, .ds-px) + * { margin-left: 0; }
</style>
