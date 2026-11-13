import { cn } from '@/react/lib/cn'

// The way a number moved, in the website button's pixel arrow (usage/TrendArrow.vue): lit squares on a grid of dim
// ones, red going up, ink going down (turned over). `bare` is a solid pixel triangle with no grid, for beside a stat.
// It holds still: the branch's step on card hover is left out, since icons never move on hover.
export interface TrendArrowProps { down?: boolean, bare?: boolean }

const CELL = 3
const SIZE = 5
const GRID = Array.from({ length: SIZE * SIZE }, (_, k) => [k % SIZE, Math.floor(k / SIZE)] as const)
// [column, row] of the lit squares, pointing up.
const ARROW: Array<[number, number]> = [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [2, 2], [4, 2], [2, 3], [2, 4]]
const TRIANGLE: Array<[number, number]> = [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2]]

export function TrendArrow({ down, bare }: TrendArrowProps) {
  const rows = bare ? 3 : SIZE
  const ink = bare ? CELL : 2
  const wide = SIZE * CELL - (bare ? 0 : 1)
  const tall = rows * CELL - (bare ? 0 : 1)
  const lit = bare ? TRIANGLE : ARROW
  return (
    <svg data-ds="trend-arrow" className={cn('shrink-0 overflow-hidden', down && 'rotate-180')} width={wide} height={tall} viewBox={`0 0 ${wide} ${tall}`} aria-hidden="true">
      {!bare && <g className="fill-ds-neutral-700">{GRID.map(([x, y]) => <rect key={`${x}-${y}`} x={x * CELL} y={y * CELL} width="2" height="2" />)}</g>}
      <g className={down ? 'fill-fg' : 'fill-edge-accent'}>{lit.map(([x, y]) => <rect key={`${x}-${y}`} x={x * CELL} y={y * CELL} width={ink} height={ink} />)}</g>
    </svg>
  )
}

export default TrendArrow
