<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import SiteHeader from '@/components/site/SiteHeader.vue'
// The website header with the Product menu. Below 768px the links fold into the sheet behind the square button.
const items = [
  { label: 'Search', desc: 'Store documents and query them.', href: '#search' },
  { label: 'Sync', desc: 'Keep your apps in a namespace.', href: '#sync' },
  { label: 'Parse', desc: 'Read any file in full, every row and cell.', href: '#parse' },
  { label: 'Embed', desc: 'Embeddings for any vector database.', href: '#embed' },
  { label: 'Rerank', desc: 'Put the best passages first.', href: '#rerank' },
]
const more = [
  { label: 'Benchmarks', desc: 'Accuracy you can check, losses included.', href: '#benchmarks' },
  { label: 'Price vs accuracy', desc: 'Most accurate, and the cheapest.', href: '#price' },
]
const links = [{ label: 'FAQ', href: '#faq' }, { label: 'Pricing', href: '#pricing', current: true }, { label: 'Docs', href: '#docs' }]
</script>

<template>
  <div class="relative -m-8 min-h-150">
    <SiteHeader :items="items" :more="more" :links="links" home-label="Acme home">
      <template #logo><img src="/conare-ds/logo/svg/primary-logo.svg" alt="" width="147" height="24" class="h-6 w-auto"></template>
      <template #actions>
        <Button href="#contact">Contact us</Button>
        <PixelButton href="#dashboard">Dashboard</PixelButton>
      </template>
    </SiteHeader>
  </div>
</template>
