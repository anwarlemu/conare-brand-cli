<script setup lang="ts">
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
// The crumbs alone, as a breadcrumb anywhere: a long trail keeps every step back and truncates only the page.
const crumbs = [{ label: 'Overview', href: '#' }, { label: 'Sources', href: '#' }, { label: 'Acme drive', href: '#' }, { label: 'Quarterly planning notes for the platform team, final revision' }]
</script>

<template>
  <div class="max-w-120">
    <Breadcrumb :items="crumbs" @navigate="(_, e) => e.preventDefault()" />
  </div>
</template>
