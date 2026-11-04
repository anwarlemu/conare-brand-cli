<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Activity, Atom, BookOpen, Compass, CreditCard, Gauge, House, KeyRound, Layers, Network, Plug, Search, Settings, SquareTerminal, UserPlus } from 'lucide-vue-next'
import CommandPalette, { type PaletteDocument } from '@/components/product/CommandPalette.vue'
// The sidebar's search alone, in the middle of the frame: a click opens the palette, and the frame grows for it.
// On a console page, ⌘K and / open it too. Documents are sample matches, found 200ms after the last key.
const open = ref(false)
const pages = [
  { label: 'Overview', icon: House }, { label: 'Namespaces', icon: Layers }, { label: 'Sources', icon: Network },
  { label: 'Agents', icon: SquareTerminal }, { label: 'Custom models', icon: Atom }, { label: 'API keys', icon: KeyRound },
  { label: 'Performance', icon: Gauge }, { label: 'Usage', icon: Activity }, { label: 'Billing', icon: CreditCard },
  { label: 'Settings', icon: Settings }, { label: 'Explorer', icon: Compass },
]
const actions = [
  { label: 'Connect an app', icon: Plug }, { label: 'Create an API key', icon: KeyRound },
  { label: 'Copy the agent prompt', icon: SquareTerminal }, { label: 'Invite members', icon: UserPlus }, { label: 'Open the docs', icon: BookOpen },
]
const namespaces = [
  { name: 'contracts', documents: 412830 }, { name: 'slack', documents: 96410 }, { name: 'crm', documents: 52660 },
  { name: 'engineering', documents: 31902 }, { name: 'support', documents: 18240 }, { name: 'wiki', documents: 7385 },
]
const corpus: PaletteDocument[] = [
  { id: 'msa-acme-2025.pdf', namespace: 'contracts', text: 'Either party may terminate this agreement with 90 days written notice.' },
  { id: 'renewal-policy.md', namespace: 'wiki', text: 'Renewals are reviewed 60 days before the term ends.' },
  { id: 'C04-launch-thread', namespace: 'slack', text: 'Notice period for the pilot is 30 days, per the order form.' },
]
const documents = ref<PaletteDocument[]>([])
const searching = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function onQuery(text: string) {
  clearTimeout(timer)
  documents.value = []
  searching.value = !!text
  if (!text) return
  // ds-latency: a stand-in for the app's search request.
  timer = setTimeout(() => {
    const words = text.toLowerCase().split(/\s+/)
    documents.value = corpus.filter(d => words.some(w => `${d.id} ${d.text}`.toLowerCase().includes(w)))
    searching.value = false
  }, 200)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="flex w-full items-center justify-center" :class="open && 'min-h-140'">
    <div class="w-sidebar">
      <button type="button" class="flex h-control-sm w-full cursor-pointer items-center gap-2 border border-edge bg-surface pr-2 pl-2.25 text-left text-meta text-fg-muted max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui outline-none transition-[border-color] duration-120 ease-standard hover:border-edge-strong focus-visible:border-edge-focus" aria-haspopup="dialog" :aria-expanded="open" @click="open = true">
        <Search :size="14" :stroke-width="1.5" aria-hidden="true" class="shrink-0" />
        <span>Search</span>
        <kbd aria-hidden="true" class="ml-auto font-text text-caption max-md:hidden">⌘K</kbd>
      </button>
    </div>
    <CommandPalette v-model:open="open" :pages="pages" :actions="actions" :namespaces="namespaces" :documents="documents" :searching="searching" @query="onQuery">
      <template #mark><img src="/conare-ds/logo/svg/mark-white.svg" alt="" width="14" height="12" class="h-3 w-auto"></template>
    </CommandPalette>
  </div>
</template>
