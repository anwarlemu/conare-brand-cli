<script setup lang="ts">
import { ref } from 'vue'
import Collapsible from '@/components/ui/Collapsible.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import Switch from '@/components/ui/Switch.vue'
// A new source's form with its advanced settings folded away: open them and the form below moves down to make room.
const name = ref('Acme drive')
const open = ref(false)
const ocr = ref(true)
const every = ref('60')
</script>

<template>
  <form class="flex max-w-100 flex-col gap-4" @submit.prevent>
    <Field v-slot="{ id }" label="Name">
      <Input :id="id" v-model="name" />
    </Field>
    <div class="border-y border-edge">
      <Collapsible v-model:open="open">
        <template #trigger>Advanced settings</template>
        <div class="flex flex-col gap-4 pt-1 pb-4">
          <Field v-slot="{ id, hintId }" label="Sync every" hint="In minutes, 15 at least.">
            <Input :id="id" v-model="every" inputmode="numeric" :aria-describedby="hintId" />
          </Field>
          <div class="flex items-center justify-between gap-4">
            <span class="type-meta text-fg-soft">Read text in scanned pages</span>
            <Switch v-model="ocr" label="read text in scanned pages" />
          </div>
        </div>
      </Collapsible>
    </div>
    <p class="type-meta text-fg-muted">Documents start syncing as soon as you connect.</p>
  </form>
</template>
