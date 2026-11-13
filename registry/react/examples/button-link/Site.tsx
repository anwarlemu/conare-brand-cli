import { ButtonLink } from '@/react/components/site/ButtonLink'
// The website's buttons: the dark one with its pixel fill and arrow for the main call to action, outlined for the rest;
// light and ghost on a dark band.

export default function Site() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href="#demo" pixels arrow>Book a demo</ButtonLink>
        <ButtonLink href="#docs" variant="secondary">Read the docs</ButtonLink>
        <ButtonLink href="#pricing" variant="secondary" size="sm">Pricing</ButtonLink>
      </div>
      <div data-theme="dark" className="flex flex-wrap items-center gap-3 bg-off-black p-6">
        <ButtonLink href="#demo" variant="light">Book a demo</ButtonLink>
        <ButtonLink href="#docs" variant="ghost">Read the docs</ButtonLink>
      </div>
    </div>
  )
}
