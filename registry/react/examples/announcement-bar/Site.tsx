import { AnnouncementBar } from '@/react/components/site/AnnouncementBar'
// One line above the header: the whole ribbon is the link.

export default function Site() {
  return <AnnouncementBar tag="New" text="Accuracy you can check: every benchmark, losses included." cta="See the evals" href="#evals" />
}
