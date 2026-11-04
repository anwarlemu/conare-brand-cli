<script setup lang="ts">
import { computed, ref } from 'vue'
import Field from '@/components/ui/Field.vue'
import Textarea from '@/components/ui/Textarea.vue'
// Pasting text into a namespace, with a count under it, and the same field when it is too long.
const text = ref('')
const long = ref('Refunds are available for 30 days after purchase. '.repeat(3))
const tooLong = computed(() => long.value.length > 120)
</script>

<template>
  <div class="flex w-120 max-w-full flex-col gap-6">
    <Field v-slot="{ id, hintId }" label="Text" :hint="`${text.length} of 20,000 characters`">
      <Textarea :id="id" v-model="text" :aria-describedby="hintId" placeholder="Refunds are available for 30 days after purchase." />
    </Field>
    <Field v-slot="{ id, hintId }" label="Summary" :error="tooLong ? `Keep it under 120 characters (${long.length} now).` : undefined" hint="Shown under the namespace's name.">
      <Textarea :id="id" v-model="long" :rows="3" :invalid="tooLong" :aria-describedby="hintId" />
    </Field>
  </div>
</template>
