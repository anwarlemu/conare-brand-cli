<script setup lang="ts">
import gallery from '../../public/gallery/index.json'
import rulesMd from '../../../../brand/illustration.md?raw'

// The illustration style as code: the rules from brand/illustration.md (each with its source) and every subject,
// drawn by `illustrate` as SVG of real vector shapes and as PNG.
useHead({ title: 'Illustrations | Conare design system' })
const block = rulesMd.slice(rulesMd.indexOf('## Rules'), rulesMd.indexOf('## Subjects'))
const rules = [...block.matchAll(/^\d+\. ([\s\S]*?)(?=^\d+\. |(?![\s\S]))/gm)].map((m) => {
  const text = m[1]!.replace(/\s+/g, ' ').trim()
  const bold = /^\*\*(.+?)\*\*\s*(.*)$/.exec(text)
  return { head: bold?.[1] ?? '', body: (bold?.[2] ?? text).replace(/`([^`]+)`/g, '$1') }
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-page-wide flex-col gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <PageHead title="Illustrations" description="How the brand draws, as code: stacks of documents marked with the red pixel grid, the perspective room, the wordmark as a texture, fine hatching, the strip of documents searched and the dark agent window. illustrate draws each subject as SVG of real vector shapes and as PNG, on any of the five grounds and at any size; a seed reshuffles the grid, and your picture can go on a stack's front sheet." />

    <section class="flex flex-col gap-4" aria-labelledby="subjects">
      <SectionHead id="subjects" title="Subjects" />
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <GalleryTile v-for="s in gallery.illustrations" :key="s.id" :src="s.src" :width="s.width" :height="s.height" :title="s.id" :description="s.description" :command="s.command" :href="s.svg" href-label="SVG" />
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="rules">
      <SectionHead id="rules" title="Rules" />
      <p class="max-w-170 type-ui text-fg-soft">From brand/illustration.md. Each names its source: the posts tool's drawing code and art, the website's bands and the token file. Where the sources say nothing, the command does nothing.</p>
      <ol class="flex flex-col border border-edge">
        <li v-for="(r, i) in rules" :key="i" class="flex gap-4 border-b border-edge p-4 last:border-b-0">
          <span class="w-6 shrink-0 type-code-sm text-fg-muted tabular-nums">{{ String(i + 1).padStart(2, '0') }}</span>
          <p class="type-ui text-fg-soft"><strong class="font-medium text-fg">{{ r.head }}</strong> {{ r.body }}</p>
        </li>
      </ol>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="use">
      <SectionHead id="use" title="Use" />
      <InstallLine command="npx conare-ds illustrate stack --shape tall --image shot.png --size 800x1000" />
      <InstallLine command="npx conare-ds illustrate stacks --size x-banner --theme black" />
      <InstallLine command="npx conare-ds illustrate pixels --seed 7 --transparent --format svg" />
      <p class="type-meta text-fg-muted">--theme white, paper, red, black or grey. --size WxH or a share size name. --format both, png or svg. --list names every subject.</p>
    </section>
  </div>
</template>
