<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from '@/components/ui/Button.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import NativeSelect from '@/components/ui/NativeSelect.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Textarea from '@/components/ui/Textarea.vue'

// Where sign-in sends someone it does not admit (pages/request-access.vue): the mark, the title and one line, then the
// part for where they are. `state` is the app's: loading (shown after 300ms), signed-out (sign in with a work email
// first), failed (try again), form (their email, then name, company, team size and what they want to build) or sent
// (what happens next). It calls nothing: `submit` carries the answers, `retry` and `edit` ask the app to load again or
// reopen the form. `full` fills the window; off, it sits in its container.
export type AccessState = 'loading' | 'signed-out' | 'failed' | 'form' | 'sent'
export type AccessAnswers = { name: string, company: string, teamSize: string, useCase: string }

const props = withDefaults(defineProps<{
  state: AccessState
  email?: string
  personalEmail?: boolean
  name?: string
  teamSizes?: readonly string[]
  sending?: boolean
  error?: string
  title?: string
  homeHref: string
  demoHref: string
  signInHref: string
  privacyHref: string
  supportEmail?: string
  full?: boolean
}>(), { teamSizes: () => ['1-10', '11-50', '51-200', '201-1,000', '1,001+'], title: 'Conare is invite-only', supportEmail: 'support@acme.com', full: true })
const emit = defineEmits<{ submit: [answers: AccessAnswers], retry: [], edit: [] }>()

const answers = ref<AccessAnswers>({ name: props.name ?? '', company: '', teamSize: '', useCase: '' })
watch(() => props.name, (n) => { if (n && !answers.value.name) answers.value.name = n })
const link = 'underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-200 ease-standard hover:decoration-fg'
const MARK = 'M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457ZM0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799ZM0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597ZM0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692ZM148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z'
</script>

<template>
  <main data-ds="request-access-page" class="bg-surface px-4 py-12 text-fg md:py-24" :class="full && 'min-h-dvh'">
    <div class="mx-auto max-w-140">
      <a :href="homeHref" aria-label="Home" class="inline-block">
        <svg viewBox="0 0 149 134" class="h-8 w-auto" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" :d="MARK" /></svg>
      </a>
      <h1 class="mt-12 type-heading-3">{{ title }}</h1>
      <p class="mt-4 type-ui text-fg-muted">We set it up with each company directly. Tell us about your team and we'll reply by email, or <a :href="demoHref" :class="link" class="text-fg">book a demo</a>.</p>

      <p v-if="state === 'loading'" class="ds-access-loading mt-8 type-ui text-fg-muted" role="status">Loading.</p>

      <section v-else-if="state === 'signed-out'" class="mt-8 border border-edge p-4 type-ui" data-state="signed-out">
        <p>Sign in with your work email first. We reply to that address, and it's the one your organization will use.</p>
        <div class="mt-6 flex flex-wrap items-center gap-4">
          <PixelButton :href="signInHref">Sign in</PixelButton>
          <a :href="`mailto:${supportEmail}`" class="type-meta" :class="link">or write to {{ supportEmail }}</a>
        </div>
      </section>

      <section v-else-if="state === 'failed'" class="mt-8" data-state="failed">
        <p class="bg-surface-danger px-3 py-2 type-ui" role="alert">Something went wrong. Try again.</p>
        <Button class="mt-4" @click="emit('retry')">Try again</Button>
      </section>

      <form v-else-if="state === 'form'" class="mt-8 flex flex-col gap-6 border border-edge p-4" data-state="form" @submit.prevent="emit('submit', { ...answers })">
        <div>
          <p class="type-meta text-fg-soft">Work email</p>
          <p class="mt-1.5 type-ui wrap-anywhere">{{ email }}</p>
          <p v-if="personalEmail" class="mt-2 type-meta text-fg-muted">This is a personal address. To ask for your company, <a :href="signInHref" class="text-fg" :class="link">sign in with your work email</a>.</p>
          <a v-else :href="signInHref" class="mt-2 inline-block type-meta" :class="link">Use a different email</a>
        </div>
        <Field v-slot="{ id }" label="Name">
          <Input :id="id" v-model="answers.name" autocomplete="name" maxlength="200" required />
        </Field>
        <Field v-slot="{ id }" label="Company">
          <Input :id="id" v-model="answers.company" autocomplete="organization" maxlength="200" required />
        </Field>
        <Field v-slot="{ id }" label="Team size">
          <NativeSelect :id="id" v-model="answers.teamSize" required>
            <option value="" disabled>Choose</option>
            <option v-for="size in teamSizes" :key="size" :value="size">{{ size }} people</option>
          </NativeSelect>
        </Field>
        <Field v-slot="{ id }" label="What you want to build">
          <Textarea :id="id" v-model="answers.useCase" maxlength="4000" placeholder="For example: support agents that answer from our help center and past tickets." required />
        </Field>
        <p v-if="error" class="bg-surface-danger px-3 py-2 type-ui" role="alert">{{ error }}</p>
        <div class="flex flex-wrap items-center gap-4">
          <PixelButton type="submit" :disabled="sending">{{ sending ? 'Sending' : 'Send request' }}</PixelButton>
          <p class="type-meta text-fg-muted">We use these answers only to reply to you. <a :href="privacyHref" class="text-fg" :class="link">Privacy policy</a>.</p>
        </div>
      </form>

      <section v-else-if="state === 'sent'" class="mt-8 border border-edge p-4 type-ui" data-state="sent" role="status">
        <h2 class="type-heading-4">We have your request.</h2>
        <p class="mt-2">We'll reply to <span class="wrap-anywhere">{{ email }}</span>.</p>
        <p class="mt-8 type-meta text-fg-muted">What happens next</p>
        <ol class="mt-4 flex flex-col gap-3">
          <li class="flex gap-4"><span class="text-fg-muted tabular-nums">1</span><span>We read your request and reply by email.</span></li>
          <li class="flex gap-4"><span class="text-fg-muted tabular-nums">2</span><span>If it fits, we create an organization for your company and invite you to it.</span></li>
          <li class="flex gap-4"><span class="text-fg-muted tabular-nums">3</span><span>Open the invite and sign in with this email. The dashboard opens on get started.</span></li>
        </ol>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <Button :href="homeHref">Back to the website</Button>
          <button type="button" class="cursor-pointer type-meta" :class="link" @click="emit('edit')">Change your answers</button>
        </div>
      </section>

      <p v-if="state === 'form' || state === 'signed-out'" class="mt-6 type-meta text-fg-muted">Is your team already on it? Ask one of its admins to invite you.</p>
    </div>
  </main>
</template>

<style>
/* "Loading." shows only when a load is slow, after 300ms. */
.ds-access-loading { animation: ds-access-appear var(--ds-duration-enter) var(--ds-easing-standard) 300ms both; }
@keyframes ds-access-appear { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-access-loading { animation-duration: 0ms; } }
</style>
