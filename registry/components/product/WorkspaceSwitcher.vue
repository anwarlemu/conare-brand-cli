<script setup lang="ts">
import { computed } from 'vue'
import { Check, ChevronsUpDown, Plus, Settings, Users } from 'lucide-vue-next'
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
import MenuLabel from '@/components/ui/MenuLabel.vue'
import MenuSeparator from '@/components/ui/MenuSeparator.vue'

// The organization switcher at the top of the sidebar (WorkspaceMenu.vue): the brand mark (slot `mark`, an initial
// tile without it), the organization in 12px medium over its customer and role in 11px muted, and a 264px menu of
// every organization the person reaches, grouped by customer under a label with the role tag, the current one
// checked and in medium. Then what goes with an organization: New organization (admins), its settings, its members.
// v-model is the current organization's id; `switching` marks the one opening while the others wait.
export interface WorkspaceGroup { id: string, name: string, role?: string, organizations: Array<{ id: string, name: string, default?: boolean }> }
const props = withDefaults(defineProps<{
  groups: WorkspaceGroup[]
  admin?: boolean
  switching?: string
  error?: string
  settingsHref?: string
  membersHref?: string
}>(), { settingsHref: '#', membersHref: '#' })
const current = defineModel<string>({ required: true })
const emit = defineEmits<{ create: [] }>()
const where = computed(() => {
  for (const g of props.groups) {
    const o = g.organizations.find(x => x.id === current.value)
    if (o) return { org: o, group: g }
  }
  return undefined
})
const several = computed(() => props.groups.length > 1)
const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '·'
function choose(id: string) {
  if (id !== current.value && !props.switching) current.value = id
}
</script>

<template>
  <Menu
    label="workspaces"
    offset="8px"
    class="!flex h-full w-full"
    trigger-class="relative isolate flex h-full w-full cursor-pointer items-center gap-2 px-3 text-left before:absolute before:inset-x-2 before:inset-y-1.5 before:-z-10 before:transition-colors before:duration-120 before:ease-standard hover:before:bg-edge/45 aria-expanded:before:bg-edge/45 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus"
  >
    <template #trigger>
      <slot name="mark"><span class="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">{{ initial(where?.org.name ?? '') }}</span></slot>
      <span class="min-w-0 flex-1">
        <span class="block translate-y-[0.5px] truncate text-meta leading-3 font-medium">{{ where?.org.name ?? '\u00a0' }}</span>
        <span class="mt-px block translate-y-[0.5px] truncate pb-0.75 -mb-0.75 text-caption leading-2.5 text-fg-muted">{{ where?.group.name ?? '\u00a0' }}<template v-if="where?.group.role"> · {{ where.group.role }}</template></span>
      </span>
      <ChevronsUpDown :size="14" :stroke-width="1.5" class="mr-0.75 shrink-0 text-fg-muted" aria-hidden="true" />
    </template>
    <template v-for="g in groups" :key="g.id">
      <MenuLabel>
        <span class="truncate">{{ g.name }}</span>
        <span v-if="(several || g.role) && g.role" class="shrink-0 border border-edge px-1 text-caption leading-4">{{ g.role }}</span>
      </MenuLabel>
      <MenuItem v-for="o in g.organizations" :key="o.id" :current="o.id === current" :disabled="!!switching && switching !== o.id" @select="choose(o.id)">
        <span class="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">{{ initial(o.name) }}</span>
        <span class="min-w-0 flex-1 truncate">{{ o.name }}</span>
        <span v-if="switching === o.id" class="type-meta text-fg-muted">opening</span>
        <span v-else-if="o.default" class="type-meta text-fg-muted">default</span>
        <Check v-if="o.id === current" :size="14" :stroke-width="1.5" class="shrink-0" aria-label="current" />
      </MenuItem>
    </template>
    <MenuSeparator />
    <MenuItem v-if="admin" @select="emit('create')"><Plus :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />New organization</MenuItem>
    <MenuItem :href="settingsHref"><Settings :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Organization settings</MenuItem>
    <MenuItem :href="membersHref"><Users :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />{{ admin ? 'Invite members' : 'Members' }}</MenuItem>
    <p v-if="error" class="px-3 py-1 type-meta text-fg-danger" role="alert">{{ error }}</p>
  </Menu>
</template>
