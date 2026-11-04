<script setup lang="ts">
import { ref } from 'vue'
import { SlidersHorizontal } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import Popover from '@/components/ui/Popover.vue'
import Switch from '@/components/ui/Switch.vue'
// A search's settings in a popover: how many results, and whether to rerank. Focus moves into the panel as it opens;
// Escape closes it and returns to the button.
const topK = ref('5')
const rerank = ref(true)
</script>

<template>
  <div class="flex min-h-72 items-start justify-center">
    <Popover label="search settings" align="end">
      <template #trigger><SlidersHorizontal :size="12" :stroke-width="1.5" aria-hidden="true" />Settings</template>
      <template #default="{ close }">
        <form class="flex flex-col gap-4" @submit.prevent="close()">
          <p class="type-ui-strong">Search settings</p>
          <Field v-slot="{ id }" label="Results" hint="Between 1 and 50.">
            <Input :id="id" v-model="topK" inputmode="numeric" />
          </Field>
          <div class="flex items-center justify-between gap-4">
            <span class="type-meta text-fg-soft">Rerank results</span>
            <Switch v-model="rerank" label="rerank results" />
          </div>
          <div class="flex justify-end"><Button variant="dark" type="submit">Save</Button></div>
        </form>
      </template>
    </Popover>
  </div>
</template>
