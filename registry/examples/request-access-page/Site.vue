<script setup lang="ts">
import { ref } from 'vue'
import RequestAccessPage from '@/components/site/RequestAccessPage.vue'
import type { AccessAnswers, AccessState } from '@/components/site/RequestAccessPage.vue'
// The request-access page as it ships, with a sample requester: send the form to see the sent state, and change the
// answers to come back. The app would post the answers; here they wait a moment instead.
const state = ref<AccessState>('form')
const sending = ref(false)
function submit(_answers: AccessAnswers) {
  sending.value = true
  setTimeout(() => {
    sending.value = false
    state.value = 'sent'
  }, 600)
}
</script>

<template>
  <RequestAccessPage
    :state="state"
    email="sam@acme.com"
    name="Sam"
    :sending="sending"
    home-href="#home"
    demo-href="#demo"
    sign-in-href="#sign-in"
    privacy-href="#privacy"
    :full="false"
    @submit="submit"
    @edit="state = 'form'"
  />
</template>
