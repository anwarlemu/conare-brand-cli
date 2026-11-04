import { ref } from 'vue'

/**
 * A short note in the corner: what just happened, for a moment. Every note sits in one list, so a burst can't pile up:
 * three show at most, the oldest making way, and the same note again only restarts its time. Toaster.vue shows them.
 */
export interface Toast { id: number, text: string, detail?: string, left: number }

export const TOAST_MS = 4000
const MOST = 3
const toasts = ref<Toast[]>([])
let last = 0

/** The notes on screen (read by Toaster.vue). */
export const useToasts = () => toasts

/** toast(text, detail?) shows a note. */
export function useToast() {
  return (text: string, detail?: string) => {
    const same = toasts.value.find(t => t.text === text && t.detail === detail)
    if (same) {
      same.left = TOAST_MS
      return
    }
    last += 1
    toasts.value = [...toasts.value.slice(1 - MOST), { id: last, text, detail, left: TOAST_MS }]
  }
}
