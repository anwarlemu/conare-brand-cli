import { PricingTable } from '@/react/components/site/PricingTable'
// One group of prices: its case on the left, the cards beside it; the odd last card takes the row.
const cards = [
  {
    "name": "Connected apps",
    "amount": "$20",
    "unit": "per app a month",
    "line": "Each app you connect, synced as it changes.",
    "facts": [
      "Changes in minutes",
      "Deletes carried over"
    ]
  },
  {
    "name": "Parsing",
    "amount": "$3",
    "unit": "per 1,000 pages",
    "line": "Every page read in full, tables included.",
    "facts": [
      "Scanned and typed pages",
      "Tables kept as tables"
    ]
  },
  {
    "name": "Embeddings",
    "amount": "$0.02",
    "unit": "per 1M tokens",
    "line": "For any vector database you run.",
    "facts": []
  }
]
export default function Site() {
  return (
    <PricingTable
      titleId="pricing-sync"
      title="Sync"
      body="Keep your apps in a namespace, in step as they change."
      cards={cards}
    />
  )
}
