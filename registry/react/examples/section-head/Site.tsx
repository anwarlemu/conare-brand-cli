import { SectionHead } from '@/react/components/site/SectionHead'
import { ButtonLink } from '@/react/components/site/ButtonLink'
// A page's own head: the tag, the line, one muted line and the one dark call to action.
export default function Site() {
  return (
    <SectionHead
      as="h1"
      tag="Pricing"
      title="Pay for what you use."
      body="Usage pricing for every layer, with no monthly minimum."
      action={<ButtonLink href="#demo" grain pixels arrow>Book a demo</ButtonLink>}
    />
  )
}
