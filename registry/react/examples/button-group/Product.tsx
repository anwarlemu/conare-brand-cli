'use client'
import { useState } from 'react'
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { ButtonGroup } from '@/react/components/ui/ButtonGroup'
import { Menu } from '@/react/components/ui/Menu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { TextSwap } from '@/react/components/visuals/TextSwap'
import { useCopy } from '@/react/hooks/useCopy'
import { cn } from '@/react/lib/cn'
// The agent prompt's split button: Copy prompt, and an arrow with the one-click installs. Then secondary buttons that
// share a hairline, as a pager does.

export default function Product() {
  const { copied, copy } = useCopy()
  const [page, setPage] = useState(2)
  return (
    <div className="grid items-center gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">Split</p>
      <div className="h-28">
        <ButtonGroup label="connect your agent">
          <PixelButton done={copied} onClick={() => void copy('Connect to Acme over MCP.')}>
            <TextSwap
              on={copied}
              a={<><Copy size={12} strokeWidth={1.5} aria-hidden="true" />Copy prompt</>}
              b={<><Check size={12} strokeWidth={2} aria-hidden="true" />Copied</>}
            />
          </PixelButton>
          <Menu label="other ways to connect" triggerLabel="other ways to connect" align="end" width="200px" triggerClass="relative inline-flex h-control-sm w-control-sm cursor-pointer items-center justify-center bg-action-primary text-action-primary-fg transition-[background-color] duration-120 ease-standard hover:bg-edge-accent focus-visible:outline-edge-accent max-md:h-control-touch max-md:w-control-touch" trigger={open => <ChevronDown size={12} strokeWidth={1.5} className={cn('transition-[rotate] duration-120 ease-out motion-reduce:transition-none', open && 'rotate-180')} aria-hidden="true" />}>
            <MenuItem href="#cursor"><span className="flex-1">Add to Cursor</span><ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" /></MenuItem>
            <MenuItem href="#vscode"><span className="flex-1">Add to VS Code</span><ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" /></MenuItem>
          </Menu>
        </ButtonGroup>
      </div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Secondary</p>
      <div>
        <ButtonGroup label="pages">
          <Button icon aria-label="previous page" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} strokeWidth={1.5} /></Button>
          <Button className="tabular-nums" aria-live="polite">{`Page ${page} of 4`}</Button>
          <Button icon aria-label="next page" disabled={page === 4} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} strokeWidth={1.5} /></Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
