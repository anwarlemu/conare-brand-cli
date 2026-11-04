<script setup lang="ts">
import { computed, ref } from 'vue'
import Table from '@/components/ui/Table.vue'
import Tabs from '@/components/ui/Tabs.vue'
import tokensFile from '../../../../build/tokens.json'

// The tokens, read from build/tokens.json (made from brand/tokens.css): colours by role in both themes, the type styles,
// space, sizes, radii and motion. Apps use them as Tailwind utilities (bg-surface, text-fg-muted, type-ui) or var(--ds-*).
useHead({ title: 'Theme | Conare design system' })
type Token = { value: string, light: string, dark: string }
const tokens = tokensFile.tokens as Record<string, Token>
const list = (prefix: string, skip?: RegExp) => Object.entries(tokens).filter(([n]) => n.startsWith(prefix) && !skip?.test(n)).map(([name, t]) => ({ name, ...t }))
const PRIMITIVE = /--ds-color-(speed-red|red-|off-|neutral-|home-|code-sand|code-peach)/
const roles = list('--ds-color-').filter(t => !PRIMITIVE.test(t.name))
const primitives = list('--ds-color-').filter(t => PRIMITIVE.test(t.name))
const utility = (name: string) => name.replace('--ds-color-', '')
const theme = ref<'light' | 'dark'>('light')
const shown = computed(() => roles.map(r => ({ ...r, hex: theme.value === 'light' ? r.light : r.dark })))
const types = [
  ['type-hero', '40px Faculty Glyphic, the console search hero'],
  ['type-heading-2', '24px Faculty Glyphic, greetings'],
  ['type-heading-3', '20px Faculty Glyphic, page and section titles'],
  ['type-body', '14px Geist, longer text'],
  ['type-ui', '13px Geist, the console default'],
  ['type-ui-strong', '13px Geist medium, card titles and labels'],
  ['type-meta', '12px Geist, meta lines, button labels, table heads'],
  ['type-caption', '11px Geist, tags and counts'],
  ['type-code-sm', '12px Geist Mono, IDs, keys and namespaces'],
  ['type-tag', '10px capitals, the website tag'],
]
const space = list('--ds-space-')
const sizes = [...list('--ds-size-'), ...list('--ds-layout-')]
const radii = list('--ds-radius-')
const durations = list('--ds-duration-')
const easings = list('--ds-easing-')
</script>

<template>
  <div class="mx-auto flex w-full max-w-page-wide flex-col gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <PageHead title="Theme" description="Every value the library uses, from brand/tokens.css. Use the Tailwind utilities the theme makes (bg-surface, text-fg-muted, border-edge, type-ui) or var(--ds-*) in CSS. The dark theme applies under [data-theme=&quot;dark&quot;]." />

    <section class="flex flex-col gap-4" aria-labelledby="roles">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <SectionHead id="roles" title="Colour roles" />
        <Tabs v-model="theme" :options="[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]" label="theme" />
      </div>
      <div class="grid gap-px border border-edge bg-edge sm:grid-cols-2 lg:grid-cols-3" :data-theme="theme">
        <div v-for="t in shown" :key="t.name" class="flex items-center gap-3 bg-surface p-3">
          <span class="size-8 shrink-0 border border-edge" :style="{ background: `var(${t.name})` }" aria-hidden="true" />
          <span class="min-w-0">
            <span class="block truncate type-code-sm text-fg">{{ utility(t.name) }}</span>
            <span class="block truncate type-caption text-fg-muted">{{ t.hex }}</span>
          </span>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="palette">
      <SectionHead id="palette" title="Palette" />
      <p class="type-ui text-fg-soft">The primitives the roles point at: the brand kit and the website's own values. Reach for a role first.</p>
      <div class="grid grid-cols-2 gap-px border border-edge bg-edge sm:grid-cols-4 lg:grid-cols-6">
        <div v-for="t in primitives" :key="t.name" class="bg-surface">
          <span class="block h-12" :style="{ background: `var(${t.name})` }" aria-hidden="true" />
          <span class="block p-2"><span class="block truncate type-caption text-fg">{{ utility(t.name) }}</span><span class="block type-caption text-fg-muted">{{ t.light }}</span></span>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="type">
      <SectionHead id="type" title="Type" />
      <div class="flex flex-col border border-edge">
        <div v-for="[cls, what] in types" :key="cls" class="flex flex-col gap-1 border-b border-edge p-4 last:border-b-0 md:flex-row md:items-baseline md:gap-6">
          <code class="w-36 shrink-0 type-code-sm text-fg-muted">{{ cls }}</code>
          <p :class="cls">Context your AI can use.</p>
          <p class="type-meta text-fg-muted md:ml-auto md:text-right">{{ what }}</p>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="space">
      <SectionHead id="space" title="Space, sizes and radius" />
      <div class="grid gap-4 lg:grid-cols-3">
        <Table framed label="space">
          <thead><tr><th>Space</th><th class="text-right">Value</th></tr></thead>
          <tbody><tr v-for="t in space" :key="t.name"><td class="type-code-sm">{{ t.name.replace('--ds-', '') }}</td><td class="text-right tabular-nums"><span class="mr-2 inline-block h-2 bg-edge-accent align-middle" :style="{ width: t.light }" />{{ t.light }}</td></tr></tbody>
        </Table>
        <Table framed label="sizes">
          <thead><tr><th>Size</th><th class="text-right">Value</th></tr></thead>
          <tbody><tr v-for="t in sizes" :key="t.name"><td class="type-code-sm">{{ t.name.replace('--ds-', '') }}</td><td class="text-right tabular-nums">{{ t.light }}</td></tr></tbody>
        </Table>
        <Table framed label="radius">
          <thead><tr><th>Radius</th><th class="text-right">Value</th></tr></thead>
          <tbody><tr v-for="t in radii" :key="t.name"><td class="type-code-sm">{{ t.name.replace('--ds-', '') }}</td><td class="text-right tabular-nums">{{ t.light }}</td></tr></tbody>
        </Table>
      </div>
      <p class="type-meta text-fg-muted">The console is square: controls and containers use radius-control and radius-container (0). The brand kit's 8 to 24px steps are for brand surfaces outside the console. There are no shadows.</p>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="motion">
      <SectionHead id="motion" title="Motion" />
      <div class="grid gap-4 lg:grid-cols-2">
        <Table framed label="durations">
          <thead><tr><th>Duration</th><th class="text-right">Value</th></tr></thead>
          <tbody><tr v-for="t in durations" :key="t.name"><td class="type-code-sm">{{ t.name.replace('--ds-', '') }}</td><td class="text-right tabular-nums">{{ t.light }}</td></tr></tbody>
        </Table>
        <Table framed label="easings">
          <thead><tr><th>Easing</th><th>Value</th></tr></thead>
          <tbody><tr v-for="t in easings" :key="t.name"><td class="type-code-sm">{{ t.name.replace('--ds-', '') }}</td><td class="type-code-sm text-fg-muted">{{ t.light }}</td></tr></tbody>
        </Table>
      </div>
    </section>
  </div>
</template>
