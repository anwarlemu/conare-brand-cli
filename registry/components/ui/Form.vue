<script setup lang="ts">
import { nextTick, ref } from 'vue'

// A form in the console's grammar (new, composed from Field, Input and Button): fields stacked 16px apart, each a Field
// with its label over it and its hint or error under it; a failure from the server in a red-wash box above the actions;
// the actions at the end, the main one last. It never validates as the first value is typed: useForm shows an error
// once its field is left or the form is sent, and on a send with errors focus moves to the first field that is wrong.
// The browser's own bubbles are off (novalidate); Enter in a field sends it.
defineProps<{ failure?: string, label?: string }>()
const emit = defineEmits<{ submit: [] }>()
const form = ref<HTMLFormElement | null>(null)
async function send() {
  emit('submit')
  await nextTick()
  form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
</script>

<template>
  <form ref="form" class="flex flex-col gap-4" novalidate :aria-label="label" @submit.prevent="send">
    <slot />
    <p v-if="failure" class="flex items-start gap-2 border border-transparent bg-surface-danger px-3 py-2 type-meta text-fg-danger" role="alert">
      <span class="mt-1.5 size-1 shrink-0 bg-edge-accent" aria-hidden="true" />{{ failure }}
    </p>
    <div v-if="$slots.actions" class="flex flex-wrap items-center justify-end gap-2 pt-2"><slot name="actions" /></div>
  </form>
</template>
