<script setup lang="ts">
import { ref } from 'vue'
import SectionHead from '@/components/site/SectionHead.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import PixelButton from '@/components/ui/PixelButton.vue'

// A sign-up for news by email: the band's head, then one email field and the one dark button in the website's double
// rule. It calls nothing: `submit` carries the address, `sent` (the app's) swaps the form for the line the app gives,
// and a failure from the server shows under it. The site has no newsletter: set from the contact form's field, button
// and frame.
withDefaults(defineProps<{
  title: string, tag?: string, body?: string, label?: string, action?: string
  sent?: boolean, sentText?: string, sending?: boolean, error?: string, titleId?: string
}>(), { label: 'Work email', action: 'Subscribe', sentText: '', titleId: 'newsletter-title' })
const emit = defineEmits<{ submit: [email: string] }>()
const email = ref('')
</script>

<template>
  <section data-ds="newsletter" :aria-labelledby="titleId" class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
    <SectionHead :title="title" :tag="tag" :body="body" :title-id="titleId" />
    <div class="mx-auto mt-10 max-w-[560px] border border-edge p-5 outline outline-offset-4 outline-edge sm:p-6">
      <p v-if="sent" role="status" class="type-ui text-fg">{{ sentText }}</p>
      <form v-else class="flex flex-col gap-4 sm:flex-row sm:items-end" :aria-label="title" @submit.prevent="emit('submit', email)">
        <div class="min-w-0 flex-1">
          <Field v-slot="{ id }" :label="label">
            <Input :id="id" v-model="email" type="email" autocomplete="email" maxlength="200" required />
          </Field>
        </div>
        <div><PixelButton type="submit" :disabled="sending">{{ action }}</PixelButton></div>
      </form>
      <p v-if="error" class="mt-4 bg-surface-danger px-3 py-2 type-ui" role="alert">{{ error }}</p>
    </div>
  </section>
</template>
