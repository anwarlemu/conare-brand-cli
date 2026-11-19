import { LogoStrip } from '@/react/components/site/LogoStrip'
// Who uses it: twelve wordmarks set as text, never real logos.
const logos = [
  {
    "name": "Acme",
    "mark": true
  },
  {
    "name": "Acme Labs",
    "mark": false
  },
  {
    "name": "Acme Cloud",
    "mark": false
  },
  {
    "name": "Acme Health",
    "mark": true
  },
  {
    "name": "Acme Freight",
    "mark": false
  },
  {
    "name": "Acme Bank",
    "mark": false
  },
  {
    "name": "Acme Retail",
    "mark": true
  },
  {
    "name": "Acme Energy",
    "mark": false
  },
  {
    "name": "Acme Legal",
    "mark": false
  },
  {
    "name": "Acme Studio",
    "mark": true
  },
  {
    "name": "Acme Robotics",
    "mark": false
  },
  {
    "name": "Acme Foods",
    "mark": false
  }
]
export default function Site() {
  return (
    <LogoStrip
      tag="Customers"
      title="Teams at Acme companies search with it."
      logos={logos}
    />
  )
}
