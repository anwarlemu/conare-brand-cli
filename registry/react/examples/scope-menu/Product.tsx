import { ScopeMenu } from '@/react/components/product/ScopeMenu'
// Every namespace or one, each with its size; the filter appears past six. Namespaces written by API carry the brand
// mark. Sample data.
const options = [
  { name: 'sec-filings', documents: 2184920 },
  { name: 'contracts', documents: 412830 },
  { name: 'slack', documents: 96410 },
  { name: 'crm', documents: 52660 },
  { name: 'engineering', documents: 31902 },
  { name: 'support', documents: 18240 },
  { name: 'wiki', documents: 7385 },
]

export default function Product() {
  return (
    <div className="flex h-100 items-start justify-center pt-4">
      <ScopeMenu defaultValue="" options={options} ownMark="/conare-ds/logo/svg/mark.svg" />
    </div>
  )
}
