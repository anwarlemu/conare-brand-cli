import type { ComponentType, InputHTMLAttributes, Ref } from 'react'
import { cn } from '@/react/lib/cn'

// A text field (console2.css .v2-input): 32px, a #C3C1BF hairline that turns ink on focus, 13px text and a muted
// placeholder. `icon` puts a 12px Lucide glyph at the start and makes it the 28px filter size. `invalid` turns the
// border red; Field shows the message. 40px and 16px on phones, so iOS does not zoom. Every other prop lands on the
// <input> (value and onChange as React's own), as Vue's attributes do.
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ComponentType<{ size?: number, strokeWidth?: number, className?: string, 'aria-hidden'?: boolean | 'true' }>
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

export function Input({ icon: Icon, invalid, className, ...rest }: InputProps) {
  if (Icon) {
    return (
      <span data-ds="input" className="relative block w-full">
        <Icon size={12} strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
        <input
          {...rest}
          aria-invalid={invalid || undefined}
          className={cn('h-control-sm w-full border border-edge-strong bg-surface pr-2.5 pl-7 text-meta leading-5 text-fg outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-muted max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch pointer-coarse:text-input', className)}
        />
      </span>
    )
  }
  return (
    <input
      data-ds="input"
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn('h-control-md w-full border border-edge-strong bg-surface px-2.5 text-ui text-fg outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-muted max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch pointer-coarse:text-input', className)}
    />
  )
}

export default Input
