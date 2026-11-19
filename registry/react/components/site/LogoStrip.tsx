import { SectionHead } from '@/react/components/site/SectionHead'

// Who uses it or what it connects to (Integrations.vue): the band's head, then a 64px cell per name in the website's
// double rule, two across on phones, three from 640px and six from 1024px. Each name is a wordmark drawn as text in the
// type's colour, never a company's real logo; `mark` puts a small square before it. Pass multiples of six.
export type Logo = { name: string, mark?: boolean }
export interface LogoStripProps { title: string, tag?: string, logos: Logo[], titleId?: string }

export function LogoStrip({ title, tag, logos, titleId = 'logos-title' }: LogoStripProps) {
  return (
    <section data-ds="logo-strip" aria-labelledby={titleId} className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10">
      <SectionHead title={title} tag={tag} titleId={titleId} />
      <ul className="mt-8 grid grid-cols-2 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-3 lg:grid-cols-6">
        {logos.map(logo => (
          <li key={logo.name} className="flex h-16 items-center justify-center gap-2 bg-surface px-3 text-body-lg font-medium tracking-tight text-fg">
            {logo.mark && <span aria-hidden="true" className="size-2 shrink-0 bg-fg" />}
            <span className="truncate">{logo.name}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default LogoStrip
