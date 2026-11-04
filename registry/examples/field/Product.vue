<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
// A field with its label, one with a leading icon, and one that checks what is typed: focus turns the hairline ink,
// and an invalid value turns it red with its message.
const filter = ref('{ "team": ')
const invalid = computed(() => { try { JSON.parse(filter.value); return false } catch { return true } })
</script>

<template>
  <div class="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">With a label</p>
    <Field v-slot="{ id }" label="Name" class="max-w-90">
      <Input :id="id" placeholder="production-agent" />
    </Field>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">With an icon</p>
    <div class="max-w-90"><Input :icon="Search" placeholder="Filter namespaces" aria-label="filter namespaces" /></div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">With a hint</p>
    <Field v-slot="{ id, hintId }" label="Filter" :hint="invalid ? undefined : 'Matches documents whose metadata has these values.'" :error="invalid ? 'Filter must be valid JSON.' : undefined" class="max-w-90">
      <Input :id="id" v-model="filter" class="type-code-sm" :invalid="invalid" :aria-describedby="hintId" />
    </Field>
  </div>
</template>
