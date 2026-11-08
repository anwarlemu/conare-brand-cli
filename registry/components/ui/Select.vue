<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import Combobox, { type ComboOption } from '@/components/ui/Combobox.vue'

// Pick one of a few options in a form: the 32px field (a #C3C1BF hairline that turns ink on focus and while open)
// with a 12px chevron that turns over as it opens, and a listbox on Menu's square panel at least as wide as the field,
// the pick checked. No filter: typing jumps to the option it starts. Arrows, Home, End, Enter, Escape (Combobox).
// Wire `id` and `aria-describedby` from Field's slot; they land on the button.
withDefaults(defineProps<{ options: ComboOption[], label: string, placeholder?: string, disabled?: boolean }>(), { placeholder: 'Choose' })
const model = defineModel<string | number>({ default: '' })
</script>

<template>
  <Combobox data-ds="select" v-model="model" :options="options" :label="label" :placeholder="placeholder" :filter="false" match-width :disabled="disabled">
    <template #trigger="{ selected }">
      <span class="min-w-0 flex-1 truncate" :class="!selected && 'text-fg-muted'">{{ selected?.label ?? placeholder }}</span>
      <ChevronDown :size="12" :stroke-width="1.5" class="shrink-0 text-fg-muted transition-[rotate] duration-120 ease-out group-aria-expanded:rotate-180 group-aria-expanded:duration-180 motion-reduce:transition-none" aria-hidden="true" />
    </template>
  </Combobox>
</template>
