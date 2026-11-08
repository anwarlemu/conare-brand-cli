<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'

// The sign-in page (pages/login.vue): the mark over one line while the app forwards to sign-in, or, when sign-in came
// back with an error, the reason and the ways on: book a demo (the one dark action), request access (only for an email
// with no invite) and sign in again. It forwards nowhere itself: the app passes `error` (a code or its own words) and
// the links, and does the forwarding. `full` fills the window; off, it sits in its container.
export type LoginError = 'expired' | 'cancelled' | 'unavailable' | 'failed' | 'private'

const props = withDefaults(defineProps<{
  error?: LoginError | string
  title?: string
  signInHref: string
  demoHref: string
  requestHref?: string
  full?: boolean
}>(), { title: 'Conare is invite-only', full: true })

const MESSAGES: Record<LoginError, string> = {
  expired: 'Your sign-in took too long. Try again.',
  cancelled: 'Sign-in was cancelled.',
  unavailable: 'Sign-in is not available right now. Try again in a few minutes.',
  failed: 'Sign-in did not complete. Try again.',
  private: 'This email doesn\'t have an invite yet. Ask an admin of your team to invite you, or request access.',
}
const message = computed(() => (props.error ? (MESSAGES[props.error as LoginError] ?? props.error) : ''))
const MARK = 'M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457ZM0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799ZM0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597ZM0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692ZM148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z'
</script>

<template>
  <main data-ds="login-page" class="flex flex-col items-center justify-center gap-6 bg-surface px-4 text-center text-fg" :class="full ? 'min-h-dvh' : 'py-24'">
    <svg viewBox="0 0 149 134" class="h-12 w-auto text-fg" fill="currentColor" role="img" aria-label="Conare"><path fill-rule="evenodd" :d="MARK" /></svg>
    <template v-if="message">
      <h1 class="type-heading-3">{{ title }}</h1>
      <p class="max-w-sm bg-surface-danger px-3 py-2 type-ui text-fg" role="alert">{{ message }}</p>
      <div class="flex flex-wrap justify-center gap-3">
        <PixelButton :href="demoHref">Book a demo</PixelButton>
        <Button v-if="error === 'private' && requestHref" :href="requestHref">Request access</Button>
        <Button :href="signInHref">Sign in again</Button>
      </div>
    </template>
    <p v-else class="type-ui text-fg-muted" role="status">Taking you to sign in.</p>
  </main>
</template>
