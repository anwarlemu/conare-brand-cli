<script setup lang="ts">
import LoginPage from '@/components/site/LoginPage.vue'
// The sign-in page as it ships when an email has no invite: the reason, then book a demo, request access and sign in
// again. The app passes the error from the sign-in callback and does the forwarding.
</script>

<template>
  <LoginPage error="private" sign-in-href="#sign-in" demo-href="#demo" request-href="#request-access" :full="false" />
</template>
