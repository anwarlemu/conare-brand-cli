<script setup lang="ts">
import { ref } from 'vue'
import AccountMenu from '@/components/product/AccountMenu.vue'
// The account row at the foot of the sidebar. Its row has its four edges here, where no sidebar frames it, and its
// menu opens down, where the sidebar's foot would send it up. Sign out shows its pending label; nothing signs out.
const signingOut = ref(false)
</script>

<template>
  <div class="h-80">
    <div class="h-bar w-sidebar border border-edge bg-surface-subtle">
      <AccountMenu email="you@acme.com" :credits="{ left: '$184.20', share: 0.74 }" :up="false" :signing-out="signingOut" @sign-out="signingOut = true" />
    </div>
  </div>
</template>
