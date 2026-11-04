<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Table from '@/components/ui/Table.vue'
// Held rows while the namespaces load: each is the real row from a blank record, so its rules stay and nothing moves
// when the answer lands. Reload holds them for a second and a half; the rules come in only after 300ms.
const BLANK = { name: 'namespace', documents: 0, queried: 'never' }
const rows = [
  { name: 'contracts', documents: 412830, queried: '2 min ago' },
  { name: 'slack', documents: 96410, queried: '1 h ago' },
  { name: 'crm', documents: 52660, queried: 'yesterday' },
]
const held = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined
function load() {
  held.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { held.value = false }, 1500)
}
load()
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <Table framed label="namespaces" class="w-full">
      <thead><tr><th>Namespace</th><th class="text-right">Documents</th><th>Last query</th></tr></thead>
      <tbody>
        <Skeleton v-for="(r, i) in rows" :key="i" as="tr" :held="held">
          <td class="type-code-sm">{{ held ? BLANK.name : r.name }}</td>
          <td class="text-right tabular-nums">{{ (held ? BLANK : r).documents.toLocaleString('en-US') }}</td>
          <td class="type-meta whitespace-nowrap text-fg-muted">{{ held ? BLANK.queried : r.queried }}</td>
        </Skeleton>
      </tbody>
    </Table>
    <Button :disabled="held" @click="load">Reload</Button>
  </div>
</template>
