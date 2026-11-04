<script setup lang="ts">
import RollText from '@/components/visuals/RollText.vue'
// The website footer's legal line: hover a link and its label rolls up to a copy of itself, one line at the site's pace.
</script>

<template>
  <div data-theme="dark" class="-m-8 flex flex-wrap items-center gap-x-6 gap-y-2 bg-surface p-8 text-ui text-fg/80">
    <span>© 2026 Acme, Inc.</span>
    <a href="#privacy" class="ds-roll-host transition-colors duration-200 ease-standard hover:text-fg"><RollText text="Privacy" pace="site" /></a>
    <a href="#terms" class="ds-roll-host transition-colors duration-200 ease-standard hover:text-fg"><RollText text="Terms" pace="site" /></a>
  </div>
</template>
