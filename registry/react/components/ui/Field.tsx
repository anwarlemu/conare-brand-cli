import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A label over one control, with a hint or an error under it (the console's forms): the label 12px soft, the hint
// 12px muted, the error in the danger red. Vue's scoped slot is a render function: children receives the ids to wire,
// <Field label="Name">{({ id, hintId }) => <Input id={id} aria-describedby={hintId} />}</Field>; plain children work too.
export interface FieldSlot { id: string, hintId?: string, invalid: boolean }
export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string
  hint?: string
  error?: string
  id?: string
  children?: ReactNode | ((slot: FieldSlot) => ReactNode)
}

export function Field({ label, hint, error, id: given, className, children, ...rest }: FieldProps) {
  const auto = useId()
  const id = given ?? `field-${auto}`
  const hintId = hint || error ? `${id}-hint` : undefined
  return (
    <div data-ds="field" className={cn('flex flex-col gap-1.5', className)} {...rest}>
      <label htmlFor={id} className="type-meta text-fg-soft">{label}</label>
      {typeof children === 'function' ? children({ id, hintId, invalid: !!error }) : children}
      {(error || hint) && <p id={hintId} className={cn('type-meta', error ? 'text-fg-danger' : 'text-fg-muted')} role={error ? 'alert' : undefined}>{error || hint}</p>}
    </div>
  )
}

export default Field
