<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Download, ExternalLink, FileText, Trash2 } from 'lucide-vue-next'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
import MenuLabel from '@/components/ui/MenuLabel.vue'
import MenuSeparator from '@/components/ui/MenuSeparator.vue'
import { useToast } from '@/composables/useToast'
import Toaster from '@/components/ui/Toaster.vue'
// A namespace's documents: right-click a row, or focus it and press Shift+F10, for what you can do with it.
const documents = [
  { id: 'doc_8f2k1', title: 'Master services agreement', size: '412 KB' },
  { id: 'doc_3m9q7', title: 'Order form, 2026 renewal', size: '96 KB' },
  { id: 'doc_5t0x2', title: 'Data processing addendum', size: '184 KB' },
]
const picked = ref<string>()
const toast = useToast()
const doc = () => documents.find(d => d.id === picked.value)
</script>

<template>
  <div class="min-h-80 max-w-120">
    <ContextMenu label="document" @open="picked = $event">
      <ul class="border border-edge">
        <li v-for="d in documents" :key="d.id" :data-context="d.id" tabindex="0" class="flex h-row items-center gap-2 border-b border-edge px-3 last:border-b-0 transition-colors duration-120 ease-standard hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus">
          <FileText :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate">{{ d.title }}</span>
          <span class="type-code-sm text-fg-muted max-md:hidden">{{ d.id }}</span>
          <span class="w-14 text-right type-meta text-fg-muted tabular-nums">{{ d.size }}</span>
        </li>
      </ul>
      <template #menu>
        <MenuLabel><span class="truncate">{{ doc()?.title }}</span></MenuLabel>
        <MenuItem @select="toast('Opened', doc()?.id)"><ExternalLink :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Open</MenuItem>
        <MenuItem @select="toast('Copied', doc()?.id)"><Copy :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Copy ID</MenuItem>
        <MenuItem @select="toast('Downloading', doc()?.title)"><Download :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Download</MenuItem>
        <MenuSeparator />
        <MenuItem danger @select="toast('Deleted', doc()?.id)"><Trash2 :size="14" :stroke-width="1.5" class="shrink-0" aria-hidden="true" />Delete</MenuItem>
      </template>
    </ContextMenu>
    <p class="mt-3 type-meta text-fg-muted">Right-click a document, or focus it and press Shift+F10.</p>
    <Toaster />
  </div>
</template>
