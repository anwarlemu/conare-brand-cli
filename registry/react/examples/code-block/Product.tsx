import { CodeBlock } from '@/react/components/ui/CodeBlock'
// The same window as on the site, a pill per language.
const samples = [
  { label: 'cURL', code: `curl https://api.conare.ai/v1/search \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -d '{ "namespace": "contracts", "query": "notice period" }'` },
  { label: 'Python', code: `from conare import Conare

client = Conare()
hits = client.search(namespace="contracts", query="notice period")` },
  { label: 'TypeScript', code: `import Conare from "conare"

const client = new Conare()
const hits = await client.search({ namespace: "contracts", query: "notice period" })` },
]

export default function Product() {
  return <CodeBlock samples={samples} label="search request" />
}
