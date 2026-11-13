import { Combobox } from '@/react/components/ui/Combobox'
import { Field } from '@/react/components/ui/Field'
// Any list with a filter: type to narrow it, arrows to move, Enter to pick.
const models = ['conare-embed-1', 'conare-embed-1-small', 'conare-rerank-1', 'conare-rerank-1-fast', 'conare-parse-1', 'acme-custom-embed', 'acme-custom-rerank', 'acme-legal-embed'].map(m => ({ value: m, label: m }))

export default function ComboboxExample() {
  return (
    <div className="h-96 w-full max-w-72">
      <Field label="Model">
        {({ id }) => <Combobox id={id} defaultValue="" options={models} label="model" placeholder="Choose a model" filterLabel="Filter models" width="288px" />}
      </Field>
    </div>
  )
}
