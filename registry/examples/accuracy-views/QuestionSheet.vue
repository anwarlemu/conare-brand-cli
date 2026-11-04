<script setup lang="ts">
import AccuracyPanel from '@/components/product/AccuracyPanel.vue'
import ConsoleFrame from '@/components/product/ConsoleFrame.vue'
import ConsolePage from '@/components/product/ConsolePage.vue'
import { ASKED, consoleGroups, useSampleTest } from '@/examples/accuracy-views/sample'
// Accuracy views, Question sheet: the questions are the page, a sheet that fills in as the run lands.
// Sample data; wire the events to your own test.
const { view, run, add, remove } = useSampleTest()
</script>

<template>
  <ConsoleFrame :groups="consoleGroups('Performance')" :crumbs="[{ label: 'Overview', href: '#' }, { label: 'Performance' }]">
    <ConsolePage title="Performance">
      <AccuracyPanel :view="view" :version="3" link="https://console.acme.com/performance?view=accuracy" :asked="ASKED" @run="run" @add="add" @remove="remove" />
    </ConsolePage>
  </ConsoleFrame>
</template>
