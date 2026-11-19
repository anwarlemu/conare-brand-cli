import { ButtonLink } from '@/react/components/site/ButtonLink'
import { SectionHead } from '@/react/components/site/SectionHead'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'

// The page for an address that leads nowhere: the tag with the code, one line on what happened, the one dark way home,
// then where people usually meant to go, as cells in the double rule that take the paper under the pointer. In the
// site's frame, so the header and the footer still lead on.
export interface NotFoundPageProps extends SiteFrameProps {
  code?: string
  title?: string
  body?: string
  home: SiteAction
  links?: SiteAction[]
}

export function NotFoundPage({ header, footer, announcement, logo, actions, code = '404', title = 'This page is not here.', body = 'It moved, or the address has a typo. Start again from the home page.', home, links = [] }: NotFoundPageProps) {
  return (
    <>
      <style href="ds-not-found-page" precedence="ds">{css}</style>
      <SitePage data-ds="not-found-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
        <section aria-labelledby="not-found-title" className="mx-auto max-w-[1440px] px-4 pt-24 pb-32 sm:px-6 lg:px-10 lg:pt-32 lg:pb-40">
          <SectionHead as="h1" titleId="not-found-title" tag={code} title={title} body={body} action={<ButtonLink href={home.href} grain pixels arrow>{home.label}</ButtonLink>} />
          {!!links.length && (
            <ul aria-label="Pages people look for" className="mx-auto mt-16 grid max-w-[880px] grid-cols-2 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-4">
              {links.map(l => (
                <li key={l.href} className="flex bg-surface">
                  <a href={l.href} className="ds-lost-link flex h-16 w-full items-center justify-center px-3 text-body text-fg">{l.label}</a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </SitePage>
    </>
  )
}

export default NotFoundPage

const css = `
.ds-lost-link { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-lost-link:hover { background-color: var(--ds-color-surface-subtle); } }
.ds-lost-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
`
