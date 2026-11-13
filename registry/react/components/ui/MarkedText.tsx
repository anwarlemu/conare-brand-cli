import { Fragment, type CSSProperties } from 'react'

// A passage with the query's words in medium weight and ink (Marked.vue, utils/marks.ts), so the reader sees why it
// matched. Words of three letters or fewer ("a", "the", "to") don't count. Never a fill or a colour for a match. Each
// word is its own span with its place in `--w`, so a reveal can play the passage in reading order.
export interface MarkedTextProps {
  text: string
  query: string
}

function marks(text: string, query: string): Array<{ text: string, hit: boolean }> {
  const words = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? [])]
  if (!words.length) return [{ text, hit: false }]
  const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'giu')
  return text.split(pattern).filter(Boolean).map(part => ({ text: part, hit: words.includes(part.toLowerCase()) }))
}

export function MarkedText({ text, query }: MarkedTextProps) {
  let w = 0
  const words = marks(text, query).flatMap(r => r.text.split(/(\s+)/).filter(Boolean).map(t => ({ text: t, hit: r.hit, w: /\s/.test(t) ? -1 : w++ })))
  return (
    <span data-ds="marked-text" className="ds-words">
      {words.map((t, i) => (
        <Fragment key={i}>
          {t.w < 0 ? t.text : t.hit
            ? <strong className="ds-word font-medium text-fg" style={{ '--w': t.w } as CSSProperties}>{t.text}</strong>
            : <span className="ds-word" style={{ '--w': t.w } as CSSProperties}>{t.text}</span>}
        </Fragment>
      ))}
    </span>
  )
}

export default MarkedText
