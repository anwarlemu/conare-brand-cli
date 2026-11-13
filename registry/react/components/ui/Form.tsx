'use client'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

// A form in the console's grammar (new, composed from Field, Input and Button): fields stacked 16px apart, each a Field
// with its label over it and its hint or error under it; a failure from the server in a red-wash box above the actions;
// the actions at the end, the main one last. It never validates as the first value is typed: useForm shows an error
// once its field is left or the form is sent, and on a send with errors focus moves to the first field that is wrong.
// The browser's own bubbles are off (noValidate); Enter in a field sends it. Vue's #actions slot is `actions`.
export interface FormProps { failure?: string, label?: string, onSubmit?: () => void, actions?: ReactNode, children?: ReactNode, className?: string }

export function Form({ failure, label, onSubmit, actions, children, className }: FormProps) {
  const form = useRef<HTMLFormElement | null>(null)
  // Vue moves focus after the next render (nextTick), once the errors the submit raised are drawn.
  const [sent, setSent] = useState(0)
  useEffect(() => {
    if (sent) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [sent])
  function send(event: FormEvent) {
    event.preventDefault()
    onSubmit?.()
    setSent(n => n + 1)
  }
  return (
    <form data-ds="form" ref={form} className={className ? `flex flex-col gap-4 ${className}` : 'flex flex-col gap-4'} noValidate aria-label={label} onSubmit={send}>
      {children}
      {failure && (
        <p className="flex items-start gap-2 border border-transparent bg-surface-danger px-3 py-2 type-meta text-fg-danger" role="alert">
          <span className="mt-1.5 size-1 shrink-0 bg-edge-accent" aria-hidden="true" />{failure}
        </p>
      )}
      {actions && <div className="flex flex-wrap items-center justify-end gap-2 pt-2">{actions}</div>}
    </form>
  )
}

export default Form
