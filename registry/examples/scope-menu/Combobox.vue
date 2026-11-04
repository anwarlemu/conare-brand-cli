<script setup lang="ts">
import { ref } from 'vue'
import Combobox from '@/components/ui/Combobox.vue'
import Field from '@/components/ui/Field.vue'
// Any list with a filter: type to narrow it, arrows to move, Enter to pick.
const model = ref<string | number>('')
const models = ['conare-embed-1', 'conare-embed-1-small', 'conare-rerank-1', 'conare-rerank-1-fast', 'conare-parse-1', 'acme-custom-embed', 'acme-custom-rerank', 'acme-legal-embed'].map(m => ({ value: m, label: m }))
</script>

<template>
  <div class="h-96 w-full max-w-72">
    <Field v-slot="{ id }" label="Model">
      <Combobox :id="id" v-model="model" :options="models" label="model" placeholder="Choose a model" filter-label="Filter models" width="288px" />
    </Field>
  </div>
</template>
