<script setup lang="ts">
import { defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { exampleLoader, findItem } from '~/utils/registry'

// One example alone, for the frames on a component page. It posts its height to the page around it, open menus and
// dialogs included, so the frame grows with them. ?flavor=elements shows the web component example instead: its markup
// from /r/<item>.json, its modules (/elements/*.js) imported first, its inline scripts run.
definePageMeta({ layout: 'bare' })
const route = useRoute()
const item = findItem(String(route.params.item))
const example = item?.examples.find(e => e.name === route.params.example)
const elements = route.query.flavor === 'elements' && !!item?.flavors?.elements
const loader = item && example ? exampleLoader(item.name, example.name) : undefined
if (!loader) throw createError({ statusCode: 404, statusMessage: 'No such example' })
const Example = shallowRef(elements ? null : defineAsyncComponent(loader))
const host = ref<HTMLElement | null>(null)

/** Every element in the flat tree (through shadow roots and slots), for open overlays drawn inside elements. */
function flat(root: Element) {
  const out: Element[] = []
  const visit = (node: Element) => {
    out.push(node)
    if (node.shadowRoot) return [...node.shadowRoot.children].forEach(visit)
    if (node.localName === 'slot') {
      const assigned = (node as HTMLSlotElement).assignedElements({ flatten: true })
      if (assigned.length) return assigned.forEach(visit)
    }
    ;[...node.children].forEach(visit)
  }
  visit(root)
  return out
}
async function mountElements() {
  const res = await fetch(`/r/${item!.name}.json`)
  const data = await res.json() as { flavors?: { elements?: { modules: string[], examples: Array<{ name: string, content: string }> } } }
  const el = data.flavors?.elements
  const ex = el?.examples.find(e => e.name === example!.name)
  if (!el || !ex || !host.value) return
  await Promise.all(el.modules.map(m => import(/* @vite-ignore */ `/${m}`)))
  host.value.innerHTML = ex.content
  for (const old of host.value.querySelectorAll('script')) {
    const s = document.createElement('script')
    for (const a of old.attributes) s.setAttribute(a.name, a.value)
    s.textContent = old.textContent
    old.replaceWith(s)
  }
}
useHead({ title: `${item!.title}: ${example!.label}`, meta: [{ name: 'robots', content: 'noindex' }] })

const root = ref<HTMLElement | null>(null)
let ro: ResizeObserver | undefined
let mo: MutationObserver | undefined
function post() {
  const el = root.value
  if (!el || window.parent === window) return
  const all = elements ? flat(document.body) : [...document.querySelectorAll('.ds-menu, dialog[open]')]
  const parts = [el.getBoundingClientRect().bottom, ...all.filter(m => m.classList.contains('ds-menu') || m.classList.contains('ds-pop')).map(m => m.getBoundingClientRect().bottom + 32), ...all.filter(d => d.localName === 'dialog' && (d as HTMLDialogElement).open).map(d => d.getBoundingClientRect().height + 96)]
  window.parent.postMessage({ type: 'ds-preview-height', height: Math.max(...parts) }, window.location.origin)
}
onMounted(async () => {
  if (elements) await mountElements()
  await nextTick()
  ro = new ResizeObserver(post)
  if (root.value) ro.observe(root.value)
  mo = new MutationObserver(() => requestAnimationFrame(post))
  mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'aria-expanded'] })
  // Overlays inside elements open in their shadow roots, out of the observer's sight: a short poll covers them.
  if (elements) poll = setInterval(post, 250)
  await document.fonts?.ready
  post()
})
let poll: ReturnType<typeof setInterval> | undefined
onBeforeUnmount(() => { ro?.disconnect(); mo?.disconnect(); clearInterval(poll) })
</script>

<template>
  <div ref="root" class="bg-surface" :class="example?.center ? 'flex items-center justify-center px-8 py-10' : 'p-8'">
    <div class="min-w-0 max-w-full" :class="!example?.center && 'w-full'">
      <div v-if="elements" ref="host" class="contents" />
      <component :is="Example" v-else />
    </div>
  </div>
</template>
