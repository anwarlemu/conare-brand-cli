<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
// The new-organization dialog, opened as the frame loads; close it and the button opens it again. Opening with the
// page, focus rests on the window itself, so nothing shows selected until someone reaches for it.
const open = ref(false)
onMounted(async () => {
  open.value = true
  await nextTick()
  await nextTick()
  document.querySelector<HTMLElement>('dialog[open]')?.focus()
})
</script>

<template>
  <div class="min-h-105">
    <Button @click="open = true">New organization</Button>
    <Dialog v-model:open="open" title="New organization">
      <form class="flex flex-col gap-4" @submit.prevent="open = false">
        <Field v-slot="{ id }" label="Name">
          <Input :id="id" placeholder="Legal team" />
        </Field>
        <div class="flex justify-end gap-2">
          <Button @click="open = false">Cancel</Button>
          <Button variant="dark" type="submit">Create</Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
