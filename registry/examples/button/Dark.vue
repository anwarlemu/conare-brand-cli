<script setup lang="ts">
import { KeyRound } from 'lucide-vue-next'
import PixelButton from '@/components/ui/PixelButton.vue'
// The one main action on a view, as API keys has it: the website's dark button, its red squares running in on hover.
</script>

<template>
  <PixelButton large>Create key<KeyRound :size="14" :stroke-width="1.5" aria-hidden="true" /></PixelButton>
</template>
