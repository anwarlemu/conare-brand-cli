<script setup lang="ts">
import { defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { exampleLoader, findItem } from '~/utils/registry'

// One example alone, for the frames on a component page. It posts its height to the page around it, open menus and
// dialogs included, so the frame grows with them.
definePageMeta({ layout: 'bare' })
const route = useRoute()
const item = findItem(String(route.params.item))
const example = item?.examples.find(e => e.name === route.params.example)
const loader = item && example ? exampleLoader(item.name, example.name) : undefined
if (!loader) throw createError({ statusCode: 404, statusMessage: 'No such example' })
const Example = shallowRef(defineAsyncComponent(loader))
useHead({ title: `${item!.title}: ${example!.label}`, meta: [{ name: 'robots', content: 'noindex' }] })

const root = ref<HTMLElement | null>(null)
let ro: ResizeObserver | undefined
let mo: MutationObserver | undefined
function post() {
  const el = root.value
  if (!el || window.parent === window) return
  const parts = [el.getBoundingClientRect().bottom, ...[...document.querySelectorAll('.ds-menu')].map(m => m.getBoundingClientRect().bottom + 32), ...[...document.querySelectorAll('dialog[open]')].map(d => d.getBoundingClientRect().height + 96)]
  window.parent.postMessage({ type: 'ds-preview-height', height: Math.max(...parts) }, window.location.origin)
}
onMounted(async () => {
  await nextTick()
  ro = new ResizeObserver(post)
  if (root.value) ro.observe(root.value)
  mo = new MutationObserver(() => requestAnimationFrame(post))
  mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'aria-expanded'] })
  await document.fonts?.ready
  post()
})
onBeforeUnmount(() => { ro?.disconnect(); mo?.disconnect() })
</script>

<template>
  <div ref="root" class="bg-surface" :class="example?.center ? 'flex items-center justify-center px-8 py-10' : 'p-8'">
    <div class="min-w-0 max-w-full" :class="!example?.center && 'w-full'">
      <component :is="Example" />
    </div>
  </div>
</template>
