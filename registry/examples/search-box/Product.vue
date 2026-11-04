<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import ScopeMenu from '@/components/product/ScopeMenu.vue'
import SearchBox, { type Attachment } from '@/components/product/SearchBox.vue'
// The search box as Explorer has it: the question, the files attached, the plus for more data, the scope, the Enter cue
// and the arrow, red once there is a question. Files stay here: each shows adding, then added. The scope is the
// console's scope menu, in the box's `scope` slot.
const text = ref('notice period to terminate a contract')
const scope = ref('')
const namespaces = [
  { name: 'contracts', documents: 412830 },
  { name: 'slack', documents: 96410 },
  { name: 'crm', documents: 52660 },
]
const attached = ref<Attachment[]>([{ key: 'msa', name: 'acme-msa.pdf', state: 'added' }])
const busy = ref(false)
const timers: Array<ReturnType<typeof setTimeout>> = []
function attach(names: string[]) {
  for (const name of names) {
    const key = `${name}-${Date.now()}`
    attached.value = [...attached.value, { key, name, state: 'adding' }]
    timers.push(setTimeout(() => { attached.value = attached.value.map(a => (a.key === key ? { ...a, state: 'added' } : a)) }, 900))
  }
}
function search() {
  busy.value = true
  timers.push(setTimeout(() => { busy.value = false }, 1200))
}
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="h-90 w-full">
    <SearchBox
      v-model="text"
      :attached="attached"
      :target="scope || 'uploads'"
      :busy="busy"
      @submit="search"
      @files="files => attach(files.map(f => f.name))"
      @paste="t => attach([`${t.split(/\s+/).slice(0, 6).join(' ').slice(0, 60)}.txt`])"
      @remove="key => (attached = attached.filter(a => a.key !== key))"
    >
      <template #scope>
        <ScopeMenu v-model="scope" :options="namespaces" own-mark="/conare-ds/logo/svg/mark.svg" />
      </template>
    </SearchBox>
  </div>
</template>
