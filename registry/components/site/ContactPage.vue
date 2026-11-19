<script setup lang="ts">
import { ref } from 'vue'
import SectionHead from '@/components/site/SectionHead.vue'
import SitePage, { type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'
import Button from '@/components/ui/Button.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Textarea from '@/components/ui/Textarea.vue'

// Contact: the head, then the ways to reach the team on the left (each a label over its address, between hairlines)
// and the form on the right in the double rule (name, work email, company, message; the browser asks for the empty
// ones), its one dark button at the foot. It calls nothing: `submit` carries the answers, and `sent` (the app's)
// swaps the form for what happens next; `edit` asks for the form back. A failure from the server shows above the button.
export type ContactAnswers = { name: string, email: string, company: string, message: string }
defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  head: { tag?: string, title: string, body?: string }
  channels: { label: string, value: string, href: string }[]
  sent?: boolean
  sending?: boolean
  error?: string
}>()
const emit = defineEmits<{ submit: [answers: ContactAnswers], edit: [] }>()
const answers = ref<ContactAnswers>({ name: '', email: '', company: '', message: '' })
const link = 'underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-200 ease-standard hover:decoration-fg'
</script>

<template>
  <SitePage data-ds="contact-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <section aria-labelledby="contact-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40">
      <SectionHead as="h1" title-id="contact-page-title" :tag="head.tag" :title="head.title" :body="head.body" />
      <div class="mx-auto mt-14 grid max-w-[1008px] grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <dl class="flex flex-col self-start border-t border-edge">
          <div v-for="c in channels" :key="c.label" class="flex flex-col gap-1 border-b border-edge py-5">
            <dt class="type-meta text-fg-muted">{{ c.label }}</dt>
            <dd class="type-body-lg text-fg"><a :href="c.href" :class="link">{{ c.value }}</a></dd>
          </div>
        </dl>
        <div class="border border-edge p-5 outline outline-offset-4 outline-edge sm:p-6">
          <div v-if="sent" role="status" class="type-ui">
            <h2 class="type-heading-4">We have your message.</h2>
            <p class="mt-2 text-fg-muted">We reply by email, usually within a working day.</p>
            <Button class="mt-6" @click="emit('edit')">Send another</Button>
          </div>
          <form v-else class="flex flex-col gap-5" aria-label="Contact" @submit.prevent="emit('submit', { ...answers })">
            <div class="grid gap-5 sm:grid-cols-2">
              <Field v-slot="{ id }" label="Name">
                <Input :id="id" v-model="answers.name" autocomplete="name" maxlength="200" required />
              </Field>
              <Field v-slot="{ id }" label="Work email">
                <Input :id="id" v-model="answers.email" type="email" autocomplete="email" maxlength="200" required />
              </Field>
            </div>
            <Field v-slot="{ id }" label="Company">
              <Input :id="id" v-model="answers.company" autocomplete="organization" maxlength="200" />
            </Field>
            <Field v-slot="{ id }" label="Message">
              <Textarea :id="id" v-model="answers.message" :rows="5" maxlength="4000" placeholder="What you want to build, and what you need from us." required />
            </Field>
            <p v-if="error" class="bg-surface-danger px-3 py-2 type-ui" role="alert">{{ error }}</p>
            <div><PixelButton type="submit" :disabled="sending">{{ sending ? 'Sending' : 'Send message' }}</PixelButton></div>
          </form>
        </div>
      </div>
    </section>
  </SitePage>
</template>
