<script setup lang="ts">
import { ref } from 'vue'
import Direction from '@/components/ui/Direction.vue'
import Tabs from '@/components/ui/Tabs.vue'
// One card in either direction: the label and value swap sides, the code stays left to right.
const dir = ref<'ltr' | 'rtl'>('rtl')
const options = [{ value: 'ltr', label: 'Left to right' }, { value: 'rtl', label: 'Right to left' }]
</script>

<template>
  <div class="flex flex-col gap-4">
    <Tabs v-model="dir" :options="options" label="direction" />
    <Direction :dir="dir">
      <div class="flex max-w-md flex-col gap-3 border border-edge p-4">
        <div class="flex items-center justify-between gap-4 type-ui">
          <span class="text-fg-soft">مساحة الأسماء</span>
          <span class="type-code-sm">contracts</span>
        </div>
        <p class="border-s-2 border-edge-accent ps-3 type-meta text-fg-muted">يبحث Conare في المستندات ويعيد المقاطع التي تجيب عن السؤال.</p>
        <pre class="bg-code px-3 py-2 type-code-sm text-code-fg">curl https://api.acme.com/v1/search</pre>
      </div>
    </Direction>
  </div>
</template>
