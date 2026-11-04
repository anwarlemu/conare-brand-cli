<script setup lang="ts">
import SiteTag from '@/components/ui/SiteTag.vue'
// The website's tag: 10px capitals on the red, or framed.
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <SiteTag>New</SiteTag>
    <SiteTag framed>SOC 2 Type I</SiteTag>
    <SiteTag>Parse</SiteTag>
  </div>
</template>
