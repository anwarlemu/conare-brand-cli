import { Search } from 'lucide-react'
import { Kbd } from '@/react/components/ui/Kbd'
// The sidebar's search with its shortcut at the end, and a boxed key in a line of help. Touch screens hide them.

export default function Product() {
  return (
    <div className="flex w-58 flex-col gap-4">
      <button type="button" className="flex h-control-sm cursor-pointer items-center gap-2 border border-edge bg-surface px-2 text-meta text-fg-muted transition-[border-color] duration-120 ease-standard hover:border-edge-strong">
        <Search size={12} strokeWidth={1.5} aria-hidden="true" />Search<Kbd className="ml-auto">⌘K</Kbd>
      </button>
      <p className="type-meta text-fg-muted">Press <Kbd boxed>Enter</Kbd> to search, <Kbd boxed>Shift</Kbd> <Kbd boxed>Enter</Kbd> for a new line.</p>
    </div>
  )
}
