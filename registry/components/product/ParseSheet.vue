<script setup lang="ts">
import { REGION, isTotal, tableOf, type ParseBlock, type ParsePart } from '@/composables/useParse'

// A page as Conare read it (parse/Sheet.vue): each region drawn at its box in reading order, in a document face (a
// typewriter face, a little askew and soft, for a scan). Sizes follow the page's width, so it reads the same as a
// thumbnail and full size. `on` lights a region with a red edge and its kind; `all` outlines every region and numbers
// it; `plays` runs a red line down the page once while the regions land in order (reduced motion shows them at once);
// `mini` is a picture only. The boxes are the pointer's way in; the keyboard reaches the same regions in the text or the
// list beside the page, so they stay out of the tab order.
defineProps<{ part: ParsePart, scan?: boolean, on?: number | null, mini?: boolean, plays?: boolean, all?: boolean }>()
const emit = defineEmits<{ point: [order: number | null], pick: [order: number] }>()
const box = (b: ParseBlock) => ({ left: `${b.bbox[0] * 100}%`, top: `${b.bbox[1] * 100}%`, width: `${(b.bbox[2] - b.bbox[0]) * 100}%`, height: `${(b.bbox[3] - b.bbox[1]) * 100}%`, '--o': b.order })
const name = (b: ParseBlock) => `${REGION[b.type] ?? b.type}: ${b.type === 'table' ? `${tableOf(b.content).rows.length} rows` : b.content.slice(0, 60)}`
const stamp = (b: ParseBlock) => b.content.replace(/^Stamp:\s*/, '').split(', ')
</script>

<template>
  <div data-ds="parse-sheet" class="ds-parsepage" :data-scan="scan || undefined" :data-plays="plays || undefined" :data-all="all || undefined" :aria-hidden="mini || undefined">
    <span v-if="plays" class="ds-parse-sweep" aria-hidden="true" />
    <div v-for="b in part.blocks" :key="b.order" class="ds-parseregion" :data-type="b.type" :data-on="on === b.order || undefined" :style="box(b)">
      <table v-if="b.type === 'table'" class="ds-parsetable">
        <thead><tr><th v-for="(h, i) in tableOf(b.content).head" :key="i" scope="col">{{ h }}</th></tr></thead>
        <tbody>
          <tr v-for="(r, k) in tableOf(b.content).rows" :key="k" :data-total="isTotal(r[0] ?? '') || undefined">
            <td v-for="(c, i) in r" :key="i">{{ c }}</td>
          </tr>
        </tbody>
      </table>
      <template v-else-if="b.type === 'image'">
        <svg v-if="b.content.startsWith('Signature')" viewBox="0 0 120 40" class="ds-parsesign" aria-hidden="true"><path d="M4 28c10-20 15-22 17-16s-6 18-3 18 10-20 15-18 0 14 4 14 8-12 12-10-2 10 2 10 10-8 16-8 12 4 22 2 18-6 27-6" /></svg>
        <span v-else class="ds-parsestamp"><span>{{ stamp(b)[0] }}</span><span>{{ stamp(b).slice(1).join(', ') }}</span></span>
      </template>
      <template v-else-if="b.type === 'list'"><p v-for="(l, i) in b.content.split('\n')" :key="i">{{ l }}</p></template>
      <p v-else>{{ b.content }}</p>
      <template v-if="!mini">
        <span v-if="all" class="ds-parsenum" aria-hidden="true">{{ b.order }}</span>
        <span class="ds-parsetag" aria-hidden="true">{{ REGION[b.type] ?? b.type }}</span>
        <button type="button" tabindex="-1" class="ds-parsehit" :aria-label="name(b)" :aria-pressed="on === b.order" @pointerenter="emit('point', b.order)" @pointerleave="emit('point', null)" @click="emit('pick', b.order)" />
      </template>
    </div>
  </div>
</template>

<style>
.ds-parsepage { position: relative; width: 100%; aspect-ratio: 8.5 / 11; overflow: hidden; background: var(--ds-color-surface); color: var(--ds-color-fg); font-family: var(--ds-font-document); container-type: inline-size; }
.ds-parsepage[data-scan] { background: color-mix(in srgb, var(--ds-color-surface) 94%, var(--ds-color-fg) 6%); font-family: var(--ds-font-scan); }
.ds-parsepage[data-scan] .ds-parseregion > :not(.ds-parsehit, .ds-parsetag, .ds-parsenum) { transform: rotate(-0.25deg); filter: blur(0.15px); }
.ds-parseregion { position: absolute; font-size: 2.05cqw; line-height: 1.5; }
.ds-parseregion p { margin: 0; }
.ds-parseregion[data-type="title"] { font-size: 3.1cqw; font-weight: var(--ds-font-weight-medium); line-height: 1.2; }
.ds-parseregion:is([data-type="header"], [data-type="footer"], [data-type="footnote"]) { color: var(--ds-color-fg-soft); font-size: 1.75cqw; }
.ds-parseregion[data-type="footer"] { text-align: center; }
.ds-parseregion::before { position: absolute; inset: -0.6cqw; border: var(--ds-border-hairline) solid transparent; content: ""; pointer-events: none; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parseregion[data-on]::before { border-color: var(--ds-color-edge-accent); border-left-width: 2px; background: color-mix(in srgb, var(--ds-color-surface-accent) 6%, transparent); }
.ds-parsepage[data-all] .ds-parseregion::before { border-color: color-mix(in srgb, var(--ds-color-fg) 22%, transparent); }
.ds-parsepage[data-all] .ds-parseregion[data-on]::before { border-color: var(--ds-color-edge-accent); }
.ds-parsetag { position: absolute; bottom: calc(100% + 0.6cqw); left: -0.6cqw; z-index: 1; padding: 0 4px; background: var(--ds-color-home-red-press); color: var(--ds-color-fg-inverse); font-family: var(--ds-font-text); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parseregion[data-on] .ds-parsetag { opacity: 1; }
.ds-parsenum { position: absolute; top: -0.2cqw; right: calc(100% + 1.2cqw); z-index: 1; display: flex; min-width: 16px; height: 16px; align-items: center; justify-content: center; background: var(--ds-color-fg); color: var(--ds-color-fg-inverse); font-family: var(--ds-font-text); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); font-variant-numeric: tabular-nums; pointer-events: none; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parseregion[data-on] .ds-parsenum { background: var(--ds-color-home-red-press); }
.ds-parsehit { position: absolute; top: 50%; right: -0.6cqw; left: -0.6cqw; z-index: 2; height: calc(100% + 1.2cqw); min-height: 24px; transform: translateY(-50%); cursor: pointer; touch-action: manipulation; }
.ds-parsetable { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.ds-parsepage .ds-parsetable { height: 100%; font-size: 1.95cqw; line-height: 1.3; }
.ds-parsetable th { padding-block: 0.3em; border-bottom: var(--ds-border-hairline) solid currentColor; font-weight: var(--ds-font-weight-medium); text-align: right; white-space: nowrap; }
.ds-parsetable :is(th, td):first-child { text-align: left; }
.ds-parsetable td { padding-block: 0.15em; text-align: right; white-space: nowrap; }
.ds-parsetable :is(th, td) + :is(th, td) { padding-left: 1.2em; }
.ds-parsetable td:first-child { padding-right: 1em; white-space: normal; }
.ds-parsetable tr[data-total] td { border-top: var(--ds-border-hairline) solid currentColor; font-weight: var(--ds-font-weight-medium); }
.ds-parsesign { width: 62%; height: 100%; }
.ds-parsesign path { fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.ds-parsestamp { display: inline-flex; flex-direction: column; padding: 0.4em 0.7em; border: var(--ds-border-hairline) solid currentColor; font-size: 1.6cqw; line-height: 1.3; transform: rotate(-4deg); }
.ds-parse-sweep { position: absolute; top: 0; right: 0; left: 0; z-index: 3; height: 1px; background: var(--ds-color-edge-accent); opacity: 0; pointer-events: none; }
@media (prefers-reduced-motion: no-preference) {
  .ds-parsepage[data-plays] .ds-parse-sweep { animation: ds-parse-sweep var(--ds-duration-sweep) var(--ds-easing-standard) 1 both; }
  .ds-parsepage[data-plays] .ds-parseregion { animation: ds-parse-land var(--ds-duration-land) var(--ds-easing-standard) both; animation-delay: calc(var(--o) * 90ms); }
}
@keyframes ds-parse-sweep { 0% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; } 100% { opacity: 0; transform: translateY(129cqw); } }
@keyframes ds-parse-land { from { opacity: 0; } }
@media (pointer: coarse), (max-width: 767px) { .ds-parsehit { display: none; } }
</style>
