<script setup lang="ts">
import { computed } from 'vue'

// Every action in the console (console2.css .v2-btn): square, 28px (40px on phones and touch), 12px medium labels.
// secondary is the default; dark is the one main action of a view (it turns red on hover); primary is the red
// action; ghost is a tool in a row; danger removes something (hold it with HoldButton); brand is the fix for a
// failure, in the failure's red. Disabled is grey with a dark label, never faded. `press` gives a little under the
// pointer (scale 0.97), for buttons pressed often in place. `href` renders a link.
export type ButtonVariant = 'secondary' | 'dark' | 'primary' | 'ghost' | 'danger' | 'brand'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  icon?: boolean
  press?: boolean
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), { variant: 'secondary', type: 'button' })

const VARIANTS: Record<ButtonVariant, string> = {
  secondary: 'border-action-secondary-edge bg-surface text-fg hover:enabled:border-action-secondary-edge-hover active:enabled:bg-surface-subtle',
  dark: 'border-action-primary bg-action-primary text-action-primary-fg hover:enabled:border-edge-accent hover:enabled:bg-edge-accent',
  primary: 'border-edge-accent bg-edge-accent text-off-white hover:enabled:border-home-red-hover hover:enabled:bg-home-red-hover active:enabled:border-home-red-press active:enabled:bg-home-red-press',
  ghost: 'border-transparent bg-transparent text-fg-soft hover:enabled:border-edge hover:enabled:text-fg active:enabled:bg-surface-subtle disabled:!border-transparent disabled:!bg-transparent disabled:!text-fg-muted',
  danger: 'border-action-danger bg-surface text-action-danger hover:enabled:bg-action-danger-hover hover:enabled:text-off-white disabled:!border-action-danger disabled:!bg-surface disabled:!text-action-danger',
  brand: 'border-home-red-press bg-home-red-press text-off-white hover:enabled:border-surface-inverse hover:enabled:bg-surface-inverse',
}

const classes = computed(() => [
  'inline-flex h-control-sm shrink-0 cursor-pointer items-center justify-center gap-1.5 border px-2.5 text-meta leading-5 font-medium whitespace-nowrap select-none',
  'transition-[color,background-color,border-color] duration-120 ease-standard',
  'disabled:cursor-not-allowed disabled:border-edge disabled:bg-surface-sunken disabled:text-fg-soft',
  'max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui',
  props.icon && 'w-control-sm px-0 max-md:w-control-touch pointer-coarse:w-control-touch',
  props.press && 'transition-[color,background-color,border-color,scale] ease-out active:enabled:scale-97 motion-reduce:active:enabled:scale-100',
  VARIANTS[props.variant],
])
</script>

<template>
  <a v-if="href" :href="href" :class="classes"><slot /></a>
  <button v-else :type="type" :disabled="disabled" :class="classes"><slot /></button>
</template>
