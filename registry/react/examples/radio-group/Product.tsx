'use client'
import { useState } from 'react'
import { RadioGroup } from '@/react/components/ui/RadioGroup'
// How a namespace reads new files: one of three, each with its line.

export default function Product() {
  const [mode, setMode] = useState<'fast' | 'balanced' | 'thorough'>('balanced')
  const [region, setRegion] = useState<'us' | 'eu'>('us')
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">Reading</p>
      <RadioGroup
        value={mode}
        onValueChange={setMode}
        label="reading"
        options={[
          { value: 'fast', label: 'Fast', hint: 'Text only. Fine for chat and notes.' },
          { value: 'balanced', label: 'Balanced', hint: 'Text and tables. The default.' },
          { value: 'thorough', label: 'Thorough', hint: 'Text, tables, figures and scans.' },
        ]}
      />
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">In a row</p>
      <RadioGroup value={region} onValueChange={setRegion} label="region" inline options={[{ value: 'us', label: 'United States' }, { value: 'eu', label: 'European Union' }]} />
    </div>
  )
}
