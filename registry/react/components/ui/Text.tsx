import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The console's type as one part (main.css @theme, console2.css .v2-title, .v2-meta, .v2-mono, .v2-link, Marked.vue).
// title: 20px Faculty Glyphic, a page's title (h1). ui: 13px Geist, the default. strong: 13px medium. meta: 12px muted,
// captions under a field, timestamps. caption: 11px muted, the smallest. code: 13px Geist Mono; code-sm: 12px mono, for
// IDs, keys and namespace names. link: ink text with a quiet underline 4px under it that turns ink on hover. mark: a
// query's word in a passage, medium weight in ink, never a fill. `as` overrides the tag.
export type TextVariant = 'title' | 'ui' | 'strong' | 'meta' | 'caption' | 'code' | 'code-sm' | 'link' | 'mark'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  /** The tag, in place of the variant's own. */
  as?: string
  href?: string
  children?: ReactNode
}

const TAGS: Record<TextVariant, string> = { 'title': 'h1', 'ui': 'p', 'strong': 'p', 'meta': 'p', 'caption': 'p', 'code': 'code', 'code-sm': 'code', 'link': 'a', 'mark': 'strong' }
const CLASSES: Record<TextVariant, string> = {
  'title': 'type-heading-3 text-fg',
  'ui': 'type-ui text-fg',
  'strong': 'type-ui-strong text-fg',
  'meta': 'type-meta text-fg-muted',
  'caption': 'type-caption text-fg-muted',
  'code': 'type-code text-fg',
  'code-sm': 'type-code-sm text-fg',
  'link': 'ds-text-link text-fg',
  'mark': 'font-medium text-fg',
}

export function Text({ variant = 'ui', as, href, className, children, ...rest }: TextProps) {
  const tag = as ?? (variant === 'link' && !href ? 'button' : TAGS[variant])
  const Tag = tag as ElementType
  return (
    <>
      <style href="ds-text" precedence="ds">{css}</style>
      <Tag data-ds="text" href={href} type={tag === 'button' ? 'button' : undefined} className={cn(CLASSES[variant], className)} {...rest}>{children}</Tag>
    </>
  )
}

export default Text

const css = `
.ds-text-link { cursor: pointer; text-decoration: underline; text-decoration-color: var(--ds-color-edge-strong); text-underline-offset: 4px; transition: text-decoration-color var(--ds-duration-enter) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-text-link:hover { text-decoration-color: var(--ds-color-fg); } }
`
