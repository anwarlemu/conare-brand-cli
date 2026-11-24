'use client'
import { useState } from 'react'
import { Newsletter } from '@/react/components/site/Newsletter'
// The sign-up on sample data: send it with an address to see the line that follows.
export default function Site() {
  const [sent, setSent] = useState(false)
  return (
    <div className="-mx-8 pt-8">
      <Newsletter tag="Newsletter" title="News from the team, once a month." body="What shipped, what we learned, and nothing else." sentText="You are on the list. The next issue comes at the start of the month." sent={sent} onSubmit={() => setSent(true)} />
    </div>
  )
}
