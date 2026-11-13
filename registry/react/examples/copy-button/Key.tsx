import { CopyButton } from '@/react/components/ui/CopyButton'
// Beside a new key, which shows once.

export default function Key() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <code className="bg-surface-subtle px-3 py-1 type-code-sm">sk_live_4f9a2b7d0c21e8b1</code>
      <CopyButton text="sk_live_4f9a2b7d0c21e8b1" />
    </div>
  )
}
