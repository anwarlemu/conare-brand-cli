<script setup lang="ts">
import { ref } from 'vue'
import AddDocuments from '@/components/product/AddDocuments.vue'
import { useToast } from '@/composables/useToast'
import Toaster from '@/components/ui/Toaster.vue'
// Adding to a sample "contracts" namespace. Nothing is sent: the write is played, then the notice says what landed.
const namespace = ref('contracts')
const writing = ref(false)
const notice = ref('')
const toast = useToast()
function write(ns: string, count: number) {
  notice.value = ''
  writing.value = true
  setTimeout(() => {
    writing.value = false
    notice.value = `Wrote ${count} ${count === 1 ? 'document' : 'documents'} to ${ns}.`
  }, 900)
}
</script>

<template>
  <div class="max-w-160">
    <AddDocuments
      v-model:namespace="namespace"
      :writing="writing"
      :notice="notice"
      @upload="(ns, files) => write(ns, files.length)"
      @paste="(ns) => write(ns, 1)"
      @connect="toast('Sources opens here')"
      @browse="(ns) => toast('Opens the namespace', ns)"
    />
    <Toaster />
  </div>
</template>
