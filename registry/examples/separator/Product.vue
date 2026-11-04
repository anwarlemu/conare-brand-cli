<script setup lang="ts">
import Separator from '@/components/ui/Separator.vue'
// The hairline across a card between two parts, down a row of links, and inset in a menu's panel.
</script>

<template>
  <div class="grid gap-6 md:grid-cols-3">
    <div class="border border-edge bg-surface p-4">
      <p class="type-ui-strong">Namespace</p>
      <p class="type-meta text-fg-muted">contracts, 412,830 documents</p>
      <Separator class="my-3" />
      <p class="type-meta text-fg-muted">Synced 2 min ago</p>
    </div>
    <div class="flex h-7 items-center gap-3 self-start type-ui">
      <a href="#" class="hover:text-fg-soft">Billing</a><Separator orientation="vertical" /><a href="#" class="hover:text-fg-soft">Docs</a><Separator orientation="vertical" /><a href="#" class="hover:text-fg-soft">Status</a>
    </div>
    <div class="w-52 self-start border border-edge bg-surface p-1 type-ui">
      <p class="flex h-8 items-center px-2">Settings</p>
      <p class="flex h-8 items-center px-2">Members</p>
      <Separator inset />
      <p class="flex h-8 items-center px-2 text-fg-danger">Sign out</p>
    </div>
  </div>
</template>
