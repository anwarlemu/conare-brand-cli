'use client'
import { ChevronDown } from 'lucide-react'
import { Combobox, type ComboOption } from '@/react/components/ui/Combobox'

// Pick one of a few options in a form: the 32px field (a #C3C1BF hairline that turns ink on focus and while open)
// with a 12px chevron that turns over as it opens, and a listbox on Menu's square panel at least as wide as the field,
// the pick checked. No filter: typing jumps to the option it starts. Arrows, Home, End, Enter, Escape (Combobox).
// Wire `id` and `aria-describedby` from Field's render function; they land on the button. v-model is `value` with
// `onValueChange` (or `defaultValue`).
export interface SelectProps {
  options: ComboOption[]
  label: string
  placeholder?: string
  disabled?: boolean
  value?: string | number
  defaultValue?: string | number
  onValueChange?: (value: string | number) => void
  id?: string
  'aria-describedby'?: string
}

export function Select({ options, label, placeholder = 'Choose', disabled, value, defaultValue = '', onValueChange, ...attrs }: SelectProps) {
  return (
    <Combobox
      data-ds="select"
      {...attrs}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      options={options}
      label={label}
      placeholder={placeholder}
      filter={false}
      matchWidth
      disabled={disabled}
      trigger={({ selected }) => (
        <>
          <span className={selected ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1 truncate text-fg-muted'}>{selected?.label ?? placeholder}</span>
          <ChevronDown size={12} strokeWidth={1.5} className="shrink-0 text-fg-muted transition-[rotate] duration-120 ease-out group-aria-expanded:rotate-180 group-aria-expanded:duration-180 motion-reduce:transition-none" aria-hidden="true" />
        </>
      )}
    />
  )
}

export default Select
