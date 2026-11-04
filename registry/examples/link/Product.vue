<script setup lang="ts">
import Link from '@/components/ui/Link.vue'
// A link in a sentence, a row of them, and the quiet link that shows more of a list.
</script>

<template>
  <div class="grid items-start gap-2 type-ui md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">In a sentence</p>
    <p class="leading-7 text-fg-soft">No queries yet. <Link href="#search" class="text-fg">Try a search</Link></p>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">In a row</p>
    <p class="flex gap-4 leading-7"><Link href="#billing">Billing</Link><Link href="#docs">Docs</Link><Link href="#status">Status</Link></p>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Under a list</p>
    <p class="leading-7"><Link more>Show 5 more</Link></p>
  </div>
</template>
