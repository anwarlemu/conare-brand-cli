<script setup lang="ts">
import CreditHistory from '@/components/product/CreditHistory.vue'
// Two years of credits for a sample team: the latest five, then five more at a time.
const reasons = ['Monthly plan', 'Top-up', 'Monthly plan', 'Launch credits', 'Monthly plan', 'Top-up', 'Monthly plan']
const grants = Array.from({ length: 14 }, (_, i) => ({
  amount: [500, 250, 500, 1000, 500, 100, 500][i % 7]!,
  reason: i === 13 ? 'Welcome credits' : reasons[i % 7]!,
  date: new Date(Date.UTC(2026, 9 - i * 2 + (i % 2), 3 + (i % 5) * 4, 15, 20)).toISOString(),
}))
</script>

<template>
  <div class="max-w-140 border border-edge p-6"><CreditHistory :grants="grants" time-zone="UTC" /></div>
</template>
