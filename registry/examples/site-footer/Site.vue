<script setup lang="ts">
import SiteFooter from '@/components/site/SiteFooter.vue'
// The website's foot with its link columns and legal line.
const columns = [
  { title: 'Product', links: [{ label: 'Search', href: '#search' }, { label: 'Sync', href: '#sync' }, { label: 'Parse', href: '#parse' }, { label: 'Embed', href: '#embed' }, { label: 'Rerank', href: '#rerank' }] },
  { title: 'Developers', links: [{ label: 'Docs', href: '#docs' }, { label: 'Quickstart', href: '#quickstart' }, { label: 'API', href: '#api' }, { label: 'SDK', href: '#sdk' }, { label: 'MCP server', href: '#mcp' }] },
  { title: 'Resources', links: [{ label: 'Evals', href: '#evals' }, { label: 'Blog', href: '#blog' }, { label: 'Pricing', href: '#pricing' }, { label: 'Security', href: '#security' }, { label: 'Subprocessors', href: '#subprocessors' }, { label: 'Status', href: '#status' }] },
  { title: 'Company', links: [{ label: 'Book a demo', href: '#demo' }, { label: 'Contact us', href: '#contact' }, { label: 'Sign in', href: '#sign-in' }] },
]
</script>

<template>
  <SiteFooter
    :columns="columns"
    tagline="Search any data you bring. Get the right answer."
    legal="© 2026 Conare, Inc."
    :legal-links="[{ label: 'Privacy', href: '#privacy' }, { label: 'Terms', href: '#terms' }]"
  />
</template>
