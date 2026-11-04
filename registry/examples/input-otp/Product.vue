<script setup lang="ts">
import { ref } from 'vue'
import InputOtp from '@/components/ui/InputOtp.vue'
// The code from the sign-in email: six digits in two threes. Type, paste or take the phone's suggestion; 000000 shows
// the wrong-code state.
const code = ref('')
const state = ref<'idle' | 'checking' | 'wrong' | 'ok'>('idle')
function check(value: string) {
  state.value = 'checking'
  setTimeout(() => { state.value = value === '000000' ? 'wrong' : 'ok' }, 600)
}
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <p id="otp-label" class="type-meta text-fg-soft">Code from the email</p>
    <InputOtp v-model="code" label="code from the email" :split="3" :invalid="state === 'wrong'" @complete="check" @update:model-value="state = 'idle'" />
    <p class="min-h-4 type-meta" :class="state === 'wrong' ? 'text-fg-danger' : 'text-fg-muted'" role="status">
      {{ state === 'checking' ? 'Checking' : state === 'wrong' ? 'That code is not right. Check the latest email.' : state === 'ok' ? 'Signed in.' : 'It expires in 10 minutes.' }}
    </p>
  </div>
</template>
