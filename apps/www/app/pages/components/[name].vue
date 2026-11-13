<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import CodeBlock from '@/components/ui/CodeBlock.vue'
import { addCommand, asInstalled, elementTags, FLAVORS, flavorFiles, hasFlavor, findItem, importLines, ordered, sourceOf } from '~/utils/registry'
import { useFlavor } from '~/utils/flavor'

// One item: its install line, every example live in a frame, when to use it and not, the examples' code, the
// component's source (the files apps install), then the previous and next items.
const route = useRoute()
const item = computed(() => findItem(String(route.params.name)))
if (!item.value) throw createError({ statusCode: 404, statusMessage: 'No such component' })
useHead({ title: () => `${item.value?.title} | Conare design system`, meta: [{ name: 'description', content: () => item.value?.description ?? '' }] })
const all = ordered()
const at = computed(() => all.findIndex(i => i.name === item.value?.name))
const prev = computed(() => all[at.value - 1])
const next = computed(() => all[at.value + 1])
// The flavor picked (Vue, React or Web component): the install line, usage, examples' code and source follow it. An
// item not ported to it yet says so and shows the Vue files.
const flavor = useFlavor()
const ported = computed(() => hasFlavor(item.value!, flavor.value))
const shown = computed(() => (ported.value ? flavor.value : 'vue'))
const flavorLabel = computed(() => FLAVORS.find(f => f.value === flavor.value)!.label)
const files = computed(() => flavorFiles(item.value!, shown.value))
// The element examples as the registry ships them (Lucide icons inlined as SVGs, ready to paste), once fetched.
const built = ref<Record<string, string>>({})
watch(shown, async (f) => {
  if (f !== 'elements' || Object.keys(built.value).length) return
  try {
    const data = await $fetch<{ flavors?: { elements?: { examples: Array<{ path: string, content: string }> } } }>(`/r/${item.value!.name}.json`)
    built.value = Object.fromEntries((data.flavors?.elements?.examples ?? []).map(e => [e.path, e.content]))
  }
  catch {}
}, { immediate: true })
const examples = computed(() => files.value.examples.map(path => ({ label: path.split('/').pop()!, code: built.value[path] ?? asInstalled(sourceOf(path), shown.value) })))
const sources = computed(() => files.value.files.map(f => ({ label: f.split('/').pop()!, code: asInstalled(sourceOf(f), shown.value) })))
const imports = computed(() => importLines(item.value!, shown.value))
const requires = computed(() => (shown.value === 'vue' ? item.value!.requires : item.value!.flavors[shown.value]?.requires ?? []))
const packages = computed(() => (shown.value === 'vue' ? item.value!.dependencies : shown.value === 'react' ? item.value!.flavors.react?.dependencies ?? [] : []))
const tags = computed(() => (shown.value === 'elements' ? item.value!.flavors.elements!.tags.map(t => `<${t}>`).join(', ') : ''))
const toc = [['preview', 'Preview'], ['usage', 'Usage'], ['example', 'Example'], ['source', 'Source']]
</script>

<template>
  <div v-if="item" class="mx-auto flex w-full max-w-page-wide gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <article class="flex w-full min-w-0 max-w-220 flex-col gap-10">
      <PageHead eyebrow="Component" :title="item.title" :description="item.description">
        <div class="flex flex-col items-start gap-3">
          <FlavorSwitch />
          <InstallLine :command="addCommand(item.name, shown)" />
          <InstallLine v-if="shown === 'elements'" :command="elementTags(item)" />
          <InstallLine v-else-if="imports" :command="imports" />
          <p v-if="!ported" class="type-meta text-fg-muted">{{ item.title }} has no {{ flavorLabel }} version yet; the Vue files show below.</p>
        </div>
      </PageHead>

      <section id="preview" class="grid scroll-mt-16 gap-4 md:grid-cols-2 md:scroll-mt-6" aria-label="examples">
        <PreviewFrame v-for="e in item.examples" :key="`${item.name}/${e.name}/${shown === 'elements' ? 'elements' : 'vue'}`" :item="item.name" :example="e" :flavor="shown === 'elements' ? 'elements' : 'vue'" :class="e.half ? '' : 'md:col-span-2'" />
        <p v-if="shown === 'react'" class="type-meta text-fg-muted md:col-span-2">The previews render the Vue components; the React ones render the same, pixel for pixel (checked on every example at 1440 and 390 wide).</p>
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="usage">
        <SectionHead id="usage" title="Usage" />
        <div class="grid gap-4 md:grid-cols-2">
          <div class="flex flex-col gap-2 border border-edge bg-surface p-4">
            <h3 class="type-ui-strong">Use it for</h3>
            <p class="type-ui text-fg-soft">{{ item.use_for }}</p>
          </div>
          <div class="flex flex-col gap-2 border border-edge bg-surface p-4">
            <h3 class="type-ui-strong">Avoid</h3>
            <ul class="flex flex-col gap-1 type-ui text-fg-soft">
              <li v-for="a in item.never" :key="a" class="flex gap-2"><span class="mt-2 size-1 shrink-0 bg-surface-accent" aria-hidden="true" />{{ a }}</li>
            </ul>
          </div>
        </div>
        <p class="type-ui text-fg-muted">
          <template v-if="tags">Elements: <code class="type-code-sm text-fg-soft">{{ tags }}</code>. </template>
          Files: <code class="type-code-sm text-fg-soft">{{ files.files.join(', ') }}</code>.
          <template v-if="requires.length"> Requires: <NuxtLink v-for="(r, i) in requires" :key="r" :to="`/components/${r}`" class="text-fg underline decoration-edge-strong underline-offset-4 hover:decoration-fg">{{ r }}{{ i < requires.length - 1 ? ', ' : '' }}</NuxtLink>.</template>
          <template v-if="packages.length"> Packages: <code class="type-code-sm text-fg-soft">{{ packages.join(', ') }}</code>.</template>
        </p>
        <p class="type-meta text-fg-muted">Reference: {{ item.source }}.</p>
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="example">
        <SectionHead id="example" title="Example" />
        <p class="type-ui text-fg-soft">The code of the examples above. They use sample data; connect your page's data, routes and callbacks.</p>
        <p v-if="shown === 'elements'" class="type-ui text-fg-soft">The layout around the elements uses the theme's utility classes (<code class="type-code-sm">flex</code>, <code class="type-code-sm">gap-4</code>, <code class="type-code-sm">type-meta</code>). On a page without Tailwind, <code class="type-code-sm">npx conare-ds view {{ item.name }}</code> prints each example with the CSS those classes need, in brand tokens; or lay it out with your own CSS.</p>
        <p v-else-if="shown === 'react'" class="type-ui text-fg-soft">Imports read as they do in your app after <code class="type-code-sm">add</code> (through the <code class="type-code-sm">@/</code> alias; relative where the app has none).</p>
        <CodeBlock :key="`examples-${shown}`" :samples="examples" label="examples" />
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="source">
        <SectionHead id="source" title="Source" />
        <p v-if="shown === 'elements'" class="type-ui text-fg-soft">The element's source. <code class="type-code-sm">add</code> copies the prebuilt modules (<code class="type-code-sm">{{ item.flavors.elements?.modules.join(', ') }}</code>) into your app's static folder.</p>
        <p v-else-if="shown === 'react'" class="type-ui text-fg-soft">The files <code class="type-code-sm">add</code> copies into your app, with the hooks they import.</p>
        <p v-else class="type-ui text-fg-soft">The files <code class="type-code-sm">add</code> copies into your app, with the composables they import.</p>
        <CodeBlock :key="`source-${shown}`" :samples="sources" label="source" />
      </section>

      <nav aria-label="more components" class="flex items-center justify-between gap-3 border-t border-edge pt-6">
        <NuxtLink v-if="prev" :to="`/components/${prev.name}`" class="inline-flex items-center gap-1.5 type-ui text-fg-muted transition-colors duration-120 ease-standard hover:text-fg"><ArrowLeft :size="12" :stroke-width="1.5" aria-hidden="true" />{{ prev.title }}</NuxtLink>
        <span v-else />
        <NuxtLink v-if="next" :to="`/components/${next.name}`" class="inline-flex items-center gap-1.5 type-ui text-fg-muted transition-colors duration-120 ease-standard hover:text-fg">{{ next.title }}<ArrowRight :size="12" :stroke-width="1.5" aria-hidden="true" /></NuxtLink>
      </nav>
    </article>

    <nav class="sticky top-10 hidden w-40 shrink-0 flex-col self-start xl:flex" aria-label="on this page">
      <p class="mb-2 type-meta text-fg">On this page</p>
      <a v-for="[id, label] in toc" :key="id" :href="`#${id}`" class="block border-l border-edge py-0.75 pl-3 type-meta text-fg-muted transition-colors duration-120 ease-standard hover:text-fg">{{ label }}</a>
    </nav>
  </div>
</template>
