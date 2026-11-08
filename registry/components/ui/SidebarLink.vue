<script setup lang="ts">
import type { Component } from 'vue'

// One page in the Sidebar (console2.css .v2-nav-link): a 28px row (44px on phones) with its 14px icon, the label and
// a count or health at the end. The page you are on sits on white in a hairline, in medium, with a 2px red edge at the
// sidebar's side. `alert` turns the count red when something failed. `as` renders a router link component instead of an anchor.
withDefaults(defineProps<{ href?: string, active?: boolean, icon?: Component, status?: string, alert?: boolean, as?: string | Component }>(), { as: 'a' })
</script>

<template>
  <component data-ds="sidebar-link" :is="as" :href="href" class="ds-navlink" :data-active="active || undefined" :aria-current="active ? 'page' : undefined">
    <component :is="icon" v-if="icon" :size="14" :stroke-width="1.5" aria-hidden="true" />
    <span class="min-w-0 flex-1 truncate"><slot /></span>
    <span v-if="status" class="text-meta tabular-nums" :class="alert ? 'text-home-red-press' : 'text-fg-muted'">{{ status }}</span>
  </component>
</template>

<style>
.ds-navlink { position: relative; display: flex; height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; gap: var(--ds-space-md); margin: 0 8px; padding: 0 8px; color: var(--ds-color-fg-soft); font-size: var(--ds-text-ui); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-navlink svg { flex-shrink: 0; color: var(--ds-color-fg-muted); }
@media (hover: hover) and (pointer: fine) { .ds-navlink:hover { background: color-mix(in srgb, var(--ds-color-edge) 50%, transparent); color: var(--ds-color-fg); } }
.ds-navlink[data-active] { background: var(--ds-color-surface); color: var(--ds-color-fg); font-weight: var(--ds-font-weight-medium); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: -1px; }
.ds-navlink[data-active]::before { position: absolute; top: 6px; bottom: 6px; left: -8px; width: 2px; background: var(--ds-color-edge-accent); content: ""; }
.ds-navlink[data-active] svg { color: var(--ds-color-fg); }
.ds-navlink:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
@media (pointer: coarse), (max-width: 767px) { .ds-navlink { height: 44px; font-size: var(--ds-text-body); } }
</style>
