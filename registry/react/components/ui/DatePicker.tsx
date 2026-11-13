'use client'
import { useId, type KeyboardEvent, type MouseEvent } from 'react'
import { CalendarDays } from 'lucide-react'
import { Calendar } from '@/react/components/ui/Calendar'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { cn } from '@/react/lib/cn'
import { useControllable } from '@/react/hooks/useControllable'
import { usePopover } from '@/react/hooks/usePopover'

// A date in a field: a button drawn as the 32px text field (a #C3C1BF hairline that turns ink while it is open or
// focused, 13px, the placeholder muted) that opens a Calendar in Menu's square panel under it. Opening puts focus on
// the picked day (or today); picking a day closes it and returns focus to the field; Escape closes it unchanged.
// Wire it into Field like Input: <Field label="Expires">{({ id }) => <DatePicker id={id} />}</Field>. Vue's v-model is
// `value` with `onValueChange` (or `defaultValue` alone).
export interface DatePickerProps {
  id?: string
  placeholder?: string
  min?: Date
  max?: Date
  disabled?: (day: Date) => boolean
  invalid?: boolean
  locale?: string
  format?: Intl.DateTimeFormatOptions
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (day: Date | null) => void
  className?: string
  'aria-describedby'?: string
}

const FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }

export function DatePicker({ id, placeholder = 'Pick a date', min, max, disabled, invalid, locale = 'en-US', format = FORMAT, value, defaultValue = null, onValueChange, className, 'aria-describedby': describedBy }: DatePickerProps) {
  const [model, setModel] = useControllable<Date | null>(value, defaultValue, onValueChange)
  const pop = usePopover({ side: 'bottom', align: 'start', gap: 4 })
  const panelId = `date-${useId()}`
  const text = model?.toLocaleDateString(locale, format)

  async function onClick(event: MouseEvent | { detail: number }) {
    if (pop.open) return pop.hide(event.detail === 0, event.detail === 0)
    await pop.show({ keyboard: event.detail === 0 })
    pop.panel.current?.querySelector<HTMLElement>('.ds-day[tabindex="0"]')?.focus({ preventScroll: true })
  }
  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' && !pop.open) {
      event.preventDefault()
      void onClick({ detail: 0 })
    }
  }
  function picked() {
    pop.hide(true)
  }

  return (
    <>
      <button
        data-ds="date-picker"
        id={id}
        ref={(el) => { pop.anchor.current = el }}
        type="button"
        className={cn('flex h-control-md w-full cursor-pointer items-center gap-2 border border-edge-strong bg-surface px-2.5 text-left text-ui text-fg outline-none transition-[border-color] duration-120 ease-standard focus-visible:border-edge-focus aria-expanded:border-edge-focus aria-invalid:border-action-danger max-md:h-control-touch max-md:text-input', className)}
        aria-haspopup="dialog"
        aria-expanded={pop.open}
        aria-controls={pop.open ? panelId : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={onClick}
        onKeyDown={onKey}
      >
        <CalendarDays size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />
        <span className={cn('min-w-0 flex-1 truncate', !text && 'text-fg-muted')}>{text ?? placeholder}</span>
      </button>
      <PopoverPanel data-ds="date-picker" id={panelId} pop={pop} role="dialog" aria-label="choose a date" tabIndex={-1} className="p-3">
        <Calendar value={model} onValueChange={setModel} min={min} max={max} disabled={disabled} locale={locale} onSelect={picked} />
      </PopoverPanel>
    </>
  )
}

export default DatePicker
