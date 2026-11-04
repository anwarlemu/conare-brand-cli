<script setup lang="ts">
import { computed, ref } from 'vue'
import Checkbox from '@/components/ui/Checkbox.vue'
// Which events a webhook sends: each a checkbox with a hint, and one over them all that shows a bar while some are on.
const events = ref({ synced: true, failed: true, deleted: false })
const all = computed({
  get: () => Object.values(events.value).every(Boolean),
  set: (on: boolean) => { events.value = { synced: on, failed: on, deleted: on } },
})
const some = computed(() => !all.value && Object.values(events.value).some(Boolean))
</script>

<template>
  <fieldset class="flex flex-col">
    <legend class="mb-1 type-meta text-fg-soft">Send these events</legend>
    <Checkbox v-model="all" :indeterminate="some" label="All events" />
    <div class="flex flex-col pl-6">
      <Checkbox v-model="events.synced" label="Source synced" hint="When a sync finishes with new documents." />
      <Checkbox v-model="events.failed" label="Source failed" hint="When a sync stops and needs you." />
      <Checkbox v-model="events.deleted" label="Document deleted" />
    </div>
    <Checkbox class="mt-2" label="Signed payloads (always on)" :model-value="true" disabled />
  </fieldset>
</template>
