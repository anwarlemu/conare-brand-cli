import { RefreshCw } from 'lucide-react'
import type { ElementType, MouseEvent } from 'react'
import { AppMark } from '@/react/components/product/AppMark'
import { Tag } from '@/react/components/ui/Tag'

// A source that writes into a namespace, as getting started lists it (the console's Source.vue): its app's mark and
// its name, linking to the source, then its sync's state as a tag: how often it syncs when ready (with the turn
// arrows), black with a 4px square while it syncs or connects, the red wash when it needs attention, "via API" for a
// source pushed through the API. `detail` adds the last and next sync. The tag's title says what the state means.
// `as` renders a router link component for the name (it gets `href` and `to`).
export type SourceStatus = 'ready' | 'syncing' | 'connecting' | 'error' | 'pushed'

export interface SourceRowProps {
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
  as?: ElementType
  onOpen?: (event: MouseEvent<HTMLElement>) => void
}

const STATES: Record<SourceStatus, { label: string, tone: 'default' | 'working' | 'failed' | 'quiet', note: string }> = {
  ready: { label: 'auto-sync', tone: 'quiet', note: 'Syncs automatically on a schedule.' },
  syncing: { label: 'syncing', tone: 'working', note: 'A sync is running. It syncs automatically on a schedule.' },
  connecting: { label: 'connecting', tone: 'working', note: 'Waiting for the app account to be connected. Then it syncs automatically.' },
  error: { label: 'needs attention', tone: 'failed', note: 'The last sync failed. Open the source to see why.' },
  pushed: { label: 'via API', tone: 'quiet', note: 'Its documents are pushed through the API.' },
}

export function SourceRow({ name, app, logo, status, every, synced, next, detail, href, as: Link = 'a', onOpen }: SourceRowProps) {
  const base = STATES[status]
  const state = status === 'ready' && every ? { ...base, label: `syncs ${every}` } : base
  const title = [state.note, synced ? `Last sync ${synced}.` : '', next && status === 'ready' ? `Next sync ${next}.` : ''].filter(Boolean).join(' ')
  const mark = status === 'ready'
    ? <RefreshCw size={10} strokeWidth={2} className="mt-0.5" aria-hidden="true" />
    : state.tone === 'working' ? <span className="mt-0.5 size-1 shrink-0 animate-pulse bg-surface motion-reduce:animate-none" aria-hidden="true" /> : undefined
  return (
    <span data-ds="source-row" className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-ui">
      <style href="ds-source-row" precedence="ds">{css}</style>
      <Link href={href ?? '#'} {...(Link === 'a' ? {} : { to: href })} className="ds-source-name" title={app === name ? undefined : app} onClick={onOpen}>
        <AppMark name={app} logo={logo} />
        <span>{name}</span>
      </Link>
      <Tag tone={state.tone} title={title} mark={mark}>{state.label}</Tag>
      {detail && synced && <span className="type-meta whitespace-nowrap text-fg-muted">{`synced ${synced}`}</span>}
      {detail && next && status === 'ready' && <span className="type-meta whitespace-nowrap text-fg-muted">{`next ${next}`}</span>}
    </span>
  )
}

export default SourceRow

const css = `
.ds-source-name { display: inline-flex; align-items: center; gap: var(--ds-space-sm); white-space: nowrap; color: var(--ds-color-fg); }
.ds-source-name:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
`
