'use client'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'
import { useControllable } from '@/react/hooks/useControllable'

// A month to pick a day from, in the console's grammar: square 32px day cells (40px on phones) in a hairline-free
// grid, weekday heads in 12px muted, the month in 13px medium between two ghost arrow buttons. The picked day is ink
// on off-white; today carries Menu's 4px red square in its corner; days that can't be picked are muted. Arrows move a
// day or a week, Home and End to the week's ends, Page Up and Page Down a month (with Shift a year), Enter or Space
// picks. Changing month doesn't animate: it is pressed many times in a row. Vue's v-model is `value` with
// `onValueChange` (or `defaultValue` alone); `onSelect` fires on every pick.
export interface CalendarProps {
  label?: string
  min?: Date
  max?: Date
  disabled?: (day: Date) => boolean
  weekStartsOn?: 0 | 1
  locale?: string
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (day: Date | null) => void
  onSelect?: (day: Date) => void
  className?: string
}

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const same = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
function addMonths(d: Date, n: number) {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last))
}

export function Calendar({ label = 'calendar', min, max, disabled, weekStartsOn = 0, locale = 'en-US', value, defaultValue = null, onValueChange, onSelect, className }: CalendarProps) {
  const [model, setModel] = useControllable<Date | null>(value, defaultValue, onValueChange)
  const today = day0(new Date())
  const [focused, setFocused] = useState(() => day0(model ?? today))
  const month = new Date(focused.getFullYear(), focused.getMonth(), 1)
  useEffect(() => {
    if (model && !same(model, focused)) setFocused(day0(model))
  }, [model]) // eslint-disable-line react-hooks/exhaustive-deps

  const caption = month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 1, 1 + ((i + weekStartsOn) % 7)) // 1 February 2026 is a Sunday.
    return { short: d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2), long: d.toLocaleDateString(locale, { weekday: 'long' }) }
  })
  const lead = (month.getDay() - weekStartsOn + 7) % 7
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = [...Array.from({ length: lead }, () => null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))]
  while (cells.length % 7) cells.push(null)
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
  const blocked = (d: Date) => (!!min && d < day0(min)) || (!!max && d > day0(max)) || !!disabled?.(d)
  const dayLabel = (d: Date) => d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const grid = useRef<HTMLTableElement | null>(null)
  // Vue focuses the roving day after the next render (nextTick); here an effect runs once the move has rendered.
  const [pendingFocus, setPendingFocus] = useState(0)
  useEffect(() => {
    if (pendingFocus) grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
  }, [pendingFocus])
  function moveTo(d: Date) {
    setFocused(d)
    setPendingFocus(n => n + 1)
  }
  function pick(d: Date) {
    if (blocked(d)) return
    setFocused(d)
    setModel(d)
    onSelect?.(d)
  }
  function onKey(event: KeyboardEvent<HTMLTableElement>) {
    const d = focused
    const start = addDays(d, -((d.getDay() - weekStartsOn + 7) % 7))
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(d, -1),
      ArrowRight: () => addDays(d, 1),
      ArrowUp: () => addDays(d, -7),
      ArrowDown: () => addDays(d, 7),
      Home: () => start,
      End: () => addDays(start, 6),
      PageUp: () => addMonths(d, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(d, event.shiftKey ? 12 : 1),
    }
    const move = moves[event.key]
    if (move) {
      event.preventDefault()
      moveTo(move())
    }
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pick(d)
    }
  }

  return (
    <>
      <style href="ds-calendar" precedence="ds">{css}</style>
      <div data-ds="calendar" className={cn('inline-flex flex-col gap-2 text-ui', className)} role="group" aria-label={label}>
        <div className="flex items-center gap-1">
          <Button variant="ghost" icon aria-label="previous month" onClick={() => setFocused(addMonths(focused, -1))}><ChevronLeft size={14} strokeWidth={1.5} /></Button>
          <p className="min-w-0 flex-1 text-center type-ui-strong" aria-live="polite">{caption}</p>
          <Button variant="ghost" icon aria-label="next month" onClick={() => setFocused(addMonths(focused, 1))}><ChevronRight size={14} strokeWidth={1.5} /></Button>
        </div>
        <table ref={grid} role="grid" aria-label={caption} className="border-collapse" onKeyDown={onKey}>
          <thead>
            <tr>
              {weekdays.map(w => (
                <th key={w.long} scope="col" abbr={w.long} className="h-7 w-control-md p-0 text-center type-meta font-normal text-fg-muted max-md:w-control-touch">{w.short}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((d, j) => (
                  <td key={j} className="p-0" role={d ? 'gridcell' : undefined} aria-selected={d ? same(d, model) : undefined}>
                    {d && (
                      <button
                        type="button"
                        className="ds-day"
                        tabIndex={same(d, focused) ? 0 : -1}
                        aria-label={dayLabel(d)}
                        aria-current={same(d, today) ? 'date' : undefined}
                        aria-disabled={blocked(d) || undefined}
                        data-picked={same(d, model) || undefined}
                        onClick={() => pick(d)}
                        onFocus={() => setFocused(d)}
                      >
                        {d.getDate()}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Calendar

const css = `
.ds-day { position: relative; display: inline-flex; width: var(--ds-size-control-md); height: var(--ds-size-control-md); align-items: center; justify-content: center; color: var(--ds-color-fg); font-size: var(--ds-text-ui); font-variant-numeric: tabular-nums; cursor: pointer; outline: none; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-day[aria-current="date"]::after { position: absolute; top: 4px; right: 4px; width: 4px; height: 4px; background: var(--ds-color-edge-accent); content: ""; }
@media (hover: hover) and (pointer: fine) { .ds-day:hover:not([data-picked], [aria-disabled]) { background: var(--ds-color-surface-subtle); } }
.ds-day:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
.ds-day[data-picked] { background: var(--ds-color-surface-inverse); color: var(--ds-color-fg-inverse); font-weight: var(--ds-font-weight-medium); }
.ds-day[data-picked]:focus-visible { outline-color: var(--ds-color-edge-accent); }
.ds-day[aria-disabled] { color: var(--ds-color-fg-muted); text-decoration: line-through; cursor: not-allowed; }
@media (pointer: coarse), (max-width: 767px) { .ds-day { width: var(--ds-size-control-touch); height: var(--ds-size-control-touch); } }
`
