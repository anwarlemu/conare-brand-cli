import { Button } from '@/react/components/ui/Button'
import { EmptyState } from '@/react/components/ui/EmptyState'
// Nothing to search yet, with the two ways to fix it.

export default function Product() {
  return (
    <EmptyState title="Nothing to search yet.">
      <Button>Connect an app</Button>
      <Button variant="dark">Add a sample</Button>
    </EmptyState>
  )
}
