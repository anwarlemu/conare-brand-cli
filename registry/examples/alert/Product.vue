<script setup lang="ts">
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
// Two sources that stopped syncing, each with the button that fixes it.
const failed = [
  { name: 'HubSpot', error: 'The token expired on Oct 29.' },
  { name: 'Google Drive', error: 'Conare lost access to the shared drive.' },
]
</script>

<template>
  <section class="flex flex-col gap-2" aria-label="sources that failed">
    <Alert v-for="s in failed" :key="s.name" :title="`${s.name} stopped syncing.`">
      {{ s.error }}
      <template #action><Button variant="brand">Reconnect {{ s.name }}</Button></template>
    </Alert>
  </section>
</template>
