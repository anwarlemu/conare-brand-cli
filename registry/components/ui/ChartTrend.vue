<script setup lang="ts">
import { computed } from 'vue'
import TrendArrow from '@/components/ui/TrendArrow.vue'

// The week's change on a usage card (usage/Trend.vue, take 1, the one picked): a second stat on the card's right, This
// week over the percent with the pixel triangle, red up and ink down. `change` is a share (0.12 is 12%).
const props = withDefaults(defineProps<{ change: number, label?: string }>(), { label: 'This week' })
const down = computed(() => props.change < 0)
const percent = computed(() => `${Math.abs(Math.round(props.change * 100))}%`)
</script>

<template>
  <div class="shrink-0 text-right" title="The last 7 days against the 7 before">
    <p class="type-meta text-fg-muted">{{ label }}</p>
    <p class="flex items-center justify-end gap-1.5 text-heading-4 font-medium tabular-nums"><TrendArrow :down="down" bare /><span class="sr-only">{{ down ? 'down' : 'up' }}</span>{{ percent }}</p>
  </div>
</template>
