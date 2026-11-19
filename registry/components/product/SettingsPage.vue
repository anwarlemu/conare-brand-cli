<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { Pencil } from 'lucide-vue-next'
import ConsolePage from '@/components/product/ConsolePage.vue'
import Button from '@/components/ui/Button.vue'
import CopyText from '@/components/ui/CopyText.vue'
import Input from '@/components/ui/Input.vue'
import LineTabs from '@/components/ui/LineTabs.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Switch from '@/components/ui/Switch.vue'
import Table from '@/components/ui/Table.vue'
import Tag from '@/components/ui/Tag.vue'

// Settings (pages/dashboard/settings, SettingsFrame take 3): one title and its parts as line tabs under it, switching
// in place. Every part is the settings table, so a tab changes what it says and not how it looks. General: the
// company's name (Edit opens it in place: Save, Cancel or Escape), its ID to copy and when it joined, then who is
// signed in and Sign out. Members: who is in, their role and when they joined, with Invite members, the page's one
// dark button, on the tabs' row. Sign-in: each way in with its switch. It calls nothing: rename, invite, remove,
// toggle and sign-out are events; v-model:part is the open tab.
export type SettingsPart = 'general' | 'members' | 'sign-in'
export type SettingsMember = { email: string, role: string, joined: string, invited?: boolean }
export type SignInOption = { id: string, label: string, description: string, on: boolean }
const props = defineProps<{
  company: { name: string, id: string, joined: string }
  members: SettingsMember[]
  signIn: SignInOption[]
  email: string
}>()
const part = defineModel<SettingsPart>('part', { default: 'general' })
const emit = defineEmits<{ rename: [name: string], invite: [], remove: [member: SettingsMember], toggle: [id: string, on: boolean], signOut: [] }>()
const PARTS: { value: SettingsPart, label: string }[] = [{ value: 'general', label: 'General' }, { value: 'members', label: 'Members' }, { value: 'sign-in', label: 'Sign-in' }]

const uid = useId()
const editing = ref(false)
const draft = ref('')
function edit() {
  draft.value = props.company.name
  editing.value = true
  void nextTick(() => document.getElementById(`${uid}-rename`)?.focus())
}
function save() {
  const name = draft.value.trim()
  if (!name) return
  editing.value = false
  emit('rename', name)
}
</script>

<template>
  <ConsolePage data-ds="settings-page" title="Settings">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0 flex-1"><LineTabs v-model="part" :options="PARTS" label="settings" /></div>
      <PixelButton v-if="part === 'members'" class="shrink-0" @click="emit('invite')">Invite members</PixelButton>
    </div>

    <div v-if="part === 'general'" class="flex flex-col gap-4">
      <Table variant="settings" framed>
        <thead><tr><th>Company</th><th><span class="sr-only">Value</span></th></tr></thead>
        <tbody>
          <tr>
            <td class="whitespace-nowrap text-fg-muted">Name</td>
            <td class="text-right">
              <form v-if="editing" class="flex flex-wrap items-center justify-end gap-2" @submit.prevent="save">
                <span class="block w-56 max-w-full"><Input :id="`${uid}-rename`" v-model="draft" maxlength="100" aria-label="new name" required @keydown.esc="editing = false" /></span>
                <PixelButton type="submit" :disabled="!draft.trim()">Save</PixelButton>
                <Button variant="ghost" @click="editing = false">Cancel</Button>
              </form>
              <span v-else class="inline-flex max-w-full items-center justify-end gap-2">
                <span class="truncate">{{ company.name }}</span>
                <Button variant="ghost" icon aria-label="rename company" @click="edit"><Pencil :size="12" :stroke-width="1.5" aria-hidden="true" /></Button>
              </span>
            </td>
          </tr>
          <tr><td class="whitespace-nowrap text-fg-muted">Company ID</td><td class="text-right"><span class="inline-flex max-w-full justify-end"><CopyText :value="company.id" label="company id" /></span></td></tr>
          <tr><td class="whitespace-nowrap text-fg-muted">Joined</td><td class="text-right">{{ company.joined }}</td></tr>
        </tbody>
      </Table>
      <div class="flex items-center justify-between gap-3 type-ui">
        <span class="flex min-w-0 items-center gap-3"><span class="whitespace-nowrap text-fg-muted max-sm:hidden">Signed in as</span><span class="truncate">{{ email }}</span></span>
        <Button variant="danger" class="w-23 shrink-0" @click="emit('signOut')">Sign out</Button>
      </div>
    </div>

    <Table v-else-if="part === 'members'" variant="settings" framed>
      <thead><tr><th>Member</th><th class="w-32 max-sm:hidden">Role</th><th class="w-32 max-md:hidden">Joined</th><th class="w-px"><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>
        <tr v-for="m in members" :key="m.email">
          <td class="max-w-0">
            <span class="block truncate" :title="m.email">{{ m.email }}</span>
            <span class="block type-meta text-fg-muted sm:hidden">{{ m.role }}</span>
          </td>
          <td class="max-sm:hidden"><span class="flex items-center gap-1"><Tag tone="quiet">{{ m.role }}</Tag><Tag v-if="m.invited" tone="quiet">invited</Tag></span></td>
          <td class="whitespace-nowrap text-fg-muted max-md:hidden">{{ m.joined }}</td>
          <td class="text-right"><Button :aria-label="`remove ${m.email}`" @click="emit('remove', m)">Remove</Button></td>
        </tr>
      </tbody>
    </Table>

    <Table v-else variant="settings" framed>
      <thead><tr><th class="w-px"><span class="sr-only">On</span></th><th>Sign-in</th></tr></thead>
      <tbody>
        <tr v-for="o in signIn" :key="o.id">
          <td><Switch :model-value="o.on" :label="o.label" @update:model-value="emit('toggle', o.id, $event)" /></td>
          <td>
            <span class="block">{{ o.label }}</span>
            <span class="block type-meta text-fg-muted">{{ o.description }}</span>
          </td>
        </tr>
      </tbody>
    </Table>
  </ConsolePage>
</template>
