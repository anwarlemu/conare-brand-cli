import { ComparisonTable, type ComparisonRow } from '@/react/components/site/ComparisonTable'
// The comparison on sample data: three plans, words and marks.
const plans = [
  "Free",
  "Pro",
  "Enterprise"
]
const rows: ComparisonRow[] = [
  {
    "feature": "Searches a month",
    "values": [
      "1,000",
      "100,000",
      "Custom"
    ]
  },
  {
    "feature": "Files you bring",
    "values": [
      "100",
      "10,000",
      "Unlimited"
    ]
  },
  {
    "feature": "Sync with your apps",
    "values": [
      false,
      true,
      true
    ]
  },
  {
    "feature": "Answers with sources",
    "values": [
      true,
      true,
      true
    ]
  },
  {
    "feature": "Single sign-on",
    "values": [
      false,
      false,
      true
    ]
  },
  {
    "feature": "Support",
    "values": [
      "Community",
      "Email",
      "A named engineer"
    ]
  }
]
export default function Site() {
  return (
    <div className="-mx-8 pt-8">
      <ComparisonTable tag="Compare" title="What each plan includes." body="Every plan searches the same way. They differ in how much and who helps." plans={plans} rows={rows} />
    </div>
  )
}
