import { ButtonLink } from '@/react/components/site/ButtonLink'
import { CallToAction } from '@/react/components/site/CallToAction'
// The closing band, before the footer: the light button link, its squares coming in black on the red.

export default function Site() {
  return (
    <CallToAction title="See it on your own data.">
      <ButtonLink href="#" variant="light" fill="black">Book a demo</ButtonLink>
    </CallToAction>
  )
}
