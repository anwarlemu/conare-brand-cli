<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Toaster from '@/components/ui/Toaster.vue'
import { useToast } from '@/composables/useToast'
// Press the button: a note comes up in the corner. Press it quickly and three show at most.
const toast = useToast()
let count = 0
function send() {
  count += 1
  toast('Deleted', `northwind-msa-${count}.pdf`)
}
</script>

<template>
  <div class="min-h-50">
    <Button @click="send">Delete a document</Button>
    <Toaster />
  </div>
</template>
