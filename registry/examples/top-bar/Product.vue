<script setup lang="ts">
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import TopBar from '@/components/ui/TopBar.vue'
// The bar over every console page: where you are, each step back a link, the page in ink, a namespace in mono.
const crumbs = [{ label: 'Overview', href: '#' }, { label: 'Namespaces', href: '#' }, { label: 'contracts', mono: true }]
</script>

<template>
  <TopBar class="border border-edge">
    <Breadcrumb :items="crumbs" @navigate="(_, e) => e.preventDefault()" />
  </TopBar>
</template>
