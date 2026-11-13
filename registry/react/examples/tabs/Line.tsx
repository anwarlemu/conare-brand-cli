import { LineTabs } from '@/react/components/ui/LineTabs'
// Line tabs for a page's sections, as a namespace has them.

export default function Line() {
  return <LineTabs defaultValue="Documents" options={['Documents', 'Settings']} label="namespace" />
}
