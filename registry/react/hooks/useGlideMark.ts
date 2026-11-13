'use client'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/**
 * One block for a whole list (useGlideMark.ts, the website's Product menu highlight): it glides on transform to the row
 * under the pointer or focus, and rests on the current row (`rest`) when the pointer leaves, or hides when there is
 * none. Rows are the list's [data-glide-row] elements, in order, each positioned relative to the list. The first
 * placement doesn't glide. Draw the block with GlideMark.
 */
export function useGlideMark(list: RefObject<HTMLElement | null>, rest: () => number | null) {
  const [mark, setMark] = useState<{ y: number, h: number } | null>(null)
  const [shown, setShown] = useState(false)
  const [instant, setInstant] = useState(true)
  const [hot, setHot] = useState<number | null>(null)
  // What place() reads straight after a change, as Vue's refs give it.
  const shownNow = useRef(false)
  const restRef = useRef(rest)
  restRef.current = rest

  const place = useCallback((i: number | null, instantly: boolean) => {
    const row = i === null ? undefined : list.current?.querySelectorAll<HTMLElement>('[data-glide-row]')[i]
    if (!row) {
      shownNow.current = false
      setShown(false)
      setHot(null)
      return
    }
    setInstant(instantly)
    setMark({ y: row.offsetTop, h: row.offsetHeight })
    shownNow.current = true
    setShown(true)
    setHot(i)
  }, [list])

  const point = useCallback((i: number) => place(i, !shownNow.current), [place])
  const leave = useCallback(() => place(restRef.current(), false), [place])
  const settle = useCallback(() => place(restRef.current(), true), [place])

  useEffect(() => settle(), [settle])

  return { mark, shown, instant, hot, point, leave, settle }
}
