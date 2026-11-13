'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AlertDialog } from '@/react/components/ui/AlertDialog'
import { Button } from '@/react/components/ui/Button'
import { Toaster } from '@/react/components/ui/Toaster'
import { useToast } from '@/react/hooks/useToast'
// Deleting a whole namespace: too much to undo, so it asks first. Focus starts on Cancel; only a choice closes it.

export default function Product() {
  const [open, setOpen] = useState(false)
  const toast = useToast()
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Button variant="danger" onClick={() => setOpen(true)}><Trash2 size={12} strokeWidth={1.5} aria-hidden="true" />Delete namespace</Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete contracts?"
        description="Its 412,830 documents are deleted with it, and searches that name it stop working. This can't be undone."
        action="Delete namespace"
        onConfirm={() => toast('Deleted', 'contracts')}
      />
      <Toaster />
    </div>
  )
}
