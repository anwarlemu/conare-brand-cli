<script setup lang="ts">
import { computed, useId } from 'vue'

// A label over one control, with a hint or an error under it (the console's forms): the label 12px soft, the hint
// 12px muted, the error in the danger red. The slot receives the ids to wire: <Input :id="id" :aria-describedby="hintId" />.
const props = defineProps<{ label: string, hint?: string, error?: string, id?: string }>()
const auto = useId()
const id = computed(() => props.id ?? `field-${auto}`)
const hintId = computed(() => (props.hint || props.error ? `${id.value}-hint` : undefined))
</script>

<template>
  <div data-ds="field" class="flex flex-col gap-1.5">
    <label :for="id" class="type-meta text-fg-soft">{{ label }}</label>
    <slot :id="id" :hint-id="hintId" :invalid="!!error" />
    <p v-if="error || hint" :id="hintId" class="type-meta" :class="error ? 'text-fg-danger' : 'text-fg-muted'" :role="error ? 'alert' : undefined">{{ error || hint }}</p>
  </div>
</template>
