<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CodeBlock from '@/components/ui/CodeBlock.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Button from '@/components/ui/Button.vue'
import { SOURCE, items } from '~/utils/registry'
useHead({ title: 'Conare design system' })
const setup = `bun add -d ${SOURCE}
npx conare-ds init
npx conare-ds add button field dialog`
</script>

<template>
  <div class="mx-auto flex w-full max-w-page flex-col gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <PageHead title="Conare design system" description="The console's components, tokens and checks for Vue 3.5 and Nuxt 4 with Tailwind 4. Every part is built from conare.ai's own console and website, takes its data through props, and is shown here from the files apps install.">
      <div class="flex flex-wrap gap-2">
        <PixelButton href="/components">Browse {{ items.length }} components<ArrowRight :size="12" :stroke-width="1.5" aria-hidden="true" /></PixelButton>
        <Button href="/theme">Theme</Button>
      </div>
    </PageHead>

    <section class="flex flex-col gap-4" aria-labelledby="install">
      <SectionHead id="install" title="Install" />
      <div class="ds-prose type-ui text-fg-soft">
        <p>Add the CLI to a Vue or Nuxt app, then run <code>init</code> once: it writes the brand stylesheet and the Tailwind theme beside your main stylesheet, copies the fonts to <code>public/conare-ds/</code> and adds the agent contract to <code>AGENTS.md</code>. <code>add</code> copies an item's files and everything it imports into your app and installs its packages.</p>
      </div>
      <CodeBlock :code="setup" label="Shell" />
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="look">
      <SectionHead id="look" title="The look" />
      <div class="grid gap-4 md:grid-cols-2">
        <Card title="Square and quiet">
          <p class="type-ui text-fg-soft">Off-white pages, the paper for quiet panels, hairlines instead of shadows. Every control and container is square; controls are 28px, 40px on phones.</p>
        </Card>
        <Card title="One red, scarce">
          <p class="type-ui text-fg-soft">The website red marks the current page, the row under the pointer, a failure and the dark button's hover. About a tenth of a view, never a second accent.</p>
        </Card>
        <Card title="Three faces">
          <p class="type-ui text-fg-soft">Geist for everything at 13px; Faculty Glyphic for page titles and heroes; Geist Mono for code, keys and IDs. Weights 400 and 500.</p>
        </Card>
        <Card title="Quick motion">
          <p class="type-ui text-fg-soft">120ms colour changes, 160 to 200ms moves on a strong ease-out, exits faster than entrances, nothing that eases in, and none on the keyboard's paths.</p>
        </Card>
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="check">
      <SectionHead id="check" title="Check" />
      <div class="ds-prose type-ui text-fg-soft">
        <p><code>npx conare-ds check</code> reads an app's styles, templates and scripts and flags every value off the tokens: raw colours, radii and type sizes, durations off the motion steps, <code>transition-all</code>, <code>ease-in</code>, shadows and other icon packs. Each finding says what to use instead. The library itself passes it in CI.</p>
      </div>
    </section>
  </div>
</template>
