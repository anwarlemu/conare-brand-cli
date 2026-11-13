'use client'
import { useState } from 'react'
import { AddData } from '@/react/components/product/AddData'
import { Toaster } from '@/react/components/ui/Toaster'
import { useToast } from '@/react/hooks/useToast'
// As Home shows it: in a card, without a close button. Nothing connects or uploads here: the sample plays the first
// API write once the prompt is copied, as the product would watch for it.
const apps = ['Google Drive', 'Slack', 'Notion', 'Gmail', 'HubSpot', 'Confluence', 'Dropbox', 'GitHub'].map(name => ({ type: name.toLowerCase().replace(/\s/g, '-'), name }))
const prompt = 'Send my documents to Conare. Write them in batches of up to 100 to POST https://api.conare.ai/v1/namespaces/api-documents/documents with the header "Authorization: Bearer $CONARE_API_KEY". Each document needs an id and its text. The first write creates the namespace api-documents. Tell me how many landed.'
const code = `curl https://api.conare.ai/v1/namespaces/api-documents/documents \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"documents": [{"id": "handbook", "text": "The text of your document."}]}'`

export default function Product() {
  const [waiting, setWaiting] = useState(false)
  const [landed, setLanded] = useState(false)
  const [connecting, setConnecting] = useState('')
  const [uploading, setUploading] = useState(0)
  const toast = useToast()
  function copied() {
    if (waiting) return
    setWaiting(true)
    setTimeout(() => setLanded(true), 2400)
  }
  function connect(app: { type: string, name: string }) {
    setConnecting(app.type)
    setTimeout(() => {
      setConnecting('')
      toast(`${app.name}'s sign-in opens here`)
    }, 900)
  }
  function files(list: File[]) {
    setUploading(list.length)
    setTimeout(() => {
      setUploading(0)
      toast(`Uploaded ${list.length === 1 ? '1 file' : `${list.length} files`}`)
    }, 1200)
  }
  return (
    <div className="max-w-190 border border-edge p-4">
      <AddData apps={apps} prompt={prompt} code={code} namespace="api-documents" waiting={waiting} landed={landed} connecting={connecting} uploading={uploading} onCopied={copied} onConnect={connect} onFiles={files} onOpen={ns => toast('Opens the namespace', ns)} />
      <Toaster />
    </div>
  )
}
