<script setup lang="ts">
import { ref } from 'vue'
import { Activity, House, KeyRound, Layers, Network, Settings, SquareTerminal } from 'lucide-vue-next'
import ConsoleFrame from '@/components/product/ConsoleFrame.vue'
import SettingsPage from '@/components/product/SettingsPage.vue'
import type { SettingsMember, SignInOption } from '@/components/product/SettingsPage.vue'
// Settings in the console's frame, on sample data: rename the company, switch to Members or Sign-in, turn a way in on.
const groups = [
  { label: 'Platform', links: [{ label: "Overview", icon: House }, { label: "Namespaces", icon: Layers }, { label: "Sources", icon: Network }, { label: "Agents", icon: SquareTerminal }] },
  { label: 'Manage', links: [{ label: "API keys", icon: KeyRound }, { label: "Usage", icon: Activity }, { label: "Settings", icon: Settings, active: true }] },
]
const company = ref<{ name: string, id: string, joined: string }>({
  "name": "Acme",
  "id": "cus_8f3k2m1q",
  "joined": "Mar 4, 2026"
})
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
const signIn = ref<SignInOption[]>([
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
])
const part = ref<'general' | 'members' | 'sign-in'>('general')
</script>

<template>
  <ConsoleFrame :groups="groups" :crumbs="[{ label: 'Overview', href: '#' }, { label: 'Settings' }]">
    <SettingsPage
      :company="company"
      :members="members"
      :sign-in="signIn"
      email="admin@acme.com"
      v-model:part="part"
      @rename="name => company.name = name"
      @toggle="(id, on) => signIn = signIn.map(o => o.id === id ? { ...o, on } : o)"
    />
  </ConsoleFrame>
</template>
