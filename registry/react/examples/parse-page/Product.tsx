'use client'
import { useEffect, useRef, useState } from 'react'
import { Activity, Atom, CreditCard, Gauge, House, KeyRound, Layers, Network, Settings, SquareTerminal } from 'lucide-react'
import { ConsoleFrame, type FrameGroup } from '@/react/components/product/ConsoleFrame'
import { ConsolePage } from '@/react/components/product/ConsolePage'
import { ParsePage } from '@/react/components/product/ParsePage'
import type { ParseAnswer, ParseBlock } from '@/react/hooks/useParse'
// Parse as it ships, in the console's frame: pick a file to try and the reading follows; your own file shows the
// sample's reading, and the page says so. Sample data for Acme; wire `onFile` to POST /parse in your app.

type Region = Omit<ParseBlock, 'content'> & { content?: string, head?: string[], rows?: string[][] }
const table = (head: string[], rows: string[][]) => [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map(r => `| ${r.join(' | ')} |`)].join('\n')

const STATEMENT = [
  ['Subscription revenue', '48,212', '39,870'], ['Services revenue', '9,644', '8,915'], ['Hardware revenue', '3,108', '3,402'],
  ['Interest and other income', '1,277', '864'], ['Total revenues', '62,241', '53,051'],
  ['Cost of subscription', '9,806', '8,722'], ['Cost of services', '6,931', '6,580'], ['Research and development', '14,402', '12,118'],
  ['Sales and marketing', '15,760', '14,204'], ['General and administrative', '5,318', '4,906'], ['Interest expense', '412', '455'],
  ['Total costs and expenses', '52,629', '46,985'], ['Net earnings', '9,612', '6,066'],
]
const INVOICE = [['Hosting, October', '1', '4,200.00'], ['Support plan', '1', '650.00'], ['Extra storage, 2 TB', '2', '180.00'], ['Total due', '', '5,210.00']]

const FILES: Record<string, { id: string, name: string, pages: number, page: number, ms: number, ocr: boolean, scan?: boolean, plain: string, blocks: Region[] }> = {
  statement: {
    id: 'prs_statement',
    name: 'Acme 2025 annual report.pdf',
    pages: 148,
    page: 72,
    ms: 2140,
    ocr: false,
    plain: 'ACME CORPORATION\nand Subsidiaries\nCONSOLIDATED STATEMENTS OF EARNINGS\n(dollars in thousands)\nYear Ended December 31,\n2025 2024\nSubscription revenue Services revenue Hardware revenue Interest and other income Total revenues\n$ 48,212 9,644 3,108 1,277 62,241 $ 39,870 8,915 3,402 864 53,051\nCost of subscription Cost of services Research and development Sales and marketing General and administrative Interest expense Total costs and expenses\n9,806 6,931 14,402 15,760 5,318 412 52,629 8,722 6,580 12,118 14,204 4,906 455 46,985\nNet earnings $ 9,612 $ 6,066\nSee accompanying notes to the consolidated financial statements\nK-72',
    blocks: [
      { type: 'header', bbox: [0.1, 0.05, 0.9, 0.09], order: 1, content: 'Acme Corporation and subsidiaries', conf: null },
      { type: 'title', bbox: [0.1, 0.1, 0.9, 0.17], order: 2, content: 'Consolidated statements of earnings', conf: null },
      { type: 'text', bbox: [0.1, 0.17, 0.9, 0.2], order: 3, content: '(dollars in thousands)', conf: null },
      { type: 'table', bbox: [0.1, 0.21, 0.9, 0.87], order: 4, conf: null, head: ['Year ended December 31', '2025', '2024'], rows: STATEMENT },
      { type: 'footnote', bbox: [0.1, 0.885, 0.9, 0.92], order: 5, content: 'See accompanying notes to the consolidated financial statements', conf: null },
      { type: 'footer', bbox: [0.42, 0.935, 0.58, 0.96], order: 6, content: 'K-72', conf: null },
    ],
  },
  scan: {
    id: 'prs_scan',
    name: 'Mutual NDA, scanned.tiff',
    pages: 4,
    page: 3,
    ms: 3820,
    ocr: true,
    scan: true,
    plain: '',
    blocks: [
      { type: 'header', bbox: [0.1, 0.05, 0.9, 0.085], order: 1, content: 'Mutual Non-Disclosure Agreement, page 3 of 4', conf: 0.97 },
      { type: 'title', bbox: [0.1, 0.1, 0.9, 0.145], order: 2, content: '5. Term and survival', conf: 0.99 },
      { type: 'text', bbox: [0.1, 0.155, 0.9, 0.325], order: 3, content: 'This Agreement begins on the Effective Date and continues for two (2) years. Either party may end it on thirty (30) days\' written notice. The obligations in Section 3 survive termination for three (3) years, and for trade secrets for as long as the information stays a trade secret.', conf: 0.96 },
      { type: 'title', bbox: [0.1, 0.345, 0.9, 0.39], order: 4, content: '6. Limit of liability', conf: 0.99 },
      { type: 'text', bbox: [0.1, 0.4, 0.9, 0.53], order: 5, content: 'Neither party is liable for indirect or consequential loss. Each party\'s total liability under this Agreement is capped at twelve (12) months of fees paid or payable. The cap does not apply to a breach of Section 3.', conf: 0.94 },
      { type: 'list', bbox: [0.1, 0.545, 0.9, 0.665], order: 6, content: '(a) Governing law: the State of New York.\n(b) Venue: the courts of New York County.\n(c) Notices: in writing, to the addresses on page 1.', conf: 0.92 },
      { type: 'image', bbox: [0.1, 0.71, 0.48, 0.83], order: 7, content: 'Signature: for Acme, 12 March 2026', conf: 0.61 },
      { type: 'image', bbox: [0.56, 0.7, 0.9, 0.82], order: 8, content: 'Stamp: Received, Legal, 14 Mar 2026', conf: 0.78 },
      { type: 'footer', bbox: [0.42, 0.93, 0.58, 0.955], order: 9, content: '3', conf: 0.99 },
    ],
  },
  invoice: {
    id: 'prs_invoice',
    name: 'Supplier invoice 2026-1043.pdf',
    pages: 1,
    page: 1,
    ms: 1680,
    ocr: true,
    plain: 'INVOICE 2026-1043\nBill to Acme Corporation, Accounts payable\nIssued 2 Oct 2026 Due 1 Nov 2026\nItem Qty Amount\nHosting, October Support plan Extra storage, 2 TB Total due\n1 1 2 4,200.00 650.00 180.00 5,210.00\nPay by bank transfer within 30 days.',
    blocks: [
      { type: 'header', bbox: [0.1, 0.05, 0.9, 0.095], order: 1, content: 'Invoice 2026-1043', conf: 0.99 },
      { type: 'title', bbox: [0.1, 0.115, 0.9, 0.165], order: 2, content: 'Invoice', conf: 0.99 },
      { type: 'list', bbox: [0.1, 0.175, 0.9, 0.285], order: 3, content: 'Bill to: Acme Corporation, accounts payable\nIssued: 2 Oct 2026\nDue: 1 Nov 2026', conf: 0.97 },
      { type: 'table', bbox: [0.1, 0.305, 0.9, 0.52], order: 4, conf: 0.95, head: ['Item', 'Qty', 'Amount'], rows: INVOICE },
      { type: 'footnote', bbox: [0.1, 0.54, 0.9, 0.58], order: 5, content: 'Pay by bank transfer within 30 days.', conf: 0.93 },
      { type: 'image', bbox: [0.56, 0.62, 0.9, 0.7], order: 6, content: 'Signature: accounts payable, approved', conf: 0.66 },
      { type: 'footer', bbox: [0.42, 0.935, 0.58, 0.96], order: 7, content: '1 of 1', conf: 0.99 },
    ],
  },
}

function markdownOf(blocks: ParseBlock[]) {
  return blocks.map((b) => {
    if (b.type === 'header') return `<!-- header: ${b.content} -->`
    if (b.type === 'footer') return `<!-- footer: ${b.content} -->`
    if (b.type === 'title') return `# ${b.content}`
    if (b.type === 'image') return `![${b.content}]`
    if (b.type === 'list') return b.content.split('\n').map(l => `- ${l}`).join('\n')
    if (b.type === 'footnote') return `_${b.content}_`
    return b.content
  }).join('\n\n')
}

/** One sample's reading: `statement`, `scan` or `invoice`. */
function parseSample(key: string, name?: string): ParseAnswer {
  const f = FILES[key] ?? FILES.statement!
  const blocks: ParseBlock[] = f.blocks.map(b => ({ type: b.type, bbox: b.bbox, order: b.order, conf: b.conf, content: b.rows ? table(b.head!, b.rows) : b.content ?? '' }))
  const confs = blocks.map(b => b.conf).filter((c): c is number => c != null)
  const markdown = markdownOf(blocks)
  return {
    id: f.id,
    name: name ?? f.name,
    page: f.page,
    pages: f.pages,
    took_ms: f.ms,
    scan: f.scan,
    markdown: '<!-- page ' + f.page + ' -->\n\n' + markdown,
    plain: f.plain,
    part: { page: f.page, markdown, ocr: f.ocr, confidence: confs.length ? Math.round((confs.reduce((a, c) => a + c, 0) / confs.length) * 100) / 100 : null, blocks },
  }
}

/** The files offered to try, as the page lists them. */
const PARSE_SAMPLES = [
  { id: 'statement', what: 'Income statement', line: 'Finance', pages: 148 },
  { id: 'scan', what: 'Scanned contract', line: 'Legal', pages: 4 },
  { id: 'invoice', what: 'Supplier invoice', line: 'Operations', pages: 1 },
]

/** The console's sidebar with one page current, for page compositions. */
function consoleGroups(current: string): FrameGroup[] {
  const at = (label: string, icon: FrameGroup['links'][number]['icon'], extra: Partial<FrameGroup['links'][number]> = {}) => ({ label, icon, active: label === current, ...extra })
  return [
    { label: 'Platform', links: [at('Overview', House), at('Namespaces', Layers, { status: '11' }), at('Sources', Network, { status: '1 failed', alert: true }), at('Agents', SquareTerminal), at('Custom models', Atom)] },
    { label: 'Manage', links: [at('API keys', KeyRound, { status: '4' }), at('Performance', Gauge), at('Usage', Activity), at('Billing', CreditCard), at('Settings', Settings)] },
  ]
}


const curl = `curl -X POST "https://api.conare.ai/v1/parse?layout=true" \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -H "Content-Type: application/octet-stream" \\
  --data-binary @"Acme 2025 annual report.pdf"`

export default function Product() {
  const [chosen, setChosen] = useState('statement')
  const [answer, setAnswer] = useState<ParseAnswer | null>(() => parseSample('statement'))
  const [reading, setReading] = useState(false)
  const [own, setOwn] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  function read(sample: string, name?: string) {
    setReading(true)
    clearTimeout(timer.current)
    // ds-latency: a sample read's length, standing in for the API's.
    timer.current = setTimeout(() => {
      setAnswer(parseSample(sample, name))
      setReading(false)
    }, 600)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  function choose(id: string) {
    setChosen(id)
    read(id)
  }
  function file(f: File) {
    setOwn(f.name)
    read('statement', f.name)
  }
  return (
    <ConsoleFrame groups={consoleGroups('')} crumbs={[{ label: 'Overview', href: '#' }, { label: 'Parse' }]}>
      <ConsolePage title="Parse">
        <ParsePage chosen={chosen} onChosenChange={choose} samples={PARSE_SAMPLES} answer={answer} reading={reading} namespaces={[{ name: 'sec-filings', documents: 2184920 }, { name: 'contracts', documents: 412830 }, { name: 'support', documents: 18240 }]} curl={curl} own={own} onFile={file} />
      </ConsolePage>
    </ConsoleFrame>
  )
}
