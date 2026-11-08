<script setup lang="ts">
import { ref } from 'vue'
import ButtonLink from '@/components/site/ButtonLink.vue'
import VizWindow from '@/components/visuals/VizWindow.vue'
import Hero from '@/components/site/Hero.vue'
// The home's first band on sample data: the teams take turns in the frame, each with its question and the answer in
// the window (the website's product window, its parts rising in turn each time a team takes over). Pick a team, or let
// the timer hand over.
const cells = (on: (x: number, y: number) => boolean) => {
  const lit: [number, number][] = []
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (on(x, y)) lit.push([x, y])
  return lit.map(([x, y]) => `M${x * 2} ${y * 2}h2v2h-2Z`).join('')
}
const teams = [
  { label: 'Sales', mark: cells((x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0), where: 'Sales agent', ask: 'What did Acme ask for at renewal?', answer: 'Twelve more months on 60 days notice, with their data kept in the EU region.', source: 'renewal-call.md' },
  { label: 'Finance', mark: cells((_, y) => y % 2 === 0), where: 'Finance agent', ask: 'Which invoices are past 30 days?', answer: 'Three: two from the March batch and one held for a missing purchase order.', source: 'ledger.xlsx' },
  { label: 'Engineering', mark: cells((x, y) => (x + y) % 3 === 0), where: 'Coding agent over MCP', ask: 'Why do sync jobs retry twice?', answer: 'The worker retries on a timeout, and the queue retries the same job once more.', source: 'issue-1182' },
  { label: 'Support', mark: cells((x, y) => x % 2 === 0 && y % 2 === 0), where: 'Support agent', ask: 'How does a customer reset their key?', answer: 'Settings, then API keys: revoke the old one and create a new one in its place.', source: 'help-center.md' },
  { label: 'Legal', mark: cells(x => x % 2 === 0), where: 'Assistant', ask: 'Where does the contract say data is stored?', answer: 'Schedule C names the EU region, and every subprocessor is listed beside it.', source: 'acme-msa.pdf' },
]
const active = ref(0)
</script>

<template>
  <Hero
    v-model="active"
    eyebrow="Search across 100M+ documents"
    title="Everything your agent needs to know"
    body="Conare finds the right answer in any data you bring, for your agents and the products you build on them."
    :tabs="teams"
  >
    <template #action><ButtonLink href="#" grain pixels arrow>Book a call</ButtonLink></template>
    <template #window>
      <VizWindow active class="text-left">
        <template #title>
          <span class="text-ui">Conare</span>
          <span class="bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500">{{ teams[active]!.where }}</span>
        </template>
        <div :key="active" class="flex flex-col gap-4 px-4 pt-1 pb-5 sm:px-7 sm:pb-6">
          <p class="ds-viz-in self-end bg-ds-neutral-200 px-3 py-2 text-body" style="--d: 200">{{ teams[active]!.ask }}</p>
          <p class="ds-viz-in text-body text-ds-neutral-600" style="--d: 700">{{ teams[active]!.answer }}</p>
          <p class="ds-viz-in flex items-center gap-2 text-meta text-ds-neutral-500" style="--d: 900">Source <span class="ds-viz-chip text-off-white"><span class="ds-viz-dot bg-home-red" />{{ teams[active]!.source }}</span></p>
        </div>
      </VizWindow>
    </template>
  </Hero>
</template>
