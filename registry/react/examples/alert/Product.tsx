import { Alert } from '@/react/components/ui/Alert'
import { Button } from '@/react/components/ui/Button'
// Two sources that stopped syncing, each with the button that fixes it.
const failed = [
  { name: 'HubSpot', error: 'The token expired on Oct 29.' },
  { name: 'Google Drive', error: 'Conare lost access to the shared drive.' },
]

export default function Product() {
  return (
    <section className="flex flex-col gap-2" aria-label="sources that failed">
      {failed.map(s => (
        <Alert key={s.name} title={`${s.name} stopped syncing.`} action={<Button variant="brand">{`Reconnect ${s.name}`}</Button>}>
          {s.error}
        </Alert>
      ))}
    </section>
  )
}
