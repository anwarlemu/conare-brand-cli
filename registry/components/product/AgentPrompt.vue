<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import AgentSplit from '@/components/product/AgentSplit.vue'
import AgentWindow from '@/components/product/AgentWindow.vue'
import CodePop from '@/components/ui/CodePop.vue'

// Connect a coding agent over MCP (the console's agents/Connect.vue): one column in the double-rule frame. The agent
// at work, large, on the dark panel with its grain; then the title with its red stop, the prompt in a paper box that
// shows its first lines and opens the rest in place (Show all: to its height in 200ms, back in 140ms, from wherever
// it is), and under it Copy prompt with the one-click installs, and the API call opening from its own button. The
// agent signs in with OAuth, so no key is shown. The prompt, the request and the installs come through props.
const props = withDefaults(defineProps<{ prompt: string, code: string, installs?: { label: string, href: string }[], title?: string }>(), { title: 'Give this prompt into your agent' })
const emit = defineEmits<{ copied: [], install: [label: string] }>()

// A wrapped line hangs past its indent and its list mark, so the steps still read as steps.
const lines = computed(() => props.prompt.split('\n').map((line) => {
  const text = line.trimStart()
  return { text, at: line.length - text.length, mark: /^(?:- |\d+\. )/.exec(text)?.[0].length ?? 0 }
}))
const all = ref(false)
const textId = useId()
const box = ref<HTMLElement | null>(null)
async function toggle() {
  const el = box.value
  const from = el?.offsetHeight ?? 0
  el?.getAnimations().forEach(a => a.cancel())
  all.value = !all.value
  await nextTick()
  const to = el?.offsetHeight ?? from
  if (!el || to === from || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const easing = getComputedStyle(el).getPropertyValue('--ds-easing-out').trim() || 'ease-out'
  el.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: all.value ? 200 : 140, easing })
}
</script>

<template>
  <div class="ds-agentstep">
    <section class="ds-agentwork" :aria-labelledby="`${textId}-title`">
      <div class="ds-agentwork-panel" aria-hidden="true">
        <div class="ds-agentwork-grain" />
        <div class="relative flex w-full justify-center px-4 py-8"><AgentWindow /></div>
      </div>
      <div class="ds-agentwork-card">
        <h2 :id="`${textId}-title`" class="type-heading-2 text-balance">{{ title }}<span class="text-fg-accent-display">.</span></h2>
        <div class="ds-promptbox">
          <div :id="textId" ref="box" class="ds-promptbox-text" :data-all="all || undefined">
            <pre><span v-for="(l, i) in lines" :key="i" :style="{ '--at': l.at, '--mark': l.mark }">{{ l.text }}</span></pre>
          </div>
          <div class="ds-promptbox-foot">
            <button type="button" class="ds-promptbox-more" :aria-expanded="all" :aria-controls="textId" @click="toggle">
              <span class="ds-promptbox-stack"><span :data-on="!all || undefined" :aria-hidden="all">Show all</span><span :data-on="all || undefined" :aria-hidden="!all">Show less</span></span>
              <ChevronDown :size="12" :stroke-width="1.5" class="ds-promptbox-chev" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div class="ds-agentwork-act">
          <AgentSplit :prompt="prompt" :installs="installs" large @copied="emit('copied')" @install="(l) => emit('install', l)" />
          <CodePop :code="code" label="API call" title="Search from your code" large />
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.ds-agentstep { display: block; container-type: inline-size; }
/* ds-override: 5px of margin holds the double rule (a 1px outline 4px out) inside the frame, as measured. */
.ds-agentwork { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 1px; margin: 5px; border: var(--ds-border-hairline) solid var(--ds-color-edge); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; background: var(--ds-color-edge); }
.ds-agentwork-panel { position: relative; display: flex; min-height: 372px; align-items: center; overflow: hidden; background: var(--ds-color-neutral-200); color: var(--ds-color-neutral-300); }
.ds-agentwork-grain { position: absolute; inset: 0; background-image: url("/conare-ds/textures/grain.webp"); background-repeat: repeat; background-size: 12% auto; opacity: 0.3; pointer-events: none; }
.ds-agentwork-card { display: flex; flex-direction: column; align-items: flex-start; gap: var(--ds-space-md); padding: 24px; background: var(--ds-color-surface); }
.ds-agentwork-act { display: flex; width: 100%; flex-wrap: wrap; align-items: center; gap: var(--ds-space-md); margin-top: 8px; }
.ds-promptbox { width: 100%; margin-top: 8px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); }
.ds-promptbox-text { max-height: 228px; overflow: hidden; padding: 12px 12px 0; }
.ds-promptbox-text[data-all] { max-height: none; padding-bottom: 12px; }
.ds-promptbox pre { margin: 0; font-family: var(--ds-font-code); font-size: var(--ds-text-meta); line-height: 18px; white-space: pre-wrap; overflow-wrap: anywhere; }
.ds-promptbox pre span { display: block; min-height: 18px; padding-left: calc((var(--at) + var(--mark)) * 1ch); text-indent: calc(var(--mark) * -1ch); }
.ds-promptbox-foot { display: flex; height: var(--ds-size-control-md); align-items: center; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-promptbox-more { position: relative; display: inline-flex; align-items: center; gap: var(--ds-space-xs); margin-left: 4px; color: var(--ds-color-fg-soft); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-meta-leading); white-space: nowrap; cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-promptbox-more:hover { color: var(--ds-color-fg); } }
.ds-promptbox-more:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: 2px; }
.ds-promptbox-stack { display: inline-grid; }
.ds-promptbox-stack > * { grid-area: 1 / 1; transition: opacity var(--ds-duration-swap) var(--ds-easing-out), filter var(--ds-duration-swap) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-promptbox-stack > :not([data-on]) { opacity: 0; filter: blur(2px); }
.ds-promptbox-stack > :first-child:not([data-on]) { transform: translateY(-4px); }
.ds-promptbox-stack > :last-child:not([data-on]) { transform: translateY(4px); }
.ds-promptbox-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out); }
.ds-promptbox-more[aria-expanded="true"] .ds-promptbox-chev { rotate: 180deg; transition-duration: var(--ds-duration-slide); }
@media (pointer: coarse), (max-width: 767px) { .ds-promptbox-more::after { position: absolute; inset: -12px; content: ""; } }
@media (prefers-reduced-motion: reduce) {
  .ds-promptbox-stack > * { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
  .ds-promptbox-chev { transition: none; }
}
</style>
