import { OverviewBand, type OverviewQuestion } from '@/react/components/product/OverviewBand'
// Three questions: what a buyer asks, each answered in a sentence.
const questions: OverviewQuestion[] = [
  { question: 'Is my data in and fresh?', answer: '2,749,690 documents, all synced but crm.', href: '#sources', red: true },
  { question: 'Is it answering well?', answer: '94.2% of searches got a strong answer.', href: '#performance' },
  { question: 'Is it fast and affordable?', answer: '312 ms for a typical search, $268 of credits left.', href: '#usage' },
]

export default function ThreeQuestions() {
  return <OverviewBand view="questions" questions={questions} />
}
