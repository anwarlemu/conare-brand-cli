'use client'
import { useEffect, useRef, useState } from 'react'
import { Activity, Atom, CreditCard, Gauge, House, KeyRound, Layers, Network, Settings, SquareTerminal } from 'lucide-react'
import { AccuracyPanel } from '@/react/components/product/AccuracyPanel'
import type { AccuracyHit, AccuracyRow, AccuracyView } from '@/react/components/product/AccuracyDetail'
import { ConsoleFrame, type FrameGroup } from '@/react/components/product/ConsoleFrame'
import { ConsolePage } from '@/react/components/product/ConsolePage'
// Accuracy views, Question sheet: the questions are the page, a sheet that fills in as the run lands.
// Sample data; wire the events to your own test.

// Sample data for the accuracy examples: Acme's own test, a hundred questions run through Conare and through the search
// the team uses today. Every name and number is made up.
const hit = (id: string, number: number, count: number, text: string, key: string, ok: boolean): AccuracyHit => ({ id, number, count, top: 0.2 + ((number * 7) % 50) / 100, text, key, ok })

const WRITTEN: AccuracyRow[] = [
  { id: 'q1', question: 'Does the Acme reseller agreement cap liability?', namespace: 'contracts', conare: hit('acme-reseller-agreement', 14, 31, 'Yes: liability is capped at 12 months of revenue share.', 'capped at 12 months of revenue share', true), current: hit('reseller-terms-2023', 3, 9, 'No monetary cap on liability.', 'No monetary cap', false) },
  { id: 'q2', question: 'How long is the breach notification window in the data processing addendum?', namespace: 'contracts', conare: hit('dpa-amendment-2', 2, 4, 'Breach notification is reduced to 48 hours from the 72 hours in the original addendum.', '48 hours', true), current: hit('dpa-2024', 4, 12, 'The processor notifies the controller within 72 hours of a personal data breach.', '72 hours', false) },
  { id: 'q3', question: 'What cash did we hold on 30 June?', namespace: 'sec-filings', conare: hit('10-q-q2-2026-liquidity', 31, 68, 'Cash, cash equivalents and marketable securities were $412.6 million as of June 30.', '$412.6 million', true), current: hit('10-k-2025-liquidity', 44, 142, 'Cash, cash equivalents and marketable securities were $388.1 million as of December 31.', '$388.1 million', false) },
  { id: 'q4', question: 'What is the notice to end the hosting MSA for convenience?', namespace: 'contracts', conare: hit('msa-hosting-2025', 7, 22, 'Either party may terminate for convenience with 90 days\' written notice.', '90 days\' written notice', true), current: hit('nda-mutual-template', 2, 5, 'Obligations survive termination for three years.', 'three years', false) },
  { id: 'q5', question: 'Which section of the hosting MSA caps fees on renewal?', namespace: 'contracts', conare: hit('msa-hosting-2025', 11, 22, 'On renewal, fees may rise by no more than 5% a year.', 'no more than 5%', true), current: hit('order-form-hosting', 1, 3, 'Fees are set out in the order form.', 'order form', false) },
  { id: 'q6', question: 'What did the 8-K say about the analytics acquisition price?', namespace: 'sec-filings', conare: hit('8-k-2026-03-acquisition', 2, 9, 'On March 4 Acme completed the acquisition of an analytics company for $96 million in cash and stock.', '$96 million', true), current: hit('board-2026-q2', 3, 8, 'Approved the analytics acquisition at up to $100 million.', 'up to $100 million', false) },
  { id: 'q7', question: 'What is the refund rule for EU customers?', namespace: 'support', conare: hit('ticket-48211', 1, 2, 'Refunds are available within 30 days of purchase; after that, unused months convert to account credit.', 'within 30 days', false), current: hit('ticket-48211', 1, 2, 'Refunds are available within 30 days of purchase; after that, unused months convert to account credit.', 'within 30 days', false), fix: { why: 'The EU refund policy isn\'t in support.', action: 'Add documents' } },
  { id: 'q8', question: 'What did the board approve about the Lisbon office in Q3?', namespace: 'board-minutes', conare: hit('board-2026-q2', 3, 8, 'Q2 board meeting: approved the analytics acquisition at up to $100 million.', 'Q2 board meeting', false), current: hit('board-2026-q2', 3, 8, 'Q2 board meeting: approved the analytics acquisition at up to $100 million.', 'Q2 board meeting', false), fix: { why: 'The Q3 minutes aren\'t in board-minutes yet.', action: 'Add documents' } },
  { id: 'q9', question: 'Who owns the CRM record for the finance team expansion?', namespace: 'crm', conare: hit('deal-renewal-300-seats', 1, 1, 'Renewal: 300 seats, $412k ARR. Champion: the finance lead.', 'the finance lead', false), current: hit('deal-finance-expansion', 1, 1, 'Expansion: 120 more seats for the finance team. Owner: account team west.', 'Owner: account team west', true), fix: { why: 'The CRM stopped syncing, so crm is two days behind.', action: 'Reconnect the CRM' } },
  { id: 'q10', question: 'Which clause sets the sub-processor notice in the addendum?', namespace: 'contracts', conare: hit('dpa-2024', 6, 12, 'Sub-processors require 30 days\' notice and a right to object.', '30 days\' notice', true), current: hit('dpa-2024', 6, 12, 'Sub-processors require 30 days\' notice and a right to object.', '30 days\' notice', true) },
  { id: 'q11', question: 'What is the renewal option on the San Francisco lease?', namespace: 'contracts', conare: hit('lease-amendment-sf', 2, 6, 'The renewal option extends the term by 36 months at 95% of fair market rent.', '36 months at 95%', true), current: hit('lease-amendment-sf', 2, 6, 'The renewal option extends the term by 36 months at 95% of fair market rent.', '36 months at 95%', true) },
  { id: 'q12', question: 'How long do NDA obligations last after termination?', namespace: 'contracts', conare: hit('nda-mutual-template', 2, 5, 'Obligations survive termination for three years.', 'three years', true), current: hit('nda-mutual-template', 2, 5, 'Obligations survive termination for three years.', 'three years', true) },
  { id: 'q13', question: 'Which customers are named as a revenue risk in the 10-K?', namespace: 'sec-filings', conare: hit('10-k-2025-item-1a', 19, 142, 'Our revenue depends on a limited number of enterprise customers.', 'limited number of enterprise customers', true), current: hit('10-k-2025-item-1a', 19, 142, 'Our revenue depends on a limited number of enterprise customers.', 'limited number of enterprise customers', true) },
  { id: 'q14', question: 'When do renewal conversations start?', namespace: 'wiki', conare: hit('playbook-renewals', 1, 3, 'Start the renewal conversation 120 days before the contract end date.', '120 days', true), current: hit('playbook-renewals', 1, 3, 'Start the renewal conversation 120 days before the contract end date.', '120 days', true) },
  { id: 'q15', question: 'How long are support tickets kept?', namespace: 'wiki', conare: hit('handbook-retention', 4, 11, 'Support tickets are kept for 3 years, then deleted.', '3 years', true), current: hit('handbook-retention', 4, 11, 'Support tickets are kept for 3 years, then deleted.', '3 years', true) },
  { id: 'q16', question: 'What is the rate limit on the public search endpoint?', namespace: 'engineering', conare: hit('acme-api-2214', 1, 2, '600 requests per minute per key; 429 with a Retry-After header beyond it.', '600 requests per minute', true), current: hit('acme-api-2214', 1, 2, '600 requests per minute per key; 429 with a Retry-After header beyond it.', '600 requests per minute', true) },
]

// The rest of the hundred: the same questions over more of Acme's vendor contracts.
const VENDORS = ['cloud hosting', 'payroll', 'analytics', 'security audit', 'office lease', 'logistics', 'translation', 'catering', 'legal research', 'design', 'data labeling', 'travel', 'insurance', 'recruiting', 'printing', 'telephony', 'facilities', 'events', 'training', 'backup']
const ASKS: Array<[string, string, string]> = [
  ['What is the notice period in the {v} MSA?', 'Either party may end this agreement on 60 days\' written notice.', '60 days\' written notice'],
  ['Does the {v} agreement cap liability?', 'Total liability is capped at the fees paid in the previous 12 months.', 'capped at the fees paid'],
  ['Which law governs the {v} contract?', 'This agreement is governed by the laws of the State of New York.', 'laws of the State of New York'],
  ['When does the {v} contract renew?', 'The term renews for one year unless either party gives 90 days\' notice.', 'renews for one year'],
]
const ONLY_CONARE = new Set([3, 11, 17, 22, 29, 34, 41, 47, 52, 58, 63, 69, 74, 80])
const generated: AccuracyRow[] = Array.from({ length: 100 - WRITTEN.length }, (_, i) => {
  const v = VENDORS[i % VENDORS.length]!
  const [q, text, key] = ASKS[i % ASKS.length]!
  const id = `msa-${v.replace(/ /g, '-')}-2024`
  const page = 3 + ((i * 5) % 19)
  const other = `msa-${VENDORS[(i + 3) % VENDORS.length]!.replace(/ /g, '-')}-2024`
  return { id: "g" + i, question: q.replace('{v}', v), namespace: 'contracts', conare: hit(id, page, 24, text, key, true), current: ONLY_CONARE.has(i) ? hit(other, page, 24, text, key, false) : hit(id, page, 24, text, key, true) }
})

const ACCURACY_ROWS: AccuracyRow[] = [...WRITTEN, ...generated]

/** A finished run over `rows`, as the page reads it. */
function accuracyView(rows: AccuracyRow[] = ACCURACY_ROWS): AccuracyView {
  return {
    state: 'done',
    ran: '3 hours ago',
    by: 'admin@acme.com',
    seconds: 12.4,
    cost: Math.round(rows.length * 0.003 * 100) / 100,
    questions: rows.length,
    done: rows.length,
    right: rows.filter(r => r.conare.ok).length,
    current_right: rows.filter(r => r.current.ok).length,
    current_name: 'Your current search',
    rows,
    queued: [],
  }
}

/** What Acme's agents ask most, offered when adding questions. */
const ASKED = ['What is the refund rule for annual plans?', 'When does the hosting MSA notice window open?', 'What did the finance team ask for on the September call?', 'Which vendors need a signed DPA?', 'What is the support SLA in Lisbon?']

/** The console's sidebar with one page current, for page compositions. */
function consoleGroups(current: string): FrameGroup[] {
  const at = (label: string, icon: FrameGroup['links'][number]['icon'], extra: Partial<FrameGroup['links'][number]> = {}) => ({ label, icon, active: label === current, ...extra })
  return [
    { label: 'Platform', links: [at('Overview', House), at('Namespaces', Layers, { status: '11' }), at('Sources', Network, { status: '1 failed', alert: true }), at('Agents', SquareTerminal), at('Custom models', Atom)] },
    { label: 'Manage', links: [at('API keys', KeyRound, { status: '4' }), at('Performance', Gauge), at('Usage', Activity), at('Billing', CreditCard), at('Settings', Settings)] },
  ]
}

/** The test as an app would hold it: removing a question, adding some (answered on the next run) and running again. */
function useSampleTest() {
  const [rows, setRows] = useState<AccuracyRow[]>(() => [...ACCURACY_ROWS])
  const [running, setRunning] = useState(false)
  const view: AccuracyView = { ...accuracyView(rows), state: running ? 'running' : 'done', ran: running ? 'now' : '3 hours ago' }
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  function run() {
    setRunning(true)
    clearTimeout(timer.current)
    // ds-latency: a sample run's length, standing in for the real one.
    timer.current = setTimeout(() => setRunning(false), 1200)
  }
  function add(questions: string[]) {
    setRows(rs => [...questions.map((q, i) => ({ id: "own" + Date.now() + i, question: q, namespace: 'contracts', conare: hit('msa-hosting-2025', 7, 22, 'Either party may terminate for convenience with 90 days\' written notice.', '90 days\' written notice', true), current: hit('nda-mutual-template', 2, 5, 'Obligations survive termination for three years.', 'three years', i % 2 === 0) })), ...rs])
  }
  function remove(row: AccuracyRow) { setRows(rs => rs.filter(r => r.id !== row.id)) }
  useEffect(() => () => clearTimeout(timer.current), [])
  return { view, run, add, remove }
}

export default function QuestionSheet() {
  const { view, run, add, remove } = useSampleTest()
  return (
    <ConsoleFrame groups={consoleGroups('Performance')} crumbs={[{ label: 'Overview', href: '#' }, { label: 'Performance' }]}>
      <ConsolePage title="Performance">
        <AccuracyPanel view={view} version={3} link="https://console.acme.com/performance?view=accuracy" asked={ASKED} onRun={run} onAdd={add} onRemove={remove} />
      </ConsolePage>
    </ConsoleFrame>
  )
}
