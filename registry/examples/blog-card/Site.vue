<script setup lang="ts">
import BlogCard from '@/components/site/BlogCard.vue'
// The blog's list: three posts, each with its picture of cells. The first plays a small window once it is on screen
// (the website puts a benchmark's leaderboard there); the slot takes any 520 by 380 window.
const posts = [
  { slug: 'retrieval-benchmark', title: 'Acme retrieval benchmark: 67.0, #1 of 9', dek: 'Search over 19,252 business document pages with 2,419 questions.', category: 'Benchmarks', date: 'October 14, 2026' },
  { slug: 'six-languages', title: 'Six languages, one index', dek: 'The same pages, with questions asked in six languages.', category: 'Product', date: 'October 2, 2026' },
  { slug: 'changelog-october', title: 'What changed in October', dek: 'Faster syncs, filters in search and a new usage page.', category: 'Changelog', date: 'September 30, 2026' },
]
const rows = [{ name: 'Acme embed 1', value: 67, ours: true }, { name: 'Provider B', value: 66 }, { name: 'Provider C', value: 64 }]
</script>

<template>
  <div class="grid gap-6 md:grid-cols-3">
    <BlogCard v-for="(p, n) in posts" :key="p.slug" :href="`#${p.slug}`" :title="p.title" :dek="p.dek" :category="p.category" author="Acme team" :date="p.date">
      <template v-if="n === 0" #window="{ active }">
        <div class="ds-blog-window flex h-full w-full flex-col gap-4 border border-code-edge bg-code p-6 text-code-fg" :data-active="active || undefined">
          <p class="type-heading-3">Leaderboard</p>
          <ol class="flex flex-col gap-4">
            <li v-for="(r, i) in rows" :key="r.name" class="flex flex-col gap-2" :style="{ '--i': i }">
              <span class="flex justify-between type-body"><span>{{ r.name }}</span><span class="tabular-nums">{{ r.value.toFixed(1) }}</span></span>
              <span class="h-2 bg-code-raised"><span class="ds-blog-bar block h-full" :class="r.ours ? 'bg-home-red' : 'bg-neutral-500'" :style="{ width: `${(r.value / 80) * 100}%` }" /></span>
            </li>
          </ol>
        </div>
      </template>
    </BlogCard>
  </div>
</template>

<style>
/* The sample window's bars grow once, as it comes on screen; reduced motion shows them grown. */
.ds-blog-bar { transform-origin: left; transform: scaleX(0.05); transition: transform var(--ds-duration-entrance) var(--ds-easing-out); transition-delay: calc(var(--i) * 80ms); }
.ds-blog-window[data-active] .ds-blog-bar { transform: none; }
@media (prefers-reduced-motion: reduce) { .ds-blog-bar { transform: none; transition: none; } }
</style>
