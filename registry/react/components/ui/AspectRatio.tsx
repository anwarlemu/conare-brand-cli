import type { HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// A box that keeps its shape as it grows (CSS aspect-ratio), for a picture or a window that must not reflow: the blog
// card's 5:4 picture, the hero's 2:1 frame. `ratio` is width over height; the content fills it.
export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width over height. */
  ratio?: number
}

export function AspectRatio({ ratio = 1, className, style, children, ...rest }: AspectRatioProps) {
  return (
    <div data-ds="aspect-ratio" className={cn('relative w-full overflow-hidden', className)} style={{ ...style, aspectRatio: String(ratio) }} {...rest}>
      {children}
    </div>
  )
}

export default AspectRatio
