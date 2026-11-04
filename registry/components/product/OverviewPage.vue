<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, ChevronDown } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Table from '@/components/ui/Table.vue'
import OverviewQueries, { type QueryDay } from '@/components/product/OverviewQueries.vue'

// Overview as it ships (Home.vue, take 7 with lead 5): what a team running Conare checks, with no search box. The line
// under the top bar while setup is unfinished; the greeting and how many documents agents search, with Create API key
// and Read the docs, beside the API key's window on the dark panel, the two in the website's double rule; Queries
// beside Credits; the five largest namespaces. Every value comes in through props; the buttons and rows emit.
// The greeting's letter reveal, the counting number and the key window's playback belong to their own items; here
// they are drawn still.
export interface OverviewNamespace { name: string, documents: number, health: 'ready' | 'syncing' | 'error' | 'api', synced?: string, lastUsed?: string }
export interface OverviewSpender { name: string, cost: number, share: number }
const props = defineProps<{
  greeting: string
  documents: number
  setup?: { done: number, total: number }
  queries: { thisMonth: number, p50: number, p95: number, days: QueryDay[], latency: number[] }
  credits: { left: number, total: number, spenders: OverviewSpender[] }
  namespaces: OverviewNamespace[]
}>()
const emit = defineEmits<{ finishSetup: [], createKey: [], readDocs: [], billing: [], viewAll: [], openNamespace: [name: string] }>()
const num = (n: number) => n.toLocaleString('en-US')
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const share = computed(() => (props.credits.total ? Math.max(0, Math.min(1, props.credits.left / props.credits.total)) : 0))
const pct = (p: number) => (p > 0 && p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`)
const top = computed(() => [...props.namespaces].sort((a, b) => b.documents - a.documents).slice(0, 5))
</script>

<template>
  <div>
    <section v-if="setup && setup.done < setup.total" class="flex min-h-10 items-center gap-2.5 border-b border-edge bg-surface-subtle py-1.5 pr-3 pl-4 text-meta md:min-h-12" aria-label="what needs doing">
      <span class="size-1.5 shrink-0 bg-edge-accent" aria-hidden="true" />
      <p class="min-w-0 flex-1">You haven't finished setting up Conare: {{ setup.done }} of {{ setup.total }} steps done.</p>
      <PixelButton class="shrink-0" @click="emit('finishSetup')">Finish setup <ArrowRight :size="12" :stroke-width="1.5" aria-hidden="true" /></PixelButton>
    </section>
    <div class="mx-auto flex w-full max-w-page-wide flex-col gap-6 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
      <section class="ds-ovlead" aria-label="your platform">
        <div class="flex min-w-0 flex-col items-start gap-2 bg-surface p-5">
          <h1 class="type-heading-2">{{ greeting }}<span class="text-edge-accent">.</span></h1>
          <p class="max-w-[56ch] text-ui text-fg-muted">Help your agents search through <span class="tabular-nums">{{ num(documents) }}</span> documents.</p>
          <div class="mt-auto flex w-full flex-row items-center gap-2 pt-6">
            <PixelButton @click="emit('createKey')">Create API key</PixelButton>
            <Button @click="emit('readDocs')">Read the docs</Button>
          </div>
        </div>
        <div class="flex min-h-84 items-center justify-center bg-code-raised px-4 py-6" aria-hidden="true">
          <div class="w-full max-w-100 border border-code-edge bg-code text-code-fg">
            <div class="flex h-11 items-center gap-2 px-4">
              <span class="size-2.5 bg-edge-accent" />
              <span class="text-ui leading-4">Your code</span>
              <span class="bg-code-raised px-1.5 py-0.5 text-caption text-code-muted">API</span>
            </div>
            <div class="flex flex-col gap-3 px-4 pt-1 pb-4">
              <p class="ml-10 bg-code-raised px-3 py-2.5 text-ui"><span class="block type-code-sm text-code-muted">POST /query</span>How do refunds work?</p>
              <p class="flex items-center justify-end gap-1.5 text-meta text-code-muted"><span class="text-neutral-600">API key</span> added to headers</p>
              <p class="flex items-center gap-2 text-meta text-code-muted"><span class="size-2.5 shrink-0 bg-home-red" /><span class="flex-1">200 OK</span><span class="tabular-nums">62 ms</span></p>
              <p class="text-ui leading-6">Refunds are available for 30 days.</p>
              <p class="flex items-center gap-2 text-meta text-code-muted">Source <span class="inline-flex items-center gap-1.5 bg-code-raised px-1.5 py-0.5 text-code-fg"><span class="size-1.5 bg-home-red" />Refunds</span></p>
            </div>
          </div>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_288px]">
        <OverviewQueries v-bind="queries" />
        <section class="flex min-w-0 flex-col border border-edge bg-surface" aria-labelledby="credits-title">
          <div class="flex items-center justify-between gap-3 border-b border-edge px-4 py-3">
            <h2 id="credits-title" class="type-ui-strong">Credits</h2>
            <a href="#" class="ds-ovlink type-meta text-fg-muted" @click.prevent="emit('billing')">Billing</a>
          </div>
          <div class="flex flex-1 flex-col gap-3 p-4">
            <p><span class="text-heading-4 font-medium tabular-nums">{{ usd(credits.left) }}</span> <span class="type-meta text-fg-muted">left of {{ usd(credits.total) }}</span></p>
            <div class="h-1 bg-edge" role="meter" :aria-valuenow="Math.round(share * 100)" aria-valuemin="0" aria-valuemax="100" aria-label="credits left"><span class="block h-full bg-surface-inverse" :style="{ width: `${share * 100}%` }" /></div>
            <ul class="mt-auto divide-y divide-edge">
              <li v-for="s in credits.spenders" :key="s.name" class="flex items-center justify-between gap-3 py-2 text-meta">
                <span class="min-w-0 truncate type-code-sm">{{ s.name }}</span>
                <span class="flex shrink-0 items-baseline"><span class="w-16 text-right tabular-nums">{{ usd(s.cost) }}</span><span class="w-10 text-right text-fg-muted tabular-nums">{{ pct(s.share) }}</span></span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <section class="flex min-w-0 flex-col gap-2" aria-labelledby="data-title">
        <div class="flex items-center justify-between gap-4">
          <h2 id="data-title" class="type-ui-strong">Namespaces</h2>
          <Button variant="ghost" @click="emit('viewAll')">View all <ArrowRight :size="12" :stroke-width="1.5" aria-hidden="true" /></Button>
        </div>
        <Table framed label="namespaces">
          <thead><tr><th>Name</th><th class="hidden md:table-cell">Health</th><th>Documents</th><th class="hidden md:table-cell">Last used</th><th class="w-8"><span class="sr-only">Open</span></th></tr></thead>
          <tbody>
            <tr v-for="ns in top" :key="ns.name" class="is-link" @click="emit('openNamespace', ns.name)">
              <td class="whitespace-nowrap"><button type="button" class="type-code-sm text-left" @click.stop="emit('openNamespace', ns.name)">{{ ns.name }}</button></td>
              <td class="hidden whitespace-nowrap md:table-cell">
                <span v-if="ns.health === 'error'" class="inline-flex items-center gap-1.5 bg-status-failed px-1.5 text-meta leading-5 text-status-failed-fg"><span class="size-1 bg-edge-accent" />needs attention</span>
                <span v-else-if="ns.health === 'syncing'" class="inline-flex items-center gap-1.5 bg-status-working px-1.5 text-meta leading-5 text-status-working-fg"><DotMatrix tone="inverse" />syncing</span>
                <span v-else-if="ns.health === 'ready'" class="text-fg-muted">Synced {{ ns.synced }}</span>
                <span v-else class="text-fg-muted">By API</span>
              </td>
              <td class="tabular-nums">{{ num(ns.documents) }}</td>
              <td class="hidden whitespace-nowrap md:table-cell" :class="!ns.lastUsed && 'text-fg-muted'">{{ ns.lastUsed ?? 'never' }}</td>
              <td class="text-right"><ChevronDown :size="12" :stroke-width="1.5" class="inline text-fg-muted" aria-hidden="true" /></td>
            </tr>
          </tbody>
        </Table>
      </section>
    </div>
  </div>
</template>

<style>
/* The lead in the website's double rule: a hairline, a second 4px outside it. */
/* ds-override: 5px holds the outer rule (4px offset plus its 1px) inside the page, as platform.css does. */
.ds-ovlead { display: grid; margin: 5px; border: var(--ds-border-hairline) solid var(--ds-color-edge); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; }
@media (min-width: 900px) { .ds-ovlead { grid-template-columns: 312px minmax(0, 1fr); } }
@media (min-width: 1180px) { .ds-ovlead { grid-template-columns: 360px minmax(0, 1fr); } }
.ds-ovlink { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-ovlink:hover { color: var(--ds-color-fg); } }
@media (max-width: 639px) { .ds-ovlead :is(button, a) { min-height: 40px; } }
</style>
