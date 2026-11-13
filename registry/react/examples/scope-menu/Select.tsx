import { Field } from '@/react/components/ui/Field'
import { Select } from '@/react/components/ui/Select'
// A select in a form: the field opens a listbox at least as wide as itself, the pick checked.
const regions = [
  { value: 'us-east', label: 'US East (Virginia)' },
  { value: 'us-west', label: 'US West (Oregon)' },
  { value: 'eu-central', label: 'EU Central (Frankfurt)' },
  { value: 'ap-south', label: 'Asia Pacific (Mumbai)', disabled: true },
]

export default function SelectExample() {
  return (
    <div className="h-72 w-full max-w-72">
      <Field label="Region" hint="Where your namespaces are stored.">
        {({ id }) => <Select id={id} defaultValue="us-east" options={regions} label="region" />}
      </Field>
    </div>
  )
}
