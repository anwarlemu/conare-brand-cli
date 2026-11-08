<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronsUpDown, LogOut, ShieldCheck } from 'lucide-vue-next'
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
import MenuSeparator from '@/components/ui/MenuSeparator.vue'

// The person, at the foot of the sidebar (AccountMenu.vue): a black square for the picture, their email, and a menu
// that opens upward with sign-in settings and Sign out in red. Its top shows the credits left on a 4px meter
// (.v2-meter) when `credits` is given; `open` fires each time it opens, so the app can fetch them then. `signingOut`
// keeps the menu open on "Signing out" while the app ends the session. `up: false` opens it downward.
const props = withDefaults(defineProps<{
  email: string
  credits?: { left: string, share: number } | null
  securityHref?: string
  signingOut?: boolean
  up?: boolean
}>(), { securityHref: '#', up: true })
const emit = defineEmits<{ open: [], signOut: [] }>()
const menu = ref<InstanceType<typeof Menu> | null>(null)
watch(() => menu.value?.open, (now) => { if (now) emit('open') })
const share = () => `${Math.max(0, Math.min(1, props.credits?.share ?? 0)) * 100}%`
</script>

<template>
  <Menu data-ds="account-menu"
    ref="menu"
    label="account"
    :up="up"
    offset="8px"
    width="calc(100% - 16px)"
    class="!flex h-full w-full"
    trigger-class="relative isolate flex h-full w-full cursor-pointer items-center gap-2 px-3 text-left text-meta before:absolute before:inset-x-2 before:inset-y-1.5 before:-z-10 before:transition-colors before:duration-120 before:ease-standard hover:before:bg-edge/45 aria-expanded:before:bg-edge/45 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus"
  >
    <template #trigger>
      <span class="size-5 shrink-0 bg-off-black" aria-hidden="true" />
      <span class="min-w-0 flex-1 truncate text-left">{{ email }}</span>
      <ChevronsUpDown :size="14" :stroke-width="1.5" class="mr-0.75 shrink-0 text-fg-muted" aria-hidden="true" />
    </template>
    <template v-if="credits">
      <div class="flex flex-col gap-1.5 px-3.5 pt-2 pb-2.5" role="none">
        <p class="flex items-baseline justify-between gap-2"><span class="type-meta text-fg-muted">Credits left</span><span class="font-medium tabular-nums">{{ credits.left }}</span></p>
        <div class="h-1 bg-edge" aria-hidden="true"><span class="block h-full bg-surface-inverse" :style="{ width: share() }" /></div>
      </div>
      <MenuSeparator />
    </template>
    <MenuItem :href="securityHref"><ShieldCheck :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Sign-in and security</MenuItem>
    <MenuSeparator />
    <MenuItem danger keep-open :disabled="signingOut" @select="emit('signOut')"><LogOut :size="14" :stroke-width="1.5" class="shrink-0" aria-hidden="true" />{{ signingOut ? 'Signing out' : 'Sign out' }}</MenuItem>
  </Menu>
</template>
