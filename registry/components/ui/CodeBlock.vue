<script setup lang="ts">
import { computed, ref } from 'vue'
import CodeCopy from '@/components/ui/CodeCopy.vue'

// Code to read and copy (the console's CodeWindow.vue), one dark window on the site and in the product: a pill for
// each request or language and Copy on one row, a rule, then the code in 12px Geist Mono. There is always a pill: one
// names the code (`label`, else cURL for a curl command, else Shell), several pick it (`samples`). Copy takes all of
// it. Code reads left to right in every language.
const props = defineProps<{ code?: string, label?: string, samples?: { label: string, code: string }[] }>()
const emit = defineEmits<{ copied: [] }>()
const picked = ref(0)
const tabs = computed(() => props.samples?.map(s => s.label) ?? [props.label ?? (props.code?.startsWith('curl') ? 'cURL' : 'Shell')])
const shown = computed(() => props.samples?.[picked.value]?.code ?? props.code ?? '')
</script>

<template>
  <div data-ds="code-block" class="bg-code text-code-fg" dir="ltr">
    <div class="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-[color-mix(in_srgb,var(--ds-color-off-white)_24%,transparent)] p-2">
      <div v-if="tabs.length > 1" class="flex min-w-0 flex-wrap gap-0.5" role="tablist" :aria-label="label ?? 'code'">
        <button
          v-for="(t, i) in tabs"
          :key="t"
          type="button"
          role="tab"
          :aria-selected="picked === i"
          class="inline-flex h-control-sm cursor-pointer items-center px-2.5 text-meta leading-5 font-medium text-code-muted transition-[color,background-color] duration-120 ease-standard hover:text-code-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-surface-accent aria-selected:bg-code-raised aria-selected:text-code-fg"
          @click="picked = i"
        >
          {{ t }}
        </button>
      </div>
      <div v-else class="flex min-w-0"><span class="inline-flex h-control-sm min-w-0 items-center bg-code-raised px-2.5 text-meta leading-5 font-medium text-code-fg [overflow-wrap:anywhere]">{{ tabs[0] }}</span></div>
      <CodeCopy :text="shown" @copied="emit('copied')" />
    </div>
    <pre
      tabindex="0"
      :aria-label="`${tabs[samples ? picked : 0] ?? 'code'}, code`"
      class="m-0 overflow-x-auto px-4 py-3 type-code-sm leading-5 whitespace-pre focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-surface-accent"
    >{{ shown }}</pre>
  </div>
</template>
