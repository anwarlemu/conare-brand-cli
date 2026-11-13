'use client'
import { useRef } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Toaster } from '@/react/components/ui/Toaster'
import { useToast } from '@/react/hooks/useToast'
// Press the button: a note comes up in the corner. Press it quickly and three show at most.

export default function Product() {
  const toast = useToast()
  const count = useRef(0)
  function send() {
    count.current += 1
    toast('Deleted', `northwind-msa-${count.current}.pdf`)
  }
  return (
    <div className="min-h-50">
      <Button onClick={send}>Delete a document</Button>
      <Toaster />
    </div>
  )
}
