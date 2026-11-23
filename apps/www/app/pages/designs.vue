<script setup lang="ts">
import CodeBlock from '@/components/ui/CodeBlock.vue'
import Table from '@/components/ui/Table.vue'
import gallery from '../../public/gallery/index.json'

// The design command: a graphic kept as a small file, revised in plain words or exact edits and checked on every write.
// Every picture here was made by the command under it (scripts/docs-assets.mjs).
useHead({ title: 'Designs | Conare design system' })
const d = gallery.design
const commands = [
  ['new', 'Write a design file from a template and draw it', 'design new hero --size x-banner --headline "..." -o banner.design.json'],
  ['revise', 'Change it in plain words (no model, no key); a part it does not understand changes nothing and says what it can do', 'design revise banner.design.json "bigger logo, darker theme"'],
  ['edit', 'Change it exactly: copy, theme, size, template, seed, and each layer (scale, nudge, anchor, align, hide)', 'design edit banner.design.json --set badge="New" --layer logo.anchor=top-right'],
  ['undo, redo, history', 'Step back and forward through every change', 'design undo banner.design.json'],
  ['variants', 'The same design other ways (theme, seed, template), with one labeled sheet', 'design variants banner.design.json --by theme'],
  ['sizes', 'The same design at other sizes, laid out again rather than stretched', 'design sizes banner.design.json --to og,square,story'],
  ['compare', 'Two designs side by side, with every difference listed', 'design compare a.design.json b.design.json'],
  ['render', 'Draw it again in any format and scale', 'design render banner.design.json --format png,svg,jpg --scale 2'],
  ['check', 'Every brand and layout rule; exit 1 on errors', 'design check banner.design.json'],
]
const rules = [
  ['words', 'Every word passed is drawn, whole. Copy shrinks and re-wraps to a size that reads, then the write fails saying what to shorten.'],
  ['invented', 'No words are drawn that were not passed, besides the logo and the address. --sample fills sample copy on purpose.'],
  ['overlap', 'Words, art, the window and panel edges never touch; the logo keeps its space.'],
  ['contrast', 'Small words stand 4.5 to 1 from what is behind them, large words 3 to 1; small words on red draw on the deeper red.'],
  ['safe-area', 'Words, the logo and key art keep out of what the platform covers: the X profile picture, story bars, YouTube\'s crop.'],
  ['cut', 'Nothing is cut off at the edge: windows are placed whole and patterns draw whole words.'],
  ['color and type', 'Only brand colors and faces. These, the logo and whole words can never be allowed; composition rules can, with --allow.'],
]
</script>

<template>
  <div class="mx-auto flex w-full max-w-page-wide flex-col gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <PageHead title="Designs" description="Make a graphic, then shape it until it is right. A design is a small JSON file: revise it in plain words or exact edits, undo, try variants and other sizes. Every write draws it again and runs the check, so it stays on brand whatever is asked." />

    <section class="flex flex-col gap-4" aria-labelledby="session">
      <SectionHead id="session" title="An X header, step by step" />
      <p class="max-w-170 type-ui text-fg-soft">One session, as a person would run it: each picture is the file after the command under it.</p>
      <div class="grid gap-4 lg:grid-cols-2">
        <GalleryTile v-for="s in d.steps" :key="s.step" :src="s.src" :width="s.width" :height="s.height" :title="`${s.step}. ${s.label}`" :command="s.command" />
      </div>
      <div class="flex flex-col gap-2 border border-edge bg-surface-subtle p-4">
        <p class="type-ui-strong">An off-brand request changes nothing</p>
        <code class="type-code-sm">{{ d.refused.command }}</code>
        <p class="type-meta text-fg-soft">{{ d.refused.message }}</p>
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="more">
      <SectionHead id="more" title="Variants and sizes" />
      <div class="grid gap-4 lg:grid-cols-2">
        <GalleryTile :src="d.variants.src" :width="d.variants.width" :height="d.variants.height" title="By theme" :command="d.variants.command" />
        <GalleryTile :src="d.sizes.src" :width="d.sizes.width" :height="d.sizes.height" title="Other sizes" :command="d.sizes.command" />
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="commands">
      <SectionHead id="commands" title="Commands" />
      <Table framed label="design commands">
        <thead><tr><th>Command</th><th>What it does</th><th>Example</th></tr></thead>
        <tbody>
          <tr v-for="[c, what, ex] in commands" :key="c"><td class="type-code-sm whitespace-nowrap">{{ c }}</td><td>{{ what }}</td><td class="type-code-sm">npx conare-ds {{ ex }}</td></tr>
        </tbody>
      </Table>
      <p class="type-meta text-fg-muted">Designs cover the layouts, the five cards, slides, merch, illustrations and layout videos. Every command takes <code class="type-code-sm">--json</code>; <code class="type-code-sm">manifest --json</code> lists every template, layer, phrase and rule.</p>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="rules">
      <SectionHead id="rules" title="What every write checks" />
      <Table framed label="design rules">
        <thead><tr><th>Rule</th><th>What it means</th></tr></thead>
        <tbody>
          <tr v-for="[r, what] in rules" :key="r"><td class="type-code-sm whitespace-nowrap">{{ r }}</td><td>{{ what }}</td></tr>
        </tbody>
      </Table>
    </section>
    <section class="flex flex-col gap-4" aria-labelledby="file">
      <SectionHead id="file" title="The file" />
      <p class="max-w-170 type-ui text-fg-soft">Only what was asked for: the copy, the theme, the size and each layer's edit, with the history for undo. No timestamps, so the same steps write the same bytes. Never edit the PNG or SVG by hand; change the file.</p>
      <CodeBlock :samples="[{ label: 'banner.design.json', code: d.file }]" label="design file" />
    </section>

  </div>
</template>
