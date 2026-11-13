import { SourceRow, type SourceStatus } from '@/react/components/product/SourceRow'
// A sample team's sources as getting started lists them: an app on its schedule, one syncing, one that failed, and one
// pushed through the API.
const sources: { name: string, app: string, status: SourceStatus, every?: string, synced?: string, next?: string }[] = [
  { name: 'Acme drive', app: 'Google Drive', status: 'ready', every: 'every 6 hours', synced: '2 hours ago', next: 'in 4 hours' },
  { name: 'Acme Slack', app: 'Slack', status: 'syncing', synced: '6 hours ago' },
  { name: 'Wiki', app: 'Notion', status: 'error', synced: 'yesterday' },
  { name: 'Support inbox', app: 'Gmail', status: 'pushed', synced: '12 minutes ago' },
]

export default function Product() {
  return (
    <ul className="flex max-w-140 flex-col gap-3">
      {sources.map(s => <li key={s.name}><SourceRow {...s} detail onOpen={e => e.preventDefault()} /></li>)}
    </ul>
  )
}
