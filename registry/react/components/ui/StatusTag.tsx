import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { Tag } from '@/react/components/ui/Tag'

// A source's state as a tag (the console's Status.vue): ready in a hairline, syncing and connecting in black with the
// dot matrix at work, error in the red wash with its square. Red marks only a failure.
export interface StatusTagProps {
  status: 'ready' | 'syncing' | 'connecting' | 'error' | (string & {})
  className?: string
}

export function StatusTag({ status, className }: StatusTagProps) {
  const working = status === 'syncing' || status === 'connecting'
  const tone = status === 'error' ? 'failed' : working ? 'working' : 'default'
  return (
    <Tag data-ds="status-tag" tone={tone} className={className} mark={working ? <DotMatrix tone="inverse" className="mt-0.5 mr-0.5" /> : undefined}>
      {status}
    </Tag>
  )
}

export default StatusTag
