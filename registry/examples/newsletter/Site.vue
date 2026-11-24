<script setup lang="ts">
import { ref } from 'vue'
import Newsletter from '@/components/site/Newsletter.vue'
// The sign-up on sample data: send it with an address to see the line that follows.
const sent = ref(false)
</script>

<template>
  <div class="-mx-8 pt-8">
    <Newsletter tag="Newsletter" title="News from the team, once a month." body="What shipped, what we learned, and nothing else." sent-text="You are on the list. The next issue comes at the start of the month." :sent="sent" @submit="sent = true" />
  </div>
</template>
