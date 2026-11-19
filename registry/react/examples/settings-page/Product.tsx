'use client'
import { useState } from 'react'
import { Activity, House, KeyRound, Layers, Network, Settings, SquareTerminal } from 'lucide-react'
import { ConsoleFrame } from '@/react/components/product/ConsoleFrame'
import { SettingsPage } from '@/react/components/product/SettingsPage'
import type { SettingsMember, SignInOption } from '@/react/components/product/SettingsPage'
// Settings in the console's frame, on sample data: rename the company, switch to Members or Sign-in, turn a way in on.
const groups = [
  { label: 'Platform', links: [{ label: "Overview", icon: House }, { label: "Namespaces", icon: Layers }, { label: "Sources", icon: Network }, { label: "Agents", icon: SquareTerminal }] },
  { label: 'Manage', links: [{ label: "API keys", icon: KeyRound }, { label: "Usage", icon: Activity }, { label: "Settings", icon: Settings, active: true }] },
]
const companyStart: { name: string, id: string, joined: string } = {
  "name": "Acme",
  "id": "cus_8f3k2m1q",
  "joined": "Mar 4, 2026"
}
const members: SettingsMember[] = [
  {
    "email": "admin@acme.com",
    "role": "admin",
    "joined": "Mar 4, 2026"
  },
  {
    "email": "support@acme.com",
    "role": "member",
    "joined": "Apr 18, 2026"
  },
  {
    "email": "data@acme.com",
    "role": "member",
    "joined": "Jun 2, 2026"
  },
  {
    "email": "legal@acme.com",
    "role": "member",
    "joined": "Nov 10, 2026",
    "invited": true
  }
]
const signInStart: SignInOption[] = [
  {
    "id": "google",
    "label": "Google",
    "description": "Sign in with a Google Workspace account.",
    "on": true
  },
  {
    "id": "sso",
    "label": "Single sign-on",
    "description": "Sign in through your identity provider (SAML).",
    "on": false
  },
  {
    "id": "domain",
    "label": "Join by domain",
    "description": "Anyone with an acme.com address joins as a member.",
    "on": false
  }
]
export default function Product() {
  const [company, setCompany] = useState(companyStart)
  const [signIn, setSignIn] = useState(signInStart)
  return (
    <ConsoleFrame groups={groups} crumbs={[{ label: 'Overview', href: '#' }, { label: 'Settings' }]}>
      <SettingsPage
        company={company}
        members={members}
        signIn={signIn}
        email="admin@acme.com"
        onRename={name => setCompany({ ...company, name })}
        onToggle={(id, on) => setSignIn(signIn.map(o => (o.id === id ? { ...o, on } : o)))}
      />
    </ConsoleFrame>
  )
}
