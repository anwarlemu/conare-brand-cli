import { HoldButton } from '@/react/components/ui/HoldButton'
// What removes something, as a key's Revoke: hold it and the red squares fill across, then the check draws; let go
// early and it rewinds.

export default function Danger() {
  return <HoldButton label="Revoke" />
}
