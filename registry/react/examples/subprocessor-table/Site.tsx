import { SubprocessorTable } from '@/react/components/site/SubprocessorTable'
// The subprocessors page's table, on sample vendors.
const rows = [
  { name: 'Acme Cloud', terms: '#acme-cloud', purpose: 'Compute, storage and AI inference', data: 'Customer data', location: 'United States' },
  { name: 'Acme Connectors', terms: '#acme-connectors', purpose: 'Data connectors', data: 'Data from apps the customer connects, and their credentials', location: 'United States' },
  { name: 'Acme Mail', terms: '#acme-mail', purpose: 'Transactional email', data: 'Names and email addresses', location: 'United States; European Union' },
  { name: 'Acme Billing', terms: '#acme-billing', purpose: 'Payments and invoices', data: 'Billing contacts and payment details', location: 'United States' },
]

export default function Site() {
  return <SubprocessorTable rows={rows} />
}
