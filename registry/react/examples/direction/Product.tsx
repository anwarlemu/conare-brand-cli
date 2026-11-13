'use client'
import { useState } from 'react'
import { Direction } from '@/react/components/ui/Direction'
import { Tabs } from '@/react/components/ui/Tabs'
// One card in either direction: the label and value swap sides, the code stays left to right.
const options = [{ value: 'ltr', label: 'Left to right' }, { value: 'rtl', label: 'Right to left' }] as const

export default function Product() {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('rtl')
  return (
    <div className="flex flex-col gap-4">
      <Tabs value={dir} onValueChange={setDir} options={options} label="direction" />
      <Direction dir={dir}>
        <div className="flex max-w-md flex-col gap-3 border border-edge p-4">
          <div className="flex items-center justify-between gap-4 type-ui">
            <span className="text-fg-soft">مساحة الأسماء</span>
            <span className="type-code-sm">contracts</span>
          </div>
          <p className="border-s-2 border-edge-accent ps-3 type-meta text-fg-muted">يبحث Conare في المستندات ويعيد المقاطع التي تجيب عن السؤال.</p>
          <pre className="bg-code px-3 py-2 type-code-sm text-code-fg">curl https://api.acme.com/v1/search</pre>
        </div>
      </Direction>
    </div>
  )
}
