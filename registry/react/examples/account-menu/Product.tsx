'use client'
import { useState } from 'react'
import { AccountMenu } from '@/react/components/product/AccountMenu'
// The account row at the foot of the sidebar. Its row has its four edges here, where no sidebar frames it, and its
// menu opens down, where the sidebar's foot would send it up. Sign out shows its pending label; nothing signs out.

export default function Product() {
  const [signingOut, setSigningOut] = useState(false)
  return (
    <div className="h-80">
      <div className="h-bar w-sidebar border border-edge bg-surface-subtle">
        <AccountMenu email="you@acme.com" credits={{ left: '$184.20', share: 0.74 }} up={false} signingOut={signingOut} onSignOut={() => setSigningOut(true)} />
      </div>
    </div>
  )
}
