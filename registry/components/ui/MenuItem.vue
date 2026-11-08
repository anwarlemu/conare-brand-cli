<script setup lang="ts">
import { inject } from 'vue'

// One row of a Menu (console2.css .v2-menu-item): 32px (44px on phones), 13px, a 14px gutter that holds the 4px red
// square marker of the row under the pointer or focus, which also takes the paper fill. `current` sets it in medium
// weight; `danger` is Sign out's red. Put a 14px Lucide icon first (text-fg-muted), a count or a check last.
// Choosing it emits `select` and closes the menu, unless `keepOpen`.
const props = defineProps<{ href?: string, current?: boolean, danger?: boolean, disabled?: boolean, keepOpen?: boolean }>()
const emit = defineEmits<{ select: [] }>()
const close = inject<() => void>('ds-menu-close', () => {})
function choose() {
  emit('select')
  if (!props.keepOpen) close()
}
</script>

<template>
  <component data-ds="menu-item"
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    role="menuitem"
    class="ds-menu-item"
    :aria-current="current ? 'true' : undefined"
    :data-danger="danger || undefined"
    :disabled="href ? undefined : disabled"
    @click="choose"
  >
    <slot />
  </component>
</template>

<style>
.ds-menu-item { position: relative; display: flex; width: 100%; height: var(--ds-size-control-md); align-items: center; gap: var(--ds-space-md); padding: 0 10px 0 14px; color: var(--ds-color-fg); font-size: var(--ds-text-ui); text-align: left; outline: none; cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-menu-item::before { position: absolute; top: 50%; left: 5px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-menu-item:focus-visible { background: var(--ds-color-surface-subtle); }
.ds-menu-item:focus-visible::before { opacity: 1; }
@media (hover: hover) and (pointer: fine) {
  .ds-menu-item:hover { background: var(--ds-color-surface-subtle); }
  .ds-menu-item:hover::before { opacity: 1; }
  .ds-menu-item[data-danger]:hover { background: var(--ds-color-surface-danger); }
}
.ds-menu-item[aria-current="true"] { font-weight: var(--ds-font-weight-medium); }
.ds-menu-item:disabled { color: var(--ds-color-fg-muted); cursor: progress; }
.ds-menu-item[data-danger] { color: var(--ds-color-fg-danger); }
.ds-menu-item[data-danger]:focus-visible { background: var(--ds-color-surface-danger); }
@media (pointer: coarse), (max-width: 767px) { .ds-menu-item { height: auto; min-height: 44px; } }
</style>
