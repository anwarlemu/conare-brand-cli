'use client'
import { useState } from 'react'
import { AddDocuments } from '@/react/components/product/AddDocuments'
import { Toaster } from '@/react/components/ui/Toaster'
import { useToast } from '@/react/hooks/useToast'
// Adding to a sample "contracts" namespace. Nothing is sent: the write is played, then the notice says what landed.

export default function Product() {
  const [namespace, setNamespace] = useState('contracts')
  const [writing, setWriting] = useState(false)
  const [notice, setNotice] = useState('')
  const toast = useToast()
  function write(ns: string, count: number) {
    setNotice('')
    setWriting(true)
    setTimeout(() => {
      setWriting(false)
      setNotice(`Wrote ${count} ${count === 1 ? 'document' : 'documents'} to ${ns}.`)
    }, 900)
  }
  return (
    <div className="max-w-160">
      <AddDocuments
        namespace={namespace}
        onNamespaceChange={setNamespace}
        writing={writing}
        notice={notice}
        onUpload={(ns, files) => write(ns, files.length)}
        onPaste={ns => write(ns, 1)}
        onConnect={() => toast('Sources opens here')}
        onBrowse={ns => toast('Opens the namespace', ns)}
      />
      <Toaster />
    </div>
  )
}
