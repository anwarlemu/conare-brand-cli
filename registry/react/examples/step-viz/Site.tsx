import { StepViz } from '@/react/components/visuals/StepViz'
// The four steps side by side: write, sync a source, search, and an agent over MCP.
const runs = [212, 238, 251, 196]

export default function Site() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map(n => (
        <div key={n} className="relative grid min-h-80 place-items-center overflow-hidden bg-ds-neutral-200 px-4 py-8 text-ds-neutral-300">
          <StepViz step={n - 1} runs={runs} active />
        </div>
      ))}
    </div>
  )
}
