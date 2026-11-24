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
  ['video', 'A layout coming in the way the site moves (MP4, WebM, GIF, a clean loop or one PNG frame), and the clips: logo reveal, lower third, a number counting up and a walkthrough of screenshots', 'video room --headline "..." --size vertical --format both'],
  ['print', 'Documents at paper size: business card, letterheads, report covers, one-pagers, case studies, event badge, name tag, certificate', 'print one-pager-letter --headline "..." --body "..."'],
  ['merch', 'Print files at real size, with bleed, safe area and the sticker cut lines', 'merch all --out merch'],
  ['icons', 'The favicon set with the sizes it lacks, app icons, profile pictures, a default share image, a web manifest and the library\'s icons as SVG', 'icons --out icons'],
  ['email', 'Email templates as HTML tables with inline styles: newsletter, announcement, receipt, password reset, signature', 'email announcement --headline "..." --button "Read more" --url https://...'],
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
    <PageHead title="Assets" description="Social posts, ads, share images, backgrounds, decks, videos, print documents, merch, icons and emails, drawn by the CLI from the tokens, the brand's faces and the logo, with the layouts of the posts tool. Headless and deterministic: the same inputs write the same bytes. Every example on this page was made by the command under it.">
      <div class="flex flex-wrap gap-2 type-meta text-fg-muted">
        <a href="#images" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Images</a>
        <a href="#sizes" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Sizes</a>
        <a href="#deck" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Deck</a>
        <a href="#video" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Video</a>
        <a href="#motion" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Motion</a>
        <a href="#documents" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Documents</a>
        <a href="#merch" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Merch</a>
        <a href="#icons" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Icons</a>
        <a href="#email" class="underline decoration-edge-strong underline-offset-4 hover:text-fg">Email</a>
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
      <p class="max-w-170 type-ui text-fg-soft">A layout lays itself out again at any size: link preview, X card, LinkedIn post and square, feed square, portrait, story (Threads, TikTok and Meta names too), X, LinkedIn and Facebook banners, LinkedIn page, YouTube channel art and thumbnail, Pinterest, the IAB display ad sizes, a video call background, desktop and phone wallpapers, an email header and a profile picture, or <code class="type-code-sm">--size 1600x900</code>. Words, the logo and key art keep out of what each platform covers (the X profile picture, the story bars, YouTube's crop, the person on a video call, a phone's clock). <code class="type-code-sm">--size all</code> writes every one; where the long sample cannot fit (a small ad), it drops its note, line or label, never a word you passed.</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <GalleryTile v-for="s in gallery.sizes" :key="s.id" :src="s.src" :width="s.width" :height="s.height" :title="s.label" :command="s.command" />
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="deck">
      <SectionHead id="deck" title="Deck" />
      <p class="max-w-170 type-ui text-fg-soft">Fifteen slide types at 1920x1080 (cover, section, agenda, statement, bullets, stat, chart, timeline, comparison, quote, image, image grid, team, questions, end), each on one of the share layouts, from a JSON file: a PNG per slide and one PDF with 16:9 pages. Only the slots you pass are drawn; <code class="type-code-sm">--sample</code> fills the rest where the brand has sample copy (the agenda, chart, timeline, comparison, grid, team and questions slides are shown on Acme's). The brand has no chart style: bars are its hairline grey with the largest in the accent. Team cards carry names and roles, never photos.</p>
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

    <section class="flex flex-col gap-4" aria-labelledby="motion">
      <SectionHead id="motion" title="Motion" />
      <p class="max-w-170 type-ui text-fg-soft">Short clips on the brand's motion steps only (settle on the way in, the long ease-out for windows, nothing eases in). A layout loops cleanly with <code class="type-code-sm">--loop</code> and as a GIF; the lower third is WebM with a transparent ground to lay over your video; the walkthrough shows your screenshots in turn (here, three of the slides above).</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <figure v-for="m in gallery.motion" :key="m.id" class="flex min-w-0 flex-col border border-edge bg-surface">
          <img v-if="m.type === 'image/gif'" :src="m.src" :width="m.width" :height="m.height" alt="" loading="lazy" class="h-auto w-full border-b border-edge bg-surface-subtle">
          <video v-else :poster="m.poster" :width="m.width" :height="m.height" controls muted playsinline preload="none" class="h-auto w-full border-b border-edge bg-surface-subtle">
            <source :src="m.src" :type="m.type">
          </video>
          <figcaption class="flex min-w-0 flex-col gap-2 p-3">
            <span class="type-ui text-fg">{{ m.label }}</span>
            <code class="fade-x min-w-0 overflow-x-auto type-code-sm whitespace-nowrap [scrollbar-width:none]" tabindex="0">{{ m.command }}</code>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="documents">
      <SectionHead id="documents" title="Documents" />
      <p class="max-w-170 type-ui text-fg-soft">Print documents at paper size (Letter and A4 where both are used), as PDF, SVG and PNG at 300 dpi, shown here on Acme's details with <code class="type-code-sm">--guides</code>. Only the words you pass are drawn. The brand has no stationery of its own: these are set from its type, hairlines, lockups and the red room, and the business card carries bleed for the printer.</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GalleryTile v-for="m in gallery.documents" :key="m.id" :src="m.src" :width="m.width" :height="m.height" :title="m.label" :description="`${m.trim}, bleed ${m.bleed} in, safe ${m.safe} in.`" :command="m.command" />
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="merch">
      <SectionHead id="merch" title="Merch" />
      <p class="max-w-170 type-ui text-fg-soft">Print files only, no mockups: SVG at physical size in inches and PNG at 300 dpi, with the approved lockups, the themes and the illustration parts. Shown here with <code class="type-code-sm">--guides</code> (the trim and the safe area). Trim, bleed and safe areas are common vendor conventions: confirm against your vendor's template.</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GalleryTile v-for="m in gallery.merch" :key="m.id" :src="m.src" :width="m.width" :height="m.height" :title="m.label" :description="`${m.trim}, bleed ${m.bleed} in, safe ${m.safe} in, ${m.method}. Variants: ${m.variants.join(', ')}.`" :command="m.command" />
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="icons">
      <SectionHead id="icons" title="Icons" />
      <p class="max-w-170 type-ui text-fg-soft">The favicons the brand ships, with the sizes it lacks made in their own colors (192, maskable, the 1024 app icon), profile pictures, a default share image with the lockup alone and a web manifest. The library's {{ gallery.iconSet.count }} icons come as SVG under their licence (Lucide, ISC; recorded in the folder).</p>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <GalleryTile v-for="i in gallery.icons" :key="i.id" :src="i.src" :width="i.width" :height="i.height" :title="i.label" :command="`npx conare-ds icons`" />
      </div>
      <ul aria-label="icon set" class="flex flex-wrap gap-px border border-edge bg-edge">
        <li v-for="i in gallery.iconSet.samples" :key="i.name" class="flex size-12 items-center justify-center bg-surface" :title="i.name"><img :src="i.src" :alt="i.name" width="24" height="24"></li>
      </ul>
      <p class="type-meta text-fg-muted">Writes {{ gallery.iconSet.files.join(', ') }} and svg/.</p>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="email">
      <SectionHead id="email" title="Email" />
      <p class="max-w-170 type-ui text-fg-soft">HTML tables with inline styles that survive Gmail, Outlook and Apple Mail, in the brand's colors and faces (with safe fallbacks). The logo is a PNG written beside them: host it and pass <code class="type-code-sm">--asset-base</code>. Shown here on Acme's copy.</p>
      <div class="grid gap-4 md:grid-cols-2">
        <figure v-for="e in gallery.emails" :key="e.id" class="flex min-w-0 flex-col border border-edge bg-surface">
          <iframe :src="e.src" :title="`${e.id} email`" loading="lazy" class="h-[420px] w-full border-b border-edge bg-surface-subtle" />
          <figcaption class="p-3"><code class="fade-x block min-w-0 overflow-x-auto type-code-sm whitespace-nowrap [scrollbar-width:none]" tabindex="0">{{ e.command }}</code></figcaption>
        </figure>
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
