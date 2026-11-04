<script setup lang="ts">
import { ref } from 'vue'
import Calendar from '@/components/ui/Calendar.vue'
// Pick the day a usage report starts: the month around today, weekends closed, nothing after today.
const day = ref<Date | null>(null)
const today = new Date()
const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Calendar v-model="day" label="report start" :max="today" :disabled="weekend" />
    <p class="type-meta text-fg-muted" aria-live="polite">{{ day ? `Starts ${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : 'No day picked' }}</p>
  </div>
</template>
