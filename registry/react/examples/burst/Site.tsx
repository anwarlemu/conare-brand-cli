import { Burst } from '@/react/components/visuals/Burst'
import { Grain } from '@/react/components/visuals/Grain'
import { RoomGrid } from '@/react/components/visuals/RoomGrid'
// The hero's red frame, with what sits in it.

export default function Site() {
  return (
    <div className="relative flex aspect-[2/1] w-full justify-center overflow-hidden bg-home-red px-4 py-10 text-ds-neutral-300">
      <Grain />
      <RoomGrid />
      <Burst inner={0.01} corners />
    </div>
  )
}
