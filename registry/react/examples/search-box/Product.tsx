'use client'
import { useEffect, useRef, useState } from 'react'
import { ScopeMenu } from '@/react/components/product/ScopeMenu'
import { SearchBox, type Attachment } from '@/react/components/product/SearchBox'
// The search box as Explorer has it: the question, the files attached, the plus for more data, the scope, the Enter cue
// and the arrow, red once there is a question. Files stay here: each shows adding, then added. The scope is the
// console's scope menu, in the box's `scope` slot.
const namespaces = [
  { name: 'contracts', documents: 412830 },
  { name: 'slack', documents: 96410 },
  { name: 'crm', documents: 52660 },
]

export default function Product() {
  const [text, setText] = useState('notice period to terminate a contract')
  const [scope, setScope] = useState('')
  const [attached, setAttached] = useState<Attachment[]>([{ key: 'msa', name: 'acme-msa.pdf', state: 'added' }])
  const [busy, setBusy] = useState(false)
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  function attach(names: string[]) {
    for (const name of names) {
      const key = `${name}-${Date.now()}`
      setAttached(list => [...list, { key, name, state: 'adding' }])
      timers.current.push(setTimeout(() => setAttached(list => list.map(a => (a.key === key ? { ...a, state: 'added' } : a))), 900))
    }
  }
  function search() {
    setBusy(true)
    timers.current.push(setTimeout(() => setBusy(false), 1200))
  }
  return (
    <div className="h-90 w-full">
      <SearchBox
        value={text}
        onValueChange={setText}
        attached={attached}
        target={scope || 'uploads'}
        busy={busy}
        onSubmit={search}
        onFiles={files => attach(files.map(f => f.name))}
        onPaste={t => attach([`${t.split(/\s+/).slice(0, 6).join(' ').slice(0, 60)}.txt`])}
        onRemove={key => setAttached(list => list.filter(a => a.key !== key))}
        scope={<ScopeMenu value={scope} onValueChange={setScope} options={namespaces} ownMark="/conare-ds/logo/svg/mark.svg" />}
      />
    </div>
  )
}
