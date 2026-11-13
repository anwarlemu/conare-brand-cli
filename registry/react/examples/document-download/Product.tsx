'use client'
import { DownloadButton } from '@/react/components/product/DownloadButton'
import { DownloadMark } from '@/react/components/product/DownloadMark'
import { useDocumentDownload } from '@/react/hooks/useDocumentDownload'
// The two places a document downloads: the mark at the end of its row in a namespace, and the button under an opened
// document or a result. Sample text stands in for your API's bytes.

export default function Product() {
  const download = useDocumentDownload()
  const save = () => download('handbook-security', () => new Promise<string>(done => setTimeout(() => done('Acme security handbook.\n\nEvery laptop uses full-disk encryption.'), 400)), 'handbook-security.txt')
  return (
    <div className="flex flex-col gap-3">
      <p className="type-meta text-fg-muted">In a row</p>
      <div className="flex h-row max-w-120 items-center gap-3 border-y border-edge px-3">
        <span className="min-w-0 flex-1 truncate type-code-sm">handbook-security</span>
        <span className="type-meta text-fg-muted tabular-nums">12 KB</span>
        <DownloadMark id="handbook-security" onPress={save} />
      </div>
      <p className="type-meta text-fg-muted">As a button</p>
      <div className="flex items-center"><DownloadButton id="handbook-security" onPress={save} /></div>
    </div>
  )
}
