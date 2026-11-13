'use client'
import { useState, type HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// Who or what something belongs to, always square (never round). `tile` (console2.css .v2-tile, the workspace
// switcher's organization): a 20px hairline box with the name's initial, 11px medium. `solid` (AccountMenu.vue): the
// black square that stands in for a profile picture; with `initial` it carries the letter in off-white. A `src` shows a
// picture cropped square, falling back to the initial if it fails. Sizes follow the controls: 20 (in a row), 28, 32.
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name?: string
  src?: string
  variant?: 'tile' | 'solid'
  size?: 20 | 28 | 32
  initial?: boolean
}

const SIZES = { 20: 'size-5 text-caption', 28: 'size-7 text-meta', 32: 'size-8 text-ui' }

export function Avatar({ name, src, variant = 'tile', size = 20, initial, className, ...rest }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const letter = (name?.trim()[0] ?? '').toUpperCase()
  const showLetter = variant === 'tile' || initial
  return (
    <span
      data-ds="avatar"
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden leading-none font-medium select-none', SIZES[size], variant === 'tile' ? 'border border-edge bg-surface text-fg' : 'bg-off-black text-off-white', className)}
      role={name ? 'img' : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : 'true'}
      {...rest}
    >
      {src && !failed ? <img src={src} alt="" className="size-full object-cover" onError={() => setFailed(true)} /> : showLetter ? letter : null}
    </span>
  )
}

export default Avatar
