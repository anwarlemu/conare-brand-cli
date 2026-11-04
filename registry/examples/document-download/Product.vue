<script setup lang="ts">
import DownloadButton from '@/components/product/DownloadButton.vue'
import DownloadMark from '@/components/product/DownloadMark.vue'
import { useDocumentDownload } from '@/composables/useDocumentDownload'
// The two places a document downloads: the mark at the end of its row in a namespace, and the button under an opened
// document or a result. Sample text stands in for your API's bytes.
const download = useDocumentDownload()
const save = () => download('handbook-security', () => new Promise<string>(done => setTimeout(() => done('Acme security handbook.\n\nEvery laptop uses full-disk encryption.'), 400)), 'handbook-security.txt')
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="type-meta text-fg-muted">In a row</p>
    <div class="flex h-row max-w-120 items-center gap-3 border-y border-edge px-3">
      <span class="min-w-0 flex-1 truncate type-code-sm">handbook-security</span>
      <span class="type-meta text-fg-muted tabular-nums">12 KB</span>
      <DownloadMark id="handbook-security" @press="save" />
    </div>
    <p class="type-meta text-fg-muted">As a button</p>
    <div class="flex items-center"><DownloadButton id="handbook-security" @press="save" /></div>
  </div>
</template>
