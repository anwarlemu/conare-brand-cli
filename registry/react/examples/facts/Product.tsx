import { Facts } from '@/react/components/ui/Facts'
// Short facts about a sign-in connection, each its own small box, so a row of them wraps cleanly.
const facts = [
  { name: 'Provider', value: 'Okta' },
  { name: 'Protocol', value: 'SAML' },
  { name: 'Domain', value: 'acme.com', mono: true },
  { name: 'Last sign-in', value: '2 h ago' },
]

export default function Product() {
  return <Facts facts={facts} className="justify-center" />
}
