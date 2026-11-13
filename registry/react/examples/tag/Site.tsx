import { SiteTag } from '@/react/components/ui/SiteTag'
// The website's tag: 10px capitals on the red, or framed.

export default function Site() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <SiteTag>New</SiteTag>
      <SiteTag framed>SOC 2 Type I</SiteTag>
      <SiteTag>Parse</SiteTag>
    </div>
  )
}
