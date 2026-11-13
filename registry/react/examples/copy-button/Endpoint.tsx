import { CopyButton } from '@/react/components/ui/CopyButton'
// Beside an endpoint.

export default function Endpoint() {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="truncate type-code-sm">https://api.conare.ai/mcp</span>
      <CopyButton text="https://api.conare.ai/mcp" className="shrink-0" />
    </div>
  )
}
