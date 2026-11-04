import { nextTick, onMounted, ref, type Ref } from 'vue'

/**
 * One block for a whole list (useGlideMark.ts, the website's Product menu highlight): it glides on transform to the row
 * under the pointer or focus, and rests on the current row (`rest`) when the pointer leaves, or hides when there is
 * none. Rows are the list's [data-glide-row] elements, in order, each positioned relative to the list. The first
 * placement doesn't glide. Draw the block with GlideMark.
 */
export function useGlideMark(list: Ref<HTMLElement | null>, rest: () => number | null) {
  const mark = ref<{ y: number, h: number } | null>(null)
  const shown = ref(false)
  const instant = ref(true)
  const hot = ref<number | null>(null)

  function place(i: number | null, instantly: boolean) {
    const row = i === null ? undefined : list.value?.querySelectorAll<HTMLElement>('[data-glide-row]')[i]
    if (!row) {
      shown.value = false
      hot.value = null
      return
    }
    instant.value = instantly
    mark.value = { y: row.offsetTop, h: row.offsetHeight }
    shown.value = true
    hot.value = i
  }

  const point = (i: number) => place(i, !shown.value)
  const leave = () => place(rest(), false)
  const settle = () => place(rest(), true)

  onMounted(() => nextTick(settle))

  return { mark, shown, instant, hot, point, leave, settle }
}
