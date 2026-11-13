'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// Pages of a long list, when its order means a place to come back to (an audit log): two secondary icon buttons
// around the page count in tabular figures, 12px muted. The buttons go grey at either end. Prefer ShowMore for a
// list read from the top (credits added, matches): it keeps what was read on screen. The page is `page` /
// `defaultPage` / `onPageChange` (Vue's v-model:page).
export interface PaginationProps {
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  pages: number
  label?: string
  className?: string
}

export function Pagination({ page: given, defaultPage = 1, onPageChange, pages, label = 'pages', className }: PaginationProps) {
  const [page, setPage] = useControllable(given, defaultPage, onPageChange)
  return (
    <nav data-ds="pagination" className={cn('flex items-center gap-3', className)} aria-label={label}>
      <Button icon aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft size={14} strokeWidth={1.5} aria-hidden="true" /></Button>
      <span className="type-meta text-fg-muted tabular-nums" aria-live="polite">Page <span className="text-fg">{page}</span>{` of ${pages}`}</span>
      <Button icon aria-label="Next page" disabled={page >= pages} onClick={() => setPage(Math.min(pages, page + 1))}><ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" /></Button>
    </nav>
  )
}

export default Pagination
