'use client'
import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { Step } from '@/react/components/ui/Step'
import { Steps } from '@/react/components/ui/Steps'
import { useSteps } from '@/react/hooks/useSteps'
// Steps that open one at a time: the one to do is the only open thing, a finished step folds to a line that says what
// came of it, and a step not reached is dimmed and locked.
const said = ['Key created', 'Prompt copied']

export default function Product() {
  const { state, reach, toggle } = useSteps()
  return (
    <Steps className="max-w-140">
      <Step n={1} title="Create a key" state={state(1)} says={said[0]} onOpen={() => toggle(1)}>
        <p className="type-meta text-fg-muted">Your agent uses it to read what you connect.</p>
        <PixelButton onClick={() => reach(2)}>Create key</PixelButton>
      </Step>
      <Step n={2} title="Give the prompt to your agent" state={state(2)} says={said[1]} onOpen={() => toggle(2)}>
        <p className="type-meta text-fg-muted">It connects Acme's documents and runs a first search.</p>
        <PixelButton onClick={() => reach(3)}>Copy prompt</PixelButton>
      </Step>
      <Step n={3} title="Watch the first write" state={state(3)} onOpen={() => toggle(3)}>
        <p className="type-meta text-fg-muted">Documents show here as they land.</p>
        <Button onClick={() => reach(1)}>Start again</Button>
      </Step>
    </Steps>
  )
}
