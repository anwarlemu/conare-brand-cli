<script setup lang="ts">
import { ref } from 'vue'
import { Check, Copy, Download, FilePlus, Layers, RefreshCw, Trash2, Upload } from 'lucide-vue-next'
import Menubar from '@/components/ui/Menubar.vue'
import MenubarMenu from '@/components/ui/MenubarMenu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
import MenuLabel from '@/components/ui/MenuLabel.vue'
import MenuSeparator from '@/components/ui/MenuSeparator.vue'
// A namespace's tools as a menubar: what to add, what to do with it, how to show its documents. Open one, then point
// at the next or press Right.
const sort = ref<'newest' | 'title' | 'size'>('newest')
const sorts = [{ id: 'newest', label: 'Newest first' }, { id: 'title', label: 'Title' }, { id: 'size', label: 'Size' }] as const
</script>

<template>
  <div class="min-h-72">
    <Menubar label="namespace">
      <MenubarMenu label="Add">
        <MenuItem><FilePlus :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Paste text</MenuItem>
        <MenuItem><Upload :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Upload files</MenuItem>
        <MenuItem><Layers :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Connect an app</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Namespace">
        <MenuItem><RefreshCw :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Sync now</MenuItem>
        <MenuItem><Copy :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Copy name</MenuItem>
        <MenuItem><Download :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Export documents</MenuItem>
        <MenuSeparator />
        <MenuItem danger><Trash2 :size="14" :stroke-width="1.5" class="shrink-0" aria-hidden="true" />Delete namespace</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="View">
        <MenuLabel>Sort documents</MenuLabel>
        <MenuItem v-for="s in sorts" :key="s.id" :current="sort === s.id" @select="sort = s.id">
          <span class="min-w-0 flex-1">{{ s.label }}</span>
          <Check v-if="sort === s.id" :size="14" :stroke-width="1.5" class="shrink-0" aria-label="current" />
        </MenuItem>
      </MenubarMenu>
    </Menubar>
  </div>
</template>
