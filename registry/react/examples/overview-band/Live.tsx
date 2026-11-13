import { OverviewBand } from '@/react/components/product/OverviewBand'
// Live: the website's dark panel, the last searches landing one at a time, once, and holding.
const live = {
  value: '2,749,690',
  line: 'documents, searched 1,284 times today in 312 ms.',
  link: 'Open searches',
  href: '#searches',
  searches: [
    { id: 's1', question: 'Which contracts renew this quarter?', agent: 'Support agent', took_ms: 298, outcome: 'strong' },
    { id: 's2', question: 'What did legal say about EU data residency?', agent: 'Claude Code', took_ms: 341, outcome: 'strong' },
    { id: 's3', question: 'Open tickets about the Acme export', agent: 'Support agent', took_ms: 287, outcome: 'weak' },
    { id: 's4', question: 'Notice period in the Acme MSA', agent: 'Codex', took_ms: 1210, outcome: 'strong' },
    { id: 's5', question: 'Who owns the renewal for Acme Logistics?', agent: 'Sales agent', took_ms: 302, outcome: 'strong' },
    { id: 's6', question: 'Refund policy for annual plans', agent: 'Support agent', took_ms: 276, outcome: 'strong' },
  ],
}

export default function Live() {
  return <OverviewBand view="live" live={live} />
}
