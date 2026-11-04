<script setup lang="ts">
import { ref } from 'vue'
import LineTabs from '@/components/ui/LineTabs.vue'
// Line tabs for a page's sections, as a namespace has them.
const section = ref<'Documents' | 'Settings'>('Documents')
</script>

<template>
  <LineTabs v-model="section" :options="['Documents', 'Settings']" label="namespace" />
</template>
