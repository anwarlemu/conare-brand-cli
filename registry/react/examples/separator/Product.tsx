import { Separator } from '@/react/components/ui/Separator'
// The hairline across a card between two parts, down a row of links, and inset in a menu's panel.

export default function Product() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="border border-edge bg-surface p-4">
        <p className="type-ui-strong">Namespace</p>
        <p className="type-meta text-fg-muted">contracts, 412,830 documents</p>
        <Separator className="my-3" />
        <p className="type-meta text-fg-muted">Synced 2 min ago</p>
      </div>
      <div className="flex h-7 items-center gap-3 self-start type-ui">
        <a href="#" className="hover:text-fg-soft">Billing</a><Separator orientation="vertical" /><a href="#" className="hover:text-fg-soft">Docs</a><Separator orientation="vertical" /><a href="#" className="hover:text-fg-soft">Status</a>
      </div>
      <div className="w-52 self-start border border-edge bg-surface p-1 type-ui">
        <p className="flex h-8 items-center px-2">Settings</p>
        <p className="flex h-8 items-center px-2">Members</p>
        <Separator inset />
        <p className="flex h-8 items-center px-2 text-fg-danger">Sign out</p>
      </div>
    </div>
  )
}
