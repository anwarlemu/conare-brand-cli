<script setup lang="ts">
import type { Component } from 'vue'

// Text that goes somewhere (console2.css .v2-link): ink with a quiet #C3C1BF underline 4px under it that turns ink on
// hover, in 200ms. `more` is the quiet link under a list (.v2-more): 12px medium, soft grey to ink, no underline, and
// a button unless it has an href. `as` renders a router link component in place of the anchor.
withDefaults(defineProps<{ href?: string, more?: boolean, as?: string | Component }>(), { as: 'a' })
</script>

<template>
  <button v-if="more && !href" type="button" class="ds-more"><slot /></button>
  <component :is="as" v-else :href="href" :class="more ? 'ds-more' : 'ds-link'"><slot /></component>
</template>

<style>
.ds-link { text-decoration-line: underline; text-decoration-color: var(--ds-color-edge-strong); text-underline-offset: 4px; transition: text-decoration-color var(--ds-duration-enter) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-link:hover { text-decoration-color: var(--ds-color-fg); } }
.ds-more { position: relative; color: var(--ds-color-fg-soft); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-meta-leading); white-space: nowrap; cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-more:hover { color: var(--ds-color-fg); } }
.ds-more:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
/* A 40px place to land on phones, the text keeping its size. */
@media (pointer: coarse), (max-width: 767px) { .ds-more::after { position: absolute; inset: -12px; content: ""; } }
</style>
