'use client'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Drawer } from '@/react/components/ui/Drawer'
// A choice on a phone, from the bottom edge: which searches to show. The rows are 44px to land a thumb on.

const shows = ['All searches', 'Weak match', 'Nothing found', 'Failed']

export default function Bottom() {
  const [open, setOpen] = useState(false)
  const [show, setShow] = useState('All searches')
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Button onClick={() => setOpen(true)}>{show}</Button>
      <Drawer open={open} onOpenChange={setOpen} title="Show" side="bottom" bar>
        {close => (
          <ul className="flex flex-col p-2">
            {shows.map(s => (
              <li key={s}>
                <button type="button" aria-pressed={show === s} className="flex h-11 w-full cursor-pointer items-center gap-2 px-3 text-left type-body transition-colors duration-120 ease-standard hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus" onClick={() => { setShow(s); close() }}>
                  <span className="min-w-0 flex-1">{s}</span>
                  {show === s && <Check size={14} strokeWidth={1.5} aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </div>
  )
}
