import type { ReactNode } from 'react'

// The frame of every console page (Page.vue, .v2-page .v2-page-wide): 1120px at most, 32px down and 16px in on a
// phone (40px and 32px from 768px), the title in Faculty Glyphic 20px (or Geist Mono when it is an identifier, shown
// as typed), the page's actions on the right, then the body in 24px steps.
export interface ConsolePageProps {
  title: string
  mono?: boolean
  /** Beside the title (Vue's `meta` slot). */
  meta?: ReactNode
  /** The page's actions on the right (Vue's `actions` slot). */
  actions?: ReactNode
  children?: ReactNode
}

export function ConsolePage({ title, mono, meta, actions, children }: ConsolePageProps) {
  return (
    <div data-ds="console-page" className="mx-auto w-full max-w-page-wide px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
      <header className="mb-6 flex min-h-8 flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className={mono ? 'min-w-0 font-code text-heading-3 leading-8 font-medium [overflow-wrap:anywhere]' : 'min-w-0 type-heading-3'}>{title}</h1>
          {meta}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </header>
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  )
}

export default ConsolePage
