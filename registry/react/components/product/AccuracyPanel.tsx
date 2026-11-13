'use client'
import { useState } from 'react'
import { Check, Link2, Plus, RotateCw } from 'lucide-react'
import { AccuracyAdd } from '@/react/components/product/AccuracyAdd'
import { AccuracyAtWork } from '@/react/components/product/AccuracyAtWork'
import type { AccuracyRow, AccuracyView } from '@/react/components/product/AccuracyDetail'
import { AccuracyOpens } from '@/react/components/product/AccuracyOpens'
import { AccuracySheet } from '@/react/components/product/AccuracySheet'
import { AccuracyTwo } from '@/react/components/product/AccuracyTwo'
import { AccuracyVerdict } from '@/react/components/product/AccuracyVerdict'
import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { Tabs } from '@/react/components/ui/Tabs'
import { useCopy } from '@/react/hooks/useCopy'
import { useControllable } from '@/react/hooks/useControllable'

// Accuracy, Performance's second view (accuracy/Panel.vue): a team's own questions and whether Conare reached the
// right page. The bar holds Performance's two views and the test's actions: Add questions (opening in place; the
// question sheet takes them in its first row instead), Copy link, and Run again as the page's one dark button. Under it,
// one of the four views: 4 "Test at work" ships; 1 "Verdict first", 2 "Two searches" and 3 "Question sheet" are the
// takes beside it. The app owns the test: it answers `onRun`, `onAdd`, `onFix`, `onSearch`, `onRemove` and the tab (`tab` with
// `onTabChange`, Vue's v-model:tab).
type Tab = 'searches' | 'accuracy'
export interface AccuracyPanelProps {
  view: AccuracyView
  version?: 1 | 2 | 3 | 4
  link?: string
  asked?: string[]
  busy?: boolean
  tab?: Tab
  defaultTab?: Tab
  onTabChange?: (tab: Tab) => void
  onRun?: () => void
  onAdd?: (questions: string[]) => void
  onFix?: (row: AccuracyRow) => void
  onSearch?: (row: AccuracyRow) => void
  onRemove?: (row: AccuracyRow) => void
}

export function AccuracyPanel({ view, version = 4, link = '', asked = [], busy, tab: tabValue, defaultTab = 'accuracy', onTabChange, onRun, onAdd, onFix, onSearch, onRemove }: AccuracyPanelProps) {
  const [tab, setTab] = useControllable(tabValue, defaultTab, onTabChange)
  const [adding, setAdding] = useState(false)
  const { copied, copy } = useCopy()
  function more(questions: string[]) {
    setAdding(false)
    onAdd?.(questions)
    onRun?.()
  }
  const pass = { onFix, onSearch, onRemove }
  return (
    <>
      <div data-ds="accuracy-panel" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Tabs value={tab} onValueChange={setTab} options={[{ value: 'searches', label: 'Searches' }, { value: 'accuracy', label: 'Accuracy' }]} label="performance" />
        <div className="flex flex-wrap items-center gap-2">
          {version !== 3 && <Button press aria-expanded={adding} onClick={() => setAdding(a => !a)}><Plus size={12} strokeWidth={1.5} aria-hidden="true" />Add questions</Button>}
          <Button press onClick={() => copy(link)}>
            {copied ? <Check size={12} strokeWidth={2} aria-hidden="true" /> : <Link2 size={12} strokeWidth={1.5} aria-hidden="true" />}{copied ? 'Link copied' : 'Copy link'}
          </Button>
          <PixelButton disabled={view.state === 'running' || busy} onClick={() => onRun?.()}>
            <RotateCw size={12} strokeWidth={1.5} aria-hidden="true" />{view.state === 'running' ? 'Running' : 'Run again'}
          </PixelButton>
        </div>
      </div>
      <AccuracyOpens data-ds="accuracy-panel" open={adding && version !== 3}><AccuracyAdd asked={asked} onAdd={more} onClose={() => setAdding(false)} /></AccuracyOpens>
      {version === 1
        ? <AccuracyVerdict view={view} {...pass} />
        : version === 2
          ? <AccuracyTwo view={view} {...pass} />
          : version === 3
            ? <AccuracySheet view={view} {...pass} onAdd={q => onAdd?.(q)} />
            : <AccuracyAtWork view={view} {...pass} />}
    </>
  )
}

export default AccuracyPanel
