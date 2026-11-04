<script setup lang="ts">
import { ref } from 'vue'
import ScopeMenu from '@/components/product/ScopeMenu.vue'
// Every namespace or one, each with its size; the filter appears past six. Namespaces written by API carry the brand
// mark. Sample data.
const scope = ref('')
const options = [
  { name: 'sec-filings', documents: 2184920 },
  { name: 'contracts', documents: 412830 },
  { name: 'slack', documents: 96410 },
  { name: 'crm', documents: 52660 },
  { name: 'engineering', documents: 31902 },
  { name: 'support', documents: 18240 },
  { name: 'wiki', documents: 7385 },
]
</script>

<template>
  <div class="flex h-100 items-start justify-center pt-4">
    <ScopeMenu v-model="scope" :options="options" own-mark="/conare-ds/logo/svg/mark.svg" />
  </div>
</template>
