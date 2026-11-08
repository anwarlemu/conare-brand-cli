<script setup lang="ts">
// The small dark window a work panel shows (console2.css .v2-win): a 44px bar with its title and a tag (a time, a
// count), the body, and a foot line whose square turns red when the work is done (`done`). Code colours, Geist.
defineProps<{ title: string, tag?: string, foot?: string, done?: boolean }>()
</script>

<template>
  <div data-ds="work-window" class="ds-win w-full max-w-120">
    <div class="ds-win-bar"><span class="min-w-0 flex-1 truncate">{{ title }}</span><span v-if="tag" class="ds-win-tag">{{ tag }}</span></div>
    <slot />
    <p v-if="foot" class="ds-win-foot" :data-on="done || undefined"><span class="ds-win-dot" aria-hidden="true" />{{ foot }}</p>
  </div>
</template>

<style>
.ds-win { border: var(--ds-border-hairline) solid var(--ds-color-neutral-300); background: var(--ds-color-code); color: var(--ds-color-code-fg); font-family: var(--ds-font-text); }
.ds-win-bar { display: flex; height: 44px; align-items: center; gap: var(--ds-space-md); padding: 0 var(--ds-space-xl); font-size: var(--ds-text-ui); line-height: 16px; }
.ds-win-tag { flex-shrink: 0; padding: var(--ds-space-2xs) var(--ds-space-sm); background: var(--ds-color-neutral-200); color: var(--ds-color-code-fg); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); font-variant-numeric: tabular-nums; }
.ds-win-foot { display: flex; align-items: center; gap: var(--ds-space-md); margin: 0; padding: var(--ds-space-lg) var(--ds-space-xl); border-top: var(--ds-border-hairline) solid var(--ds-color-neutral-300); color: var(--ds-color-code-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-win-foot[data-on] { color: var(--ds-color-code-fg); }
.ds-win-dot { width: 6px; height: 6px; flex-shrink: 0; border: var(--ds-border-hairline) solid var(--ds-color-code-muted); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard), border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-win-foot[data-on] .ds-win-dot { border-color: var(--ds-color-surface-accent); background: var(--ds-color-surface-accent); }
</style>
