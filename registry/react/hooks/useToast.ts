'use client'
import { useSyncExternalStore } from 'react'

/**
 * A short note in the corner: what just happened, for a moment. Every note sits in one list, so a burst can't pile up:
 * three show at most, the oldest making way, and the same note again only restarts its time. Toaster shows them.
 */
export interface Toast { id: number, text: string, detail?: string, left: number }

export const TOAST_MS = 4000
const MOST = 3
let toasts: Toast[] = []
let last = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())

/** The store behind the notes (read by Toaster). */
export const toastStore = {
  get: () => toasts,
  set(next: Toast[]) {
    toasts = next
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}

/** The notes on screen (read by Toaster). */
export const useToasts = () => useSyncExternalStore(toastStore.subscribe, toastStore.get, toastStore.get)

/** toast(text, detail?) shows a note. Works outside components too: `toast` is exported as well. */
export function toast(text: string, detail?: string) {
  const same = toasts.find(t => t.text === text && t.detail === detail)
  if (same) {
    toastStore.set(toasts.map(t => (t === same ? { ...t, left: TOAST_MS } : t)))
    return
  }
  last += 1
  toastStore.set([...toasts.slice(1 - MOST), { id: last, text, detail, left: TOAST_MS }])
}

export function useToast() {
  return toast
}
