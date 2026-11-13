// One line above the website's header (AnnouncementBar.vue): the whole ribbon is the link. The red wash, the only
// ground approved under off-black text; a square black tag in the site tag's capitals that turns red as the ribbon is
// hovered; the line, and the call to action running on in the same sentence, underlined close (from sm). The ribbon
// deepens to the hover wash in 200ms. It sits at z-10 so a pinned footer never reaches over it.
import { cn } from '@/react/lib/cn'

export interface AnnouncementBarProps {
  tag: string
  text: string
  cta?: string
  href: string
  className?: string
}

export function AnnouncementBar({ tag, text, cta, href, className }: AnnouncementBarProps) {
  return (
    <a data-ds="announcement-bar" href={href} className={cn('group relative z-10 block bg-red-wash text-off-black transition-colors duration-200 ease-standard hover:bg-home-wash-hover', className)}>
      <span className="mx-auto flex h-9 max-w-[1440px] items-center justify-center gap-2 px-4 text-ui sm:px-6 lg:px-10">
        <span className="shrink-0 bg-off-black py-0.75 pr-[calc(4px-0.06em)] pl-1 type-tag text-off-white transition-colors duration-200 ease-standard [text-box:trim-both_cap_alphabetic] group-hover:bg-home-red">{tag}</span>
        <span className="truncate leading-4">
          {text}
          {cta && <>{' '}<span className="hidden underline decoration-off-black/30 underline-offset-2 transition-colors duration-200 ease-standard group-hover:decoration-off-black sm:inline">{cta}</span></>}
        </span>
      </span>
    </a>
  )
}

export default AnnouncementBar
