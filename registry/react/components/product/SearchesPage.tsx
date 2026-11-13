'use client'
import { useMemo } from 'react'
import { ConsolePage } from '@/react/components/product/ConsolePage'
import { EmptyState } from '@/react/components/ui/EmptyState'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { Tabs } from '@/react/components/ui/Tabs'
import { SearchesLog, type SearchOutcome, type SearchPassage, type SearchRow } from '@/react/components/product/SearchesLog'
import { useControllable } from '@/react/hooks/useControllable'

// Searches as it ships (pages/dashboard/searches.vue, take 1, Log): what an agent asked and what it read. The page's
// one filter sits in its head (All, Weak match, Nothing found, Failed); the log under it, rows opening in place. With
// no searches yet, the dashed box says where they come from and Connect an agent leads there.
type Show = 'all' | Exclude<SearchOutcome, 'strong'>
export interface SearchesPageProps {
  rows: SearchRow[]
  /** The filter (Vue's v-model:show). */
  show?: Show
  defaultShow?: Show
  onShowChange?: (show: Show) => void
  onConnect?: () => void
  onDownload?: (passage: SearchPassage) => void
  onFix?: (row: SearchRow) => void
  onSearch?: (question: string) => void
}

const FILTERS: Array<{ value: Show, label: string }> = [{ value: 'all', label: 'All' }, { value: 'weak', label: 'Weak match' }, { value: 'none', label: 'Nothing found' }, { value: 'failed', label: 'Failed' }]

export function SearchesPage({ rows, show: showValue, defaultShow = 'all', onShowChange, onConnect, onDownload, onFix, onSearch }: SearchesPageProps) {
  const [show, setShow] = useControllable(showValue, defaultShow, onShowChange)
  const shown = useMemo(() => rows.filter(r => show === 'all' || r.outcome === show), [rows, show])
  return (
    <ConsolePage data-ds="searches-page" title="Searches" actions={rows.length ? <Tabs value={show} onValueChange={setShow} options={FILTERS} label="which searches" /> : undefined}>
      {!rows.length
        ? (
            <EmptyState title="No searches yet" description="Every search your agents run shows here, with what it read.">
              <PixelButton onClick={() => onConnect?.()}>Connect an agent</PixelButton>
            </EmptyState>
          )
        : !shown.length
          ? <p className="type-meta text-fg-muted">No searches like this in the last few hours.</p>
          : (
              <div className="flex flex-col gap-3">
                <SearchesLog rows={shown} onDownload={onDownload} onFix={onFix} onSearch={onSearch} />
              </div>
            )}
    </ConsolePage>
  )
}

export default SearchesPage
