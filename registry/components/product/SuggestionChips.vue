<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'

// Questions to start from under the search box (search/SuggestChips.vue, the picked take 3): each chip ends on a mono tag
// for the namespace that answers it, with the app's 10px mark when there is one. A paper block glides between the chips
// under the pointer or focus (160ms on the console's curve, placed without a glide the first time) and fades when the
// pointer leaves; the tag under it goes a shade darker, never lighter. Picking one emits `ask`.
export interface Suggestion { q: string, ns: string, logo?: string }
defineProps<{ items: Suggestion[], label?: string }>()
defineEmits<{ ask: [item: Suggestion] }>()

const shown = ref(false)
const instant = ref(true)
const mark = ref({ x: 0, y: 0, w: 0, h: 0 })
function glide(event: Event) {
  const el = event.currentTarget as HTMLElement
  instant.value = !shown.value
  shown.value = true
  mark.value = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }
}
</script>

<template>
  <div class="relative flex flex-wrap justify-center gap-2" role="group" :aria-label="label ?? 'suggested searches'" @pointerleave="shown = false">
    <span class="ds-chipmark" :data-shown="shown || undefined" :data-instant="instant || undefined" :style="{ transform: `translate(${mark.x}px, ${mark.y}px)`, width: `${mark.w}px`, height: `${mark.h}px` }" aria-hidden="true" />
    <button v-for="s in items" :key="s.q" type="button" class="ds-sgchip" @pointerenter="glide" @focus="glide" @blur="shown = false" @click="$emit('ask', s)">
      <Search :size="12" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />
      <span class="min-w-0">{{ s.q }}</span>
      <span class="ds-sgtag"><span class="sr-only">in</span><img v-if="s.logo" :src="s.logo" alt="" width="10" height="10" class="size-2.5 object-contain">{{ s.ns }}</span>
    </button>
  </div>
</template>

<style>
.ds-chipmark { position: absolute; top: 0; left: 0; background: var(--ds-color-surface-subtle); opacity: 0; pointer-events: none; transition: transform var(--ds-duration-glide) var(--ds-easing-standard), width var(--ds-duration-glide) var(--ds-easing-standard), height var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-chipmark[data-shown] { opacity: 1; }
.ds-chipmark[data-instant] { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-sgchip { position: relative; display: inline-flex; height: var(--ds-size-control-sm); align-items: center; gap: var(--ds-space-sm); padding: 0 4px 0 10px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: transparent; color: var(--ds-color-fg); font-size: var(--ds-text-meta); text-align: left; cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-sgchip:active { background: var(--ds-color-surface-subtle); }
.ds-sgtag { display: inline-flex; height: 20px; flex-shrink: 0; align-items: center; gap: var(--ds-space-xs); margin-left: 2px; padding: 0 6px; background: var(--ds-color-surface-subtle); color: var(--ds-color-fg-soft); font-family: var(--ds-font-code); font-size: var(--ds-text-caption); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-sgchip:hover .ds-sgtag { background: var(--ds-color-surface-sunken); } }
.ds-sgchip:focus-visible .ds-sgtag { background: var(--ds-color-surface-sunken); }
@media (pointer: coarse), (max-width: 767px) { .ds-sgchip { height: auto; min-height: var(--ds-size-control-touch); max-width: 100%; padding-block: 6px; font-size: var(--ds-text-ui); } }
@media (prefers-reduced-motion: reduce) { .ds-chipmark { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); } }
</style>
