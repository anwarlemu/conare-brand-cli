<script setup lang="ts">
import { ref } from 'vue'
import AddData from '@/components/product/AddData.vue'
import Toaster from '@/components/ui/Toaster.vue'
import { useToast } from '@/composables/useToast'
// As Home shows it: in a card, without a close button. Nothing connects or uploads here: the sample plays the first
// API write once the prompt is copied, as the product would watch for it.
const apps = ['Google Drive', 'Slack', 'Notion', 'Gmail', 'HubSpot', 'Confluence', 'Dropbox', 'GitHub'].map(name => ({ type: name.toLowerCase().replace(/\s/g, '-'), name }))
const prompt = 'Send my documents to Conare. Write them in batches of up to 100 to POST https://api.conare.ai/v1/namespaces/api-documents/documents with the header "Authorization: Bearer $CONARE_API_KEY". Each document needs an id and its text. The first write creates the namespace api-documents. Tell me how many landed.'
const code = `curl https://api.conare.ai/v1/namespaces/api-documents/documents \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"documents": [{"id": "handbook", "text": "The text of your document."}]}'`
const waiting = ref(false)
const landed = ref(false)
const connecting = ref('')
const uploading = ref(0)
const toast = useToast()
function copied() {
  if (waiting.value) return
  waiting.value = true
  setTimeout(() => { landed.value = true }, 2400)
}
function connect(app: { type: string, name: string }) {
  connecting.value = app.type
  setTimeout(() => {
    connecting.value = ''
    toast(`${app.name}'s sign-in opens here`)
  }, 900)
}
function files(list: File[]) {
  uploading.value = list.length
  setTimeout(() => {
    uploading.value = 0
    toast(`Uploaded ${list.length === 1 ? '1 file' : `${list.length} files`}`)
  }, 1200)
}
</script>

<template>
  <div class="max-w-190 border border-edge p-4">
    <AddData :apps="apps" :prompt="prompt" :code="code" namespace="api-documents" :waiting="waiting" :landed="landed" :connecting="connecting" :uploading="uploading" @copied="copied" @connect="connect" @files="files" @open="(ns) => toast('Opens the namespace', ns)" />
    <Toaster />
  </div>
</template>
