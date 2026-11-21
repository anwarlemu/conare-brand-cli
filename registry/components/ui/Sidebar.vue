<script setup lang="ts">
// The console's navigation (console2.css .v2-side): 216px of paper with a hairline at its edge. Put a SidebarLabel
// over each group and a SidebarLink per page; `head` holds the workspace switcher (48px, over a hairline) and `foot`
// the account menu. It stays open on wide screens; on a phone the app shows it as a drawer over the page.
defineProps<{ label?: string }>()
</script>

<template>
  <nav data-ds="sidebar" class="flex w-sidebar flex-col border-r border-edge bg-surface-subtle" :aria-label="label ?? 'main'">
    <div v-if="$slots.head" class="h-bar shrink-0 border-b border-edge"><slot name="head" /></div>
    <div class="fade-y flex min-h-0 flex-1 flex-col overflow-y-auto pb-4"><slot /></div>
    <div v-if="$slots.foot" class="shrink-0 border-t border-edge"><slot name="foot" /></div>
  </nav>
</template>
