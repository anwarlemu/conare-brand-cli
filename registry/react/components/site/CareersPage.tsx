import { SectionHead } from '@/react/components/site/SectionHead'
import { SitePage, type SiteFrameProps } from '@/react/components/site/SitePage'

// The open roles: the page's head, then a row per role in the website's double rule (its name in Faculty Glyphic, the
// team and the place under it, the whole row a link that takes the paper under the pointer), or the line the page gives
// when there are none. In the site's frame. The site has no careers page: set from the 404's cells and the pages' heads.
export type CareersRole = { title: string, team?: string, place?: string, href: string }
export interface CareersPageProps extends SiteFrameProps { tag?: string, title: string, body?: string, roles: CareersRole[], empty?: string }

const css = `.ds-role-link { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-role-link:hover { background-color: var(--ds-color-surface-subtle); } }
.ds-role-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }`

export function CareersPage({ header, footer, announcement, logo, actions, tag, title, body, roles, empty = '' }: CareersPageProps) {
  return (
    <>
      <style href="ds-careers-page" precedence="ds">{css}</style>
      <SitePage data-ds="careers-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
        <section aria-labelledby="careers-title" className="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40">
          <SectionHead as="h1" titleId="careers-title" tag={tag} title={title} body={body} />
          {roles.length
            ? (
                <ul aria-label="Open roles" className="mx-auto mt-14 grid max-w-[1008px] gap-px border border-edge bg-edge outline outline-offset-4 outline-edge">
                  {roles.map(r => (
                    <li key={r.href} className="flex bg-surface">
                      <a href={r.href} className="ds-role-link flex w-full flex-col gap-1 px-5 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:px-6">
                        <span className="type-heading-3 text-fg">{r.title}</span>
                        {(r.team || r.place) && <span className="type-meta text-fg-muted">{[r.team, r.place].filter(Boolean).join(' · ')}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              )
            : empty && <p className="mx-auto mt-14 max-w-[1008px] border border-edge px-5 py-6 text-center type-ui text-fg-muted outline outline-offset-4 outline-edge">{empty}</p>}
        </section>
      </SitePage>
    </>
  )
}

export default CareersPage
