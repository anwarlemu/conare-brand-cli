<script setup lang="ts">
import LoginPage from '@/components/site/LoginPage.vue'
// With no error the page only says where it is taking you, while the app forwards to sign-in.
</script>

<template>
  <LoginPage sign-in-href="#sign-in" demo-href="#demo" :full="false" />
</template>
