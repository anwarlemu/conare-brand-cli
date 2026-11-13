import { cn } from '@/react/lib/cn'

// The hairline (console2.css .v2-menu-sep, .v2-rows) as its own part: 1px in the edge colour, across or down.
// `inset` is the menu's: 4px of air above and below, running out to the panel's edges through its 4px padding.
// Decorative by default; pass `semantic` when it separates content a screen reader should hear as split.
export interface SeparatorProps { orientation?: 'horizontal' | 'vertical', inset?: boolean, semantic?: boolean, className?: string }

export function Separator({ orientation = 'horizontal', inset, semantic, className }: SeparatorProps) {
  return (
    <div
      data-ds="separator"
      role={semantic ? 'separator' : 'none'}
      aria-orientation={semantic ? orientation : undefined}
      className={cn('shrink-0 bg-edge', [orientation === 'vertical' ? 'w-px self-stretch' : 'h-px w-full', inset && (orientation === 'vertical' ? '-my-1 mx-1' : '-mx-1 my-1 w-auto')], className)}
    />
  )
}

export default Separator
