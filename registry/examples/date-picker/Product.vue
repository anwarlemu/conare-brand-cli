<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Field from '@/components/ui/Field.vue'
// When a new API key stops working: a date in a field, from tomorrow on.
const until = ref<Date | null>(null)
const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
</script>

<template>
  <form class="flex min-h-100 max-w-80 flex-col gap-4" @submit.prevent>
    <Field v-slot="{ id }" label="Expires" hint="The key stops working at the start of this day.">
      <DatePicker :id="id" v-model="until" :min="tomorrow" placeholder="Never" />
    </Field>
    <div><Button variant="dark" type="submit">Create key</Button></div>
  </form>
</template>
