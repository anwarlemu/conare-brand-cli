'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A copy button's state: copy(text) writes the clipboard, and copied is true for 1.5s after. Where the Clipboard API is
 * refused (a browser or a frame that denies it), the older copy command still works inside the click. Only if both are
 * refused does it answer false, and the text stays selectable.
 */
export function useCopy(ms = 1500) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
    }
    catch {
      if (!copyByCommand(text)) return false
    }
    setCopied(true)
    clearTimeout(timer.current)
    // ds-latency: the Copied label stays 1.5s after the copy, which has already happened.
    timer.current = setTimeout(() => setCopied(false), ms)
    return true
  }, [ms])
  return { copied, copy }
}

// The older way: select the text in an unseen field, run the copy command, hand focus back.
function copyByCommand(text: string) {
  const back = document.activeElement as HTMLElement | null
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  let ok = false
  try { ok = document.execCommand('copy') }
  catch { ok = false }
  field.remove()
  back?.focus()
  return ok
}
