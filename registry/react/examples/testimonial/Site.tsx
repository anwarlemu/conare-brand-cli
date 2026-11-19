import { Testimonial } from '@/react/components/site/Testimonial'
// One customer's words, attributed to a role at the company.
export default function Site() {
  return (
    <Testimonial
      quote="Our support agent answers from every ticket and policy we have, and when it is not sure, it says where it looked."
      role="Head of support"
      company="Acme"
    />
  )
}
