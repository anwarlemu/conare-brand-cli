<script setup lang="ts">
// Short facts about one thing (console2.css .v2-fact): each a small hairline box with its name, muted, and its value,
// so a row of them wraps cleanly. Pass `facts`, or write Fact in the slot. `mono` sets a value in Geist Mono (a domain,
// an ID). Six at most; a value that needs a sentence is not a fact.
import Fact from '@/components/ui/Fact.vue'

export type FactItem = { name: string, value: string, mono?: boolean }
defineProps<{ facts?: FactItem[] }>()
</script>

<template>
  <dl class="flex flex-wrap gap-2">
    <slot><Fact v-for="f in facts" :key="f.name" :name="f.name" :value="f.value" :mono="f.mono" /></slot>
  </dl>
</template>
