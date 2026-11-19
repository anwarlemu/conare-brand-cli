<script setup lang="ts">
import FeatureGrid from '@/components/site/FeatureGrid.vue'
// What a product does, six features in the double rule.
const features = [
  {
    "title": "Search",
    "body": "Ask in plain words and get the passages that answer, ranked, with where each came from."
  },
  {
    "title": "Sync",
    "body": "Connect the apps your team uses. A changed record replaces the old one; a deleted one is deleted."
  },
  {
    "title": "Parse",
    "body": "Read any file in full: every page, table, row and cell, scanned or typed."
  },
  {
    "title": "Embed",
    "body": "Embeddings for any vector database, from the same models search runs on."
  },
  {
    "title": "Rerank",
    "body": "Put the best passages first, in one call after the search you already run."
  },
  {
    "title": "Audit",
    "body": "Every search, what it read and how long it took, kept for as long as you need."
  }
]
</script>

<template>
  <FeatureGrid
    tag="Product"
    title="Everything retrieval needs, behind one key."
    :features="features"
  />
</template>
