<script setup lang="ts">
import { ref } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import Button from '@/components/ui/Button.vue'
import Toaster from '@/components/ui/Toaster.vue'
import { useToast } from '@/composables/useToast'
// Deleting a whole namespace: too much to undo, so it asks first. Focus starts on Cancel; only a choice closes it.
const open = ref(false)
const toast = useToast()
</script>

<template>
  <div class="flex min-h-64 items-center justify-center">
    <Button variant="danger" @click="open = true"><Trash2 :size="12" :stroke-width="1.5" aria-hidden="true" />Delete namespace</Button>
    <AlertDialog
      v-model:open="open"
      title="Delete contracts?"
      description="Its 412,830 documents are deleted with it, and searches that name it stop working. This can't be undone."
      action="Delete namespace"
      @confirm="toast('Deleted', 'contracts')"
    />
    <Toaster />
  </div>
</template>
