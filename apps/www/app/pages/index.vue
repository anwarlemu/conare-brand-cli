<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CodeBlock from '@/components/ui/CodeBlock.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Button from '@/components/ui/Button.vue'
import { SOURCE, assetBase, elementPrefix, items } from '~/utils/registry'
useHead({ title: 'Conare design system' })
const p = elementPrefix
// One install per kind of app: add picks the flavor from the app, so the commands are the same; what they write differs.
const installs = [
  { label: 'Vue and Nuxt', code: `npm install -D ${SOURCE}\nnpx conare-ds init\nnpx conare-ds add button field dialog\n\n# app/components/ui/Button.vue and the rest, with their imports:\n#   import Button from '@/components/ui/Button.vue'` },
  { label: 'React and Next', code: `npm install -D ${SOURCE}\nnpx conare-ds init\nnpx conare-ds add button field dialog\n\n# components/ui/Button.tsx and the rest ('use client' where they need it), lucide-react installed:\n#   import { Button } from '@/components/ui/Button'` },
  { label: 'Any other stack', code: `# SvelteKit, Astro, Angular, Solid, or React and Vue without Tailwind: the web components\nnpm install -D ${SOURCE}\nnpx conare-ds add button field dialog\n\n# The modules land in your static folder (${assetBase}/elements/), with their types for TypeScript;\n# load them on the pages that use them:\n#   <script type="module" src="${assetBase}/elements/button.js"><\/script>\n#   <${p}-button variant="dark">Create key</${p}-button>` },
  { label: 'HTML or Django, no build', code: `# Run it in the project folder; nothing is installed in the page\nnpx -y ${SOURCE} add button field dialog\n\n<!-- base.html (Django: {% load static %} and {% static 'conare-ds/brand.css' %}, which add writes for you) -->\n<link rel="stylesheet" href="${assetBase}/brand.css">\n<script type="module" src="${assetBase}/elements/button.js"><\/script>\n<script type="module" src="${assetBase}/elements/field.js"><\/script>\n\n<${p}-field label="Name"><${p}-input name="name" required></${p}-input></${p}-field>\n<${p}-button variant="dark" type="submit">Create key</${p}-button>` },
]
</script>

<template>
  <div class="mx-auto flex w-full max-w-page flex-col gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <PageHead title="Conare design system" description="The console's components, tokens and checks for any web stack: Vue and Nuxt, React and Next, and web components for everything else (SvelteKit, Astro, Angular, a plain HTML page, Rails, Laravel or Django templates), with Tailwind 4, Tailwind 3 or plain CSS. Every part is built from conare.ai's own console and website, takes its data through props, and renders the same in all three.">
      <div class="flex flex-wrap gap-2">
        <PixelButton href="/components">Browse {{ items.length }} components<ArrowRight :size="12" :stroke-width="1.5" aria-hidden="true" /></PixelButton>
        <Button href="/theme">Theme</Button>
      </div>
    </PageHead>

    <section class="flex flex-col gap-4" aria-labelledby="install">
      <SectionHead id="install" title="Install" />
      <div class="ds-prose type-ui text-fg-soft">
        <p><code>init</code> writes the brand stylesheet where your app loads its styles (and the Tailwind theme with Tailwind), copies the fonts to your static folder and adds the agent contract to <code>AGENTS.md</code>. <code>add</code> copies an item and what it needs in your app's flavor: Vue in Vue and Nuxt, React in React apps, and web components everywhere else, or in a Vue or React app without Tailwind (they carry their own styles). <code>--framework vue|react|elements</code> picks one by name, and <code>add --update</code> brings what you have to the current version.</p>
      </div>
      <CodeBlock :samples="installs" label="install" />
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="flavors">
      <SectionHead id="flavors" title="Three flavors, one look" />
      <div class="grid gap-4 md:grid-cols-3">
        <Card title="Vue">
          <p class="type-ui text-fg-soft">Single-file components with props, slots and <code class="type-code-sm">v-model</code>. The source of truth.</p>
        </Card>
        <Card title="React">
          <p class="type-ui text-fg-soft">The same props; slots are <code class="type-code-sm">children</code> or a prop, <code class="type-code-sm">v-model</code> is <code class="type-code-sm">value</code> and <code class="type-code-sm">onValueChange</code>, events are callbacks.</p>
        </Card>
        <Card title="Web components">
          <p class="type-ui text-fg-soft"><code class="type-code-sm">&lt;{{ p }}-button&gt;</code> and the rest: attributes and properties, DOM events (<code class="type-code-sm">input</code>, <code class="type-code-sm">change</code>), slots. Form fields take part in forms. No build step.</p>
        </Card>
      </div>
      <p class="type-ui text-fg-muted">Each component page shows the install line, imports, examples and source for the flavor you pick; the previews render the same in each, checked pixel for pixel at desktop and phone widths.</p>
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
