<script setup lang="ts">
import CodeBlock from '@/components/ui/CodeBlock.vue'
import Table from '@/components/ui/Table.vue'
import gallery from '../../public/gallery/index.json'
import { SOURCE } from '~/utils/registry'

// Everything the CLI draws besides components: share images and posts, decks, videos, merch print files. Every example
// here was made by the command under it (scripts/docs-assets.mjs), from the tokens, the faces and the logo only.
useHead({ title: 'Assets | Conare design system' })
const commands = [
  ['image', 'Share images and social posts, PNG, SVG, JPEG or WebP: the layouts at every social size, five card templates and numbered carousels. Only the copy you pass is drawn', 'image hero --headline "..." --size og,story'],
  ['design', 'A design file you revise in plain words or exact edits, with undo, variants, other sizes and a check on every write (see Designs)', 'design new hero --size x-banner --headline "..."'],
  ['deck', 'Slides at 1920x1080 on the same layouts: a PNG per slide and one PDF', 'deck --input deck.json --out deck'],
  ['video', 'A layout coming in the way the site moves: H.264 MP4 or VP9 WebM through ffmpeg, or one PNG frame', 'video room --headline "..." --size vertical --format both'],
  ['merch', 'Print files at real size, with bleed, safe area and the sticker cut line', 'merch all --out merch'],
  ['illustrate', 'The illustration style as SVG and PNG (see Illustrations)', 'illustrate stacks --size 1500x500'],
  ['figma', 'Files and the ordered Figma MCP calls (see Figma)', 'figma tokens'],
  ['manifest', 'Every command, layout, size, slot, theme, subject, lockup and rule, for agents', 'manifest --json'],
]
const deckJson = `{
  "slides": [
    { "type": "cover", "title": "Everything your agent needs to know.", "body": "..." },
    { "type": "section", "number": "01", "title": "Retrieval for the enterprise." },
    { "type": "bullets", "title": "What your agent can do.", "items": ["Search every document", "Parse scanned PDFs"] },
    { "type": "stat", "stat": "100M+", "title": "Documents searched." },
    { "type": "image", "title": "Reranking on every query.", "image": "shot.png" },
    { "type": "end", "title": "Everything your agent needs to know.", "url": "conare.ai" }
  ]
}`
const postsJson = `{
  "images": [
    { "template": "card", "size": ["og", "square", "story"], "badge": "New", "headline": "Reranking on every query." },
    { "template": "partner", "partner": "Acme", "headline": "Conare now connects to Acme.", "theme": "paper" },
    { "template": "feature", "image": "shot.png", "headline": "See the source of every answer." }
  ]
}`
</script>

<template>
  <div class="mx-auto flex w-full max-w-page-wide flex-col gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <PageHead title="Assets" description="Social posts, share images, decks, videos and merch, drawn by the CLI from the tokens, the brand's faces and the logo, with the layouts of the posts tool. Headless and deterministic: the same inputs write the same bytes. Every example on this page was made by the command under it.">
      <div class="flex flex-wrap gap-2 type-meta text-fg-muted">
        <a href="#images" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Images</a>
        <a href="#sizes" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Sizes</a>
        <a href="#deck" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Deck</a>
        <a href="#video" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Video</a>
        <a href="#merch" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Merch</a>
        <a href="#commands" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Commands</a>
      </div>
    </PageHead>

    <section class="flex flex-col gap-4" aria-labelledby="images">
      <SectionHead id="images" title="Share images and posts" />
      <p class="max-w-170 type-ui text-fg-soft">The layouts, each in its own theme (white, paper, red, black or grey with <code class="type-code-sm">--theme</code>). Only the copy you pass is drawn (these show <code class="type-code-sm">--sample</code>); copy that does not fit whole is refused with what to shorten. Copy comes from flags or a JSON file; <code class="type-code-sm">*stars*</code> mark a highlighted phrase, and a headline ends on the red full stop. <code class="type-code-sm">--image</code> puts your picture in the feature layout's window.</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <GalleryTile v-for="i in gallery.images" :key="i.id" :src="i.src" :width="i.width" :height="i.height" :title="i.label" :description="i.description" :command="i.command" />
      </div>
      <CodeBlock :samples="[{ label: 'posts.json', code: postsJson }, { label: 'Shell', code: `npx conare-ds image --input posts.json --out posts` }]" label="several images" />
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="sizes">
      <SectionHead id="sizes" title="Every social size" />
      <p class="max-w-170 type-ui text-fg-soft">A layout lays itself out again at any size: link preview, X card, LinkedIn post and square, feed square, portrait, story, X and LinkedIn banners, LinkedIn page, YouTube channel art and thumbnail, an email header and a profile picture. Words, the logo and key art keep out of what each platform covers (the X profile picture, the story bars, YouTube's crop). <code class="type-code-sm">--size all</code> writes every one.</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <GalleryTile v-for="s in gallery.sizes" :key="s.id" :src="s.src" :width="s.width" :height="s.height" :title="s.label" :command="s.command" />
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="deck">
      <SectionHead id="deck" title="Deck" />
      <p class="max-w-170 type-ui text-fg-soft">Eight slide types at 1920x1080, each on one of the share layouts, from a JSON file: a PNG per slide and one PDF with 16:9 pages. Only the slots you pass are drawn; <code class="type-code-sm">--sample</code> fills the rest.</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GalleryTile v-for="s in gallery.slides" :key="s.id" :src="s.src" :width="s.width" :height="s.height" :title="s.label" :description="s.description" :command="s.command" />
      </div>
      <CodeBlock :samples="[{ label: 'deck.json', code: deckJson }, { label: 'Shell', code: 'npx conare-ds deck --input deck.json --out deck' }]" label="deck" />
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="video">
      <SectionHead id="video" title="Video" />
      <p class="max-w-170 type-ui text-fg-soft">Any layout coming in the way the website moves: the lockup and label settle up, the headline's letters wait faint and red and settle to ink, the line follows and a window arrives on the long ease-out, then the frame holds. Every duration and curve is a motion token. <code class="type-code-sm">--still</code> or <code class="type-code-sm">--at 0.5</code> writes one frame as PNG.</p>
      <div class="grid gap-4 md:grid-cols-2">
        <figure v-for="v in gallery.videos" :key="v.id" class="flex min-w-0 flex-col border border-edge bg-surface">
          <video :poster="v.poster" :width="v.width" :height="v.height" controls muted playsinline preload="none" class="h-auto w-full border-b border-edge bg-surface-subtle">
            <source :src="v.webm" type="video/webm">
            <source :src="v.src" type="video/mp4">
          </video>
          <figcaption class="flex min-w-0 items-center gap-2 p-3">
            <code class="fade-x min-w-0 flex-1 overflow-x-auto type-code-sm whitespace-nowrap [scrollbar-width:none]" tabindex="0">{{ v.command }}</code>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="merch">
      <SectionHead id="merch" title="Merch" />
      <p class="max-w-170 type-ui text-fg-soft">Print files only, no mockups: SVG at physical size in inches and PNG at 300 dpi, with the approved lockups, the themes and the illustration parts. Shown here with <code class="type-code-sm">--guides</code> (the trim and the safe area). Trim, bleed and safe areas are common vendor conventions: confirm against your vendor's template.</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GalleryTile v-for="m in gallery.merch" :key="m.id" :src="m.src" :width="m.width" :height="m.height" :title="m.label" :description="`${m.trim}, bleed ${m.bleed} in, safe ${m.safe} in, ${m.method}. Variants: ${m.variants.join(', ')}.`" :command="m.command" />
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="commands">
      <SectionHead id="commands" title="Commands" />
      <Table framed label="asset commands">
        <thead><tr><th>Command</th><th>What it makes</th><th>Example</th></tr></thead>
        <tbody>
          <tr v-for="[c, what, ex] in commands" :key="c"><td class="type-code-sm">{{ c }}</td><td>{{ what }}</td><td class="type-code-sm whitespace-nowrap">npx conare-ds {{ ex }}</td></tr>
        </tbody>
      </Table>
      <p class="type-meta text-fg-muted">Install with <code class="type-code-sm">npm install -D {{ SOURCE }}</code>. Every command takes <code class="type-code-sm">--help</code>, <code class="type-code-sm">--list</code> and <code class="type-code-sm">--json</code>; an unknown name exits 1 and suggests the closest one.</p>
    </section>
  </div>
</template>
