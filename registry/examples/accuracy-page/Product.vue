<script setup lang="ts">
import AccuracyPanel from '@/components/product/AccuracyPanel.vue'
import ConsoleFrame from '@/components/product/ConsoleFrame.vue'
import ConsolePage from '@/components/product/ConsolePage.vue'
import { ASKED, consoleGroups, useSampleTest } from '@/examples/accuracy-views/sample'
// Accuracy as it ships: Performance's second view in the console's frame, on the "Test at work" view. Run again plays
// a sample run; Add questions opens in place. Sample data for Acme; wire the events to your own test.
const { view, run, add, remove } = useSampleTest()
</script>

<template>
  <ConsoleFrame :groups="consoleGroups('Performance')" :crumbs="[{ label: 'Overview', href: '#' }, { label: 'Performance' }]">
    <ConsolePage title="Performance">
      <AccuracyPanel :view="view" link="https://console.acme.com/performance?view=accuracy" :asked="ASKED" @run="run" @add="add" @remove="remove" />
    </ConsolePage>
  </ConsoleFrame>
</template>
