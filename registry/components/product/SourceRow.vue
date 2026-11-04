<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import AppMark from '@/components/product/AppMark.vue'
import Tag from '@/components/ui/Tag.vue'

// A source that writes into a namespace, as getting started lists it (the console's Source.vue): its app's mark and
// its name, linking to the source, then its sync's state as a tag: how often it syncs when ready (with the turn
// arrows), black with a 4px square while it syncs or connects, the red wash when it needs attention, "via API" for a
// source pushed through the API. `detail` adds the last and next sync. The tag's title says what the state means.
// `as` renders a router link component for the name (it gets `href` and `to`).
export type SourceStatus = 'ready' | 'syncing' | 'connecting' | 'error' | 'pushed'
const props = withDefaults(defineProps<{
  name: string
  app: string
  logo?: string | null
  status: SourceStatus
  /** How often it syncs when ready ("every 6 hours"). */
  every?: string
  /** When it last synced and will next, already worded ("2 hours ago", "in 4 hours"). */
  synced?: string
  next?: string
  detail?: boolean
  href?: string
  as?: string | Component
}>(), { as: 'a' })
defineEmits<{ open: [event: MouseEvent] }>()

const STATES: Record<SourceStatus, { label: string, tone: 'default' | 'working' | 'failed' | 'quiet', note: string }> = {
  ready: { label: 'auto-sync', tone: 'quiet', note: 'Syncs automatically on a schedule.' },
  syncing: { label: 'syncing', tone: 'working', note: 'A sync is running. It syncs automatically on a schedule.' },
  connecting: { label: 'connecting', tone: 'working', note: 'Waiting for the app account to be connected. Then it syncs automatically.' },
  error: { label: 'needs attention', tone: 'failed', note: 'The last sync failed. Open the source to see why.' },
  pushed: { label: 'via API', tone: 'quiet', note: 'Its documents are pushed through the API.' },
}
const state = computed(() => {
  const s = STATES[props.status]
  return props.status === 'ready' && props.every ? { ...s, label: `syncs ${props.every}` } : s
})
const title = computed(() => [state.value.note, props.synced ? `Last sync ${props.synced}.` : '', props.next && props.status === 'ready' ? `Next sync ${props.next}.` : ''].filter(Boolean).join(' '))
</script>

<template>
  <span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-ui">
    <component :is="as" :href="href ?? '#'" :to="href" class="ds-source-name" :title="app === name ? undefined : app" @click="$emit('open', $event)">
      <AppMark :name="app" :logo="logo" />
      <span>{{ name }}</span>
    </component>
    <Tag :tone="state.tone" :title="title">
      <template v-if="status === 'ready'" #mark><RefreshCw :size="10" :stroke-width="2" class="mt-0.5" aria-hidden="true" /></template>
      <template v-else-if="state.tone === 'working'" #mark><span class="mt-0.5 size-1 shrink-0 animate-pulse bg-surface motion-reduce:animate-none" aria-hidden="true" /></template>
      {{ state.label }}
    </Tag>
    <span v-if="detail && synced" class="type-meta whitespace-nowrap text-fg-muted">synced {{ synced }}</span>
    <span v-if="detail && next && status === 'ready'" class="type-meta whitespace-nowrap text-fg-muted">next {{ next }}</span>
  </span>
</template>

<style>
.ds-source-name { display: inline-flex; align-items: center; gap: var(--ds-space-sm); white-space: nowrap; color: var(--ds-color-fg); }
.ds-source-name:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
</style>
