<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// The headline reveal (HighlightText.vue, home.css .hl): each letter waits faint and red, fades up over 200ms, then
// settles to the heading's colour over 400ms. Lines go in order (100ms apart) and within a line the letters spread from
// the centre, or from the start on left-aligned text (40ms a letter). It plays once, when the heading comes on screen.
// `accent` is trailing characters that stay red, such as the hero's full stop. Without JavaScript, and with reduced
// motion, the text just shows. Use it once per view: a screen opened many times a day should not replay it.
const props = withDefaults(defineProps<{ as?: 'h1' | 'h2' | 'h3' | 'p', text: string, accent?: string }>(), { as: 'h2', accent: '' })

const el = ref<HTMLElement | null>(null)
const ready = ref(false)
const on = ref(false)
const words = computed(() => props.text.split(' '))

let resize: ResizeObserver | undefined
let io: IntersectionObserver | undefined

// Group the letters into rendered lines, then give each its delay.
function stagger() {
  const root = el.value
  if (!root || on.value) return
  const chars = [...root.querySelectorAll<HTMLElement>('.ds-hl-char')]
  const align = getComputedStyle(root).textAlign
  const fromStart = align === 'left' || align === 'start'
  const lines: HTMLElement[][] = []
  let lastTop: number | null = null
  for (const c of chars) {
    const top = Math.round(c.getBoundingClientRect().top)
    if (lastTop === null || Math.abs(top - lastTop) > 4) lines.push([])
    lines[lines.length - 1]!.push(c)
    lastTop = top
  }
  lines.forEach((line, li) => {
    const mid = (line.length - 1) / 2
    line.forEach((c, ci) => {
      const step = fromStart ? ci : Math.abs(ci - mid)
      c.style.setProperty('--d', `${(0.1 * li + 0.04 * step).toFixed(3)}s`)
    })
  })
}

onMounted(async () => {
  const root = el.value
  if (!root) return
  ready.value = true
  await document.fonts?.ready
  stagger()
  resize = new ResizeObserver(stagger)
  resize.observe(root)
  io = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    io?.disconnect()
    resize?.disconnect()
    requestAnimationFrame(() => { on.value = true })
  }, { threshold: 0, rootMargin: '0px 0px -15% 0px' })
  io.observe(root)
})

onBeforeUnmount(() => {
  io?.disconnect()
  resize?.disconnect()
})
</script>

<template>
  <component :is="as" ref="el" class="ds-hl" :class="{ 'ds-hl-ready': ready, 'ds-hl-on': on }">
    <span class="sr-only">{{ text }}{{ accent }}</span>
    <span aria-hidden="true">
      <span v-for="(word, wi) in words" :key="wi"><span class="ds-hl-word"><span v-for="(ch, ci) in word" :key="ci" class="ds-hl-char">{{ ch }}</span><span v-if="wi === words.length - 1 && accent" class="inline-block w-0 whitespace-nowrap"><span v-for="(ch, ci) in accent" :key="`a${ci}`" class="ds-hl-char text-fg-accent-display">{{ ch }}</span></span></span>{{ wi === words.length - 1 ? '' : ' ' }}</span>
    </span>
  </component>
</template>

<style>
.ds-hl-char { transition: opacity var(--ds-duration-enter) var(--ds-easing-reveal-fade) var(--d, 0s), color var(--ds-duration-reveal) var(--ds-easing-reveal-ink) calc(var(--d, 0s) + 0.2s); }
.ds-hl.ds-hl-ready:not(.ds-hl-on) .ds-hl-char { color: var(--ds-color-fg-accent-display); opacity: 0.2; transition: none; }
.ds-hl-word { display: inline-block; white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .ds-hl.ds-hl-ready:not(.ds-hl-on) .ds-hl-char { color: inherit; opacity: 1; }
  .ds-hl.ds-hl-ready:not(.ds-hl-on) .ds-hl-char.text-fg-accent-display { color: var(--ds-color-fg-accent-display); }
  .ds-hl-char { transition: none; }
}
</style>
