<script setup lang="ts">
import { ref } from 'vue'
import Field from '@/components/ui/Field.vue'
import NativeSelect from '@/components/ui/NativeSelect.vue'
// A member's role, a namespace in mono, and the small size in a row of filters.
const role = ref('member')
const ns = ref('contracts')
const range = ref('7d')
</script>

<template>
  <div class="flex w-90 max-w-full flex-col gap-4">
    <Field v-slot="{ id }" label="Role">
      <NativeSelect :id="id" v-model="role"><option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option></NativeSelect>
    </Field>
    <Field v-slot="{ id }" label="Namespace">
      <NativeSelect :id="id" v-model="ns" mono><option>contracts</option><option>slack</option><option>sec-filings</option></NativeSelect>
    </Field>
    <div class="flex items-center gap-2">
      <span class="type-meta text-fg-muted">Range</span>
      <NativeSelect v-model="range" small aria-label="range"><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></NativeSelect>
    </div>
  </div>
</template>
