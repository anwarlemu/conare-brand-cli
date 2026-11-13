import { PixelButton } from '@/react/components/ui/PixelButton'
import { WorkPanel } from '@/react/components/product/WorkPanel'
import { StepViz } from '@/react/components/visuals/StepViz'
// A card with its one action, and the dark panel with a window beside it: How it works' search step (step-viz), which
// plays once as it renders.
const RUNS = [0, 0, 0, 0]

export default function Product() {
  return (
    <WorkPanel title="Run a search" line="Ask your data a question. Conare finds the passages that answer it." label="an example" tall window={<StepViz step={2} runs={RUNS} active />}>
      <PixelButton large>Run a search</PixelButton>
    </WorkPanel>
  )
}
