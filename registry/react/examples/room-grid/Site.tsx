import { Grain } from '@/react/components/visuals/Grain'
import { RoomGrid } from '@/react/components/visuals/RoomGrid'
// The hero's red frame as a room: point at a tile and it lights.

export default function Site() {
  return (
    <div className="relative flex aspect-[2/1] w-full justify-center overflow-hidden bg-home-red px-4 py-10 text-ds-neutral-300">
      <Grain />
      <RoomGrid />
    </div>
  )
}
