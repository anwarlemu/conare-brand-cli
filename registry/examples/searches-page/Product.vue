<script setup lang="ts">
import { ref } from 'vue'
import { Activity, Gauge, House, KeyRound, Layers, Network, Search, SquareTerminal } from 'lucide-vue-next'
import ConsoleFrame from '@/components/product/ConsoleFrame.vue'
import SearchesPage from '@/components/product/SearchesPage.vue'
import type { SearchRow } from '@/components/product/SearchesLog.vue'
import { useDocumentDownload } from '@/composables/useDocumentDownload'
// Searches as it ships, in the console's frame, on sample data: pick a filter, open a row to see what the agent read,
// press a document to download it. Wire the events to your own routes and files.
const groups = [
  { label: 'Platform', links: [{ label: 'Overview', icon: House }, { label: 'Namespaces', icon: Layers, status: '6' }, { label: 'Sources', icon: Network }, { label: 'Agents', icon: SquareTerminal }] },
  { label: 'Manage', links: [{ label: 'API keys', icon: KeyRound }, { label: 'Performance', icon: Gauge }, { label: 'Searches', icon: Search, active: true }, { label: 'Usage', icon: Activity }] },
]
const rows: SearchRow[] = [
  { id: 's1', when: '2 min ago', question: 'What is the notice period to terminate the Acme reseller agreement?', agent: 'Support agent', outcome: 'strong', tookMs: 182, passages: [
    { id: 'acme-reseller-msa', namespace: 'contracts', text: 'Either party may terminate for convenience with 90 days written notice. Termination for cause needs a 30 day cure period.', key: '90 days written notice' },
    { id: 'acme-reseller-amendment-2', namespace: 'contracts', text: 'Amendment 2 leaves the notice period unchanged and adds a renewal window in March.', key: 'leaves the notice period unchanged' },
  ] },
  { id: 's2', when: '9 min ago', question: 'refund policy for annual plans canceled after 30 days', agent: 'Billing agent', outcome: 'weak', tookMs: 241, why: 'The closest passage covers monthly plans; nothing in support covers annual plans after 30 days.', fix: { action: 'Add the billing policy' }, passages: [
    { id: 'refunds-monthly', namespace: 'support', text: 'Monthly plans can be refunded within 30 days of the charge, in full, from the billing page.', key: 'within 30 days of the charge' },
  ] },
  { id: 's3', when: '24 min ago', question: 'Who approves vendor security reviews?', agent: 'Acme assistant', outcome: 'strong', tookMs: 156, passages: [
    { id: 'handbook-security', namespace: 'wiki', text: 'Vendor security reviews are approved by the security lead, with legal signing the data processing terms.', key: 'approved by the security lead' },
  ] },
  { id: 's4', when: '1 h ago', question: 'breach notification window in the EU data processing addendum', agent: 'Legal agent', outcome: 'none', tookMs: 318, why: 'No document in contracts mentions a breach notification window.', fix: { action: 'Connect the legal drive' }, passages: [] },
  { id: 's5', when: '2 h ago', question: 'quarterly planning notes for the platform team', agent: 'Acme assistant', outcome: 'failed', tookMs: 1240, why: 'The engineering namespace timed out while it re-indexed.', fix: { action: 'Open engineering' }, passages: [] },
  { id: 's6', when: '3 h ago', question: 'Which regions does the Acme storage service run in?', agent: 'Support agent', outcome: 'strong', tookMs: 171, passages: [
    { id: 'infra-regions', namespace: 'engineering', text: 'Storage runs in us-east-1, eu-west-1 and ap-southeast-2, with backups kept in a second region.', key: 'us-east-1, eu-west-1 and ap-southeast-2' },
  ] },
]
const show = ref<'all' | 'weak' | 'none' | 'failed'>('all')
const download = useDocumentDownload()
</script>

<template>
  <ConsoleFrame :groups="groups" :crumbs="[{ label: 'Overview', href: '#' }, { label: 'Searches' }]">
    <SearchesPage v-model:show="show" :rows="rows" @download="p => download(p.id, () => p.text)" />
  </ConsoleFrame>
</template>
