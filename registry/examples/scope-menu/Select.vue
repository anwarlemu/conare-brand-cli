<script setup lang="ts">
import { ref } from 'vue'
import Field from '@/components/ui/Field.vue'
import Select from '@/components/ui/Select.vue'
// A select in a form: the field opens a listbox at least as wide as itself, the pick checked.
const region = ref('us-east')
const regions = [
  { value: 'us-east', label: 'US East (Virginia)' },
  { value: 'us-west', label: 'US West (Oregon)' },
  { value: 'eu-central', label: 'EU Central (Frankfurt)' },
  { value: 'ap-south', label: 'Asia Pacific (Mumbai)', disabled: true },
]
</script>

<template>
  <div class="h-72 w-full max-w-72">
    <Field v-slot="{ id }" label="Region" hint="Where your namespaces are stored.">
      <Select :id="id" v-model="region" :options="regions" label="region" />
    </Field>
  </div>
</template>
