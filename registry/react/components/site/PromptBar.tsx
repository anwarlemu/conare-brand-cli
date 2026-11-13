'use client'
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { cn } from '@/react/lib/cn'

// The website's floating prompt bar (PromptBar.vue, home.css .prompt-*): warm dark glass pinned bottom centre that
// types its phrases in and out, widens from 280 to 480px in use, and lights the send button once there is text.
// Focusing it raises the templates; picking one fills the input, opens its `href`, or, when it has an `answer`, asks it:
// the bar grows upward into a thread, the question on the right and the answer on the left, word by word, with a link
// to `more`. A question it has no answer for gets `words.fallback`, linking to `href`. Clear or Escape folds the
// thread away. It waits below the screen until the page scrolls up and goes back down while the page scrolls down;
// `docked` shows it from the start. `shortcuts` shows the key and focuses it with Cmd+K or Cmd+I. `voice` adds a mic
// that dictates with the browser's own speech recognition, only where the browser has it. Nothing is sent anywhere:
// `onAsk` is called with each question, and links open in a new tab.
type Pattern = 'dots' | 'hatch' | 'checker' | 'ruling' | 'columns' | 'grid'
export type PromptTemplate = { label: string, icon: 'phone' | 'mail' | Pattern, answer?: string, more?: string, href?: string }
export type PromptWords = { ask: string, readMore: string, clear: string, close: string, fallback: string, fallbackLink: string }

export interface PromptBarProps {
  phrases?: string[]
  templates?: PromptTemplate[]
  href?: string
  label?: string
  docked?: boolean
  voice?: boolean
  shortcuts?: boolean
  words?: PromptWords
  onAsk?: (question: string) => void
  className?: string
}

const PHRASES = ['Book a demo', 'Ask anything']
const NO_TEMPLATES: PromptTemplate[] = []
const WORDS: PromptWords = { ask: 'Ask anything', readMore: 'Read more', clear: 'Clear', close: 'Close', fallback: 'I can answer only a few questions here for now. Book a demo and we will answer the rest with you.', fallbackLink: 'Book a demo' }

// The pixel patterns of the website's team tabs: a path on a 16px square, 2px cells, centred.
function cells(on: (x: number, y: number) => boolean) {
  const lit: [number, number][] = []
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (on(x, y)) lit.push([x, y])
  const ox = (16 - (Math.max(...lit.map(c => c[0])) + Math.min(...lit.map(c => c[0])) + 1) * 2) / 2
  const oy = (16 - (Math.max(...lit.map(c => c[1])) + Math.min(...lit.map(c => c[1])) + 1) * 2) / 2
  return lit.map(([x, y]) => `M${x * 2 + ox} ${y * 2 + oy}h2v2h-2Z`).join('')
}
const PATTERNS: Record<Pattern, string> = {
  dots: cells((x, y) => x % 2 === 0 && y % 2 === 0),
  hatch: cells((x, y) => (x + y) % 3 === 0),
  checker: cells((x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0),
  ruling: cells((_, y) => y % 2 === 0),
  columns: cells(x => x % 2 === 0),
  grid: cells((x, y) => x % 3 === 0 || y % 3 === 0),
}
const pattern = (icon: PromptTemplate['icon']) => (icon in PATTERNS ? PATTERNS[icon as Pattern] : undefined)
const MARK = 'M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457ZM0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799ZM0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597ZM0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692ZM148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z'

// The typed placeholder: about 50ms a letter in, a 1.2s hold, 25ms a letter out, then a short beat.
const TYPE_MS = 50
const HOLD_MS = 1200
const DELETE_MS = 25
const GAP_MS = 280

// Dictation, where the browser has speech recognition: what is heard is added after what was typed.
type Recognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: { resultIndex: number, results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}
function speech() {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition, webkitSpeechRecognition?: new () => Recognition }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

type Turn = { id: number, q: string, a: string, more?: string, moreLabel: string, external: boolean }

// An answer in words and `code` spans, each word fading up after the last.
const parts = (a: string) => a
  .split(/(`[^`]+`)/)
  .filter(Boolean)
  .flatMap(part => (part.startsWith('`') ? [{ text: part.slice(1, -1), code: true }] : part.split(/(?<=\s)/).map(text => ({ text, code: false }))))
  .map((w, i) => ({ ...w, style: { '--i': i } as CSSProperties }))

const ArrowIcon = () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M1.5 5h7M5.5 2l3 3-3 3" /></svg>

export function PromptBar({ phrases = PHRASES, templates = NO_TEMPLATES, href = '#', label = 'Message us', docked, voice, shortcuts, words = WORDS, onAsk, className }: PromptBarProps) {
  const [value, setValue] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [chatting, setChatting] = useState(false)
  const threadEl = useRef<HTMLDivElement | null>(null)
  const turnId = useRef(0)
  const [focused, setFocused] = useState(false)
  const input = useRef<HTMLInputElement | null>(null)
  const [placeholder, setPlaceholder] = useState(phrases[0] ?? '')
  const [listening, setListening] = useState(false)
  const [canListen, setCanListen] = useState(false)
  const open = focused || value.length > 0 || chatting || listening
  const ready = value.trim().length > 0

  // The latest props and state for the timers and window listeners, which outlive a render.
  const live = useRef({ phrases, chatting, shortcuts, value })
  live.current = { phrases, chatting, shortcuts, value }

  const typing = useRef({ phrase: 0, len: (phrases[0] ?? '').length, deleting: true })
  const timer = useRef<number | undefined>(undefined)
  function stop() {
    const { phrases: list } = live.current
    window.clearTimeout(timer.current)
    typing.current.len = list[typing.current.phrase]?.length ?? 0
    typing.current.deleting = true
    setPlaceholder(list[typing.current.phrase] ?? '')
  }
  function tick() {
    const { phrases: list } = live.current
    const t = typing.current
    const phrase = list[t.phrase] ?? ''
    let delay: number
    if (t.deleting) {
      t.len -= 1
      if (t.len <= 0) {
        t.len = 0
        t.deleting = false
        t.phrase = (t.phrase + 1) % list.length
        delay = GAP_MS
      }
      else delay = DELETE_MS
    }
    else {
      t.len += 1
      if (t.len >= phrase.length) {
        t.deleting = true
        delay = HOLD_MS
      }
      else delay = TYPE_MS + Math.random() * 30
    }
    setPlaceholder((list[t.phrase] ?? '').slice(0, t.len))
    timer.current = window.setTimeout(tick, delay)
  }
  function start() {
    window.clearTimeout(timer.current)
    if (live.current.phrases.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timer.current = window.setTimeout(tick, HOLD_MS)
  }

  // Shown once the page has scrolled a little and while it scrolls back up, hidden while it scrolls down; always while
  // in use or once a shortcut called it. A few pixels either way are ignored, so a trackpad's settle doesn't flick it.
  const [scrolled, setScrolled] = useState(false)
  const [goingDown, setGoingDown] = useState(false)
  const [summoned, setSummoned] = useState(false)
  const shown = ((docked || scrolled) && !goingDown) || open || summoned
  const lastY = useRef(0)

  // Vue's watch(focused): not on the first render.
  const wasFocused = useRef(focused)
  useEffect(() => {
    if (wasFocused.current === focused) return
    wasFocused.current = focused
    if (focused) stop()
    else {
      start()
      setSummoned(false)
    }
  }, [focused]) // eslint-disable-line react-hooks/exhaustive-deps

  // A shortcut shows the bar, then focuses its input once it is in the page (Vue's nextTick).
  const focusAfter = useRef(false)
  useEffect(() => {
    if (!focusAfter.current) return
    focusAfter.current = false
    input.current?.focus()
  })
  function summon() {
    focusAfter.current = true
    setSummoned(true)
  }

  const recognition = useRef<Recognition | null>(null)
  function listen() {
    if (listening) return recognition.current?.stop()
    const Speech = speech()
    if (!Speech) return
    const before = value.trim()
    let heard = ''
    const r = new Speech()
    recognition.current = r
    r.lang = document.documentElement.lang || 'en-US'
    r.interimResults = true
    r.continuous = false
    r.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]!
        if (res.isFinal) heard += res[0]!.transcript
        else interim += res[0]!.transcript
      }
      setValue([before, (heard + interim).trim()].filter(Boolean).join(' '))
    }
    r.onend = r.onerror = () => {
      setListening(false)
      input.current?.focus()
    }
    setListening(true)
    stop()
    r.start()
  }

  const clearRef = useRef(clear)
  clearRef.current = clear
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 40)
      if (Math.abs(y - lastY.current) < 8) return
      setGoingDown(y > lastY.current)
      lastY.current = y
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && live.current.chatting) return clearRef.current()
      if (!live.current.shortcuts || !(e.metaKey || e.ctrlKey)) return
      const k = e.key.toLowerCase()
      if (k === 'k' || k === 'i') {
        e.preventDefault()
        summon()
      }
    }
    setCanListen(!!speech())
    start()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer.current)
      recognition.current?.stop()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const go = (to: string) => window.open(to, '_blank', 'noopener')
  // After a question lands, the thread runs down to it.
  const scrollAfter = useRef(false)
  useEffect(() => {
    if (!scrollAfter.current) return
    scrollAfter.current = false
    threadEl.current?.scrollTo({ top: threadEl.current.scrollHeight, behavior: 'smooth' })
  }, [turns])
  function ask(q: string, t?: PromptTemplate) {
    setValue('')
    const turn = t?.answer
      ? { id: ++turnId.current, q, a: t.answer, more: t.more, moreLabel: words.readMore, external: false }
      : { id: ++turnId.current, q, a: words.fallback, more: href, moreLabel: words.fallbackLink, external: true }
    const was = live.current.chatting
    setTurns(list => [...(was ? list : []), turn])
    setChatting(true)
    live.current.chatting = true
    onAsk?.(q)
    scrollAfter.current = true
  }
  function clear() {
    setValue('')
    setChatting(false)
    input.current?.focus()
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!ready) return
    const q = value.trim()
    const known = templates.find(t => t.label.toLowerCase() === q.toLowerCase())
    if (known?.href) {
      go(known.href)
      setValue('')
      return
    }
    ask(known?.label ?? q, known)
  }
  function pick(t: PromptTemplate) {
    if (t.href) return go(t.href)
    if (t.answer) ask(t.label, t)
    else setValue(t.label)
    input.current?.focus()
  }

  const nextUp = templates.filter(t => t.answer && !turns.some(turn => turn.q === t.label))
  const answers = turns.map((turn) => {
    const w = parts(turn.a)
    return { words: w, more: { '--i': w.length } as CSSProperties }
  })
  const lastParts = answers.at(-1)?.words.length ?? 0
  const templateStyles = templates.map((_, i) => ({ '--i': templates.length - 1 - i }) as CSSProperties)
  const nextUpStyles = nextUp.map((_, i) => ({ '--i': lastParts + 2 + i * 2 }) as CSSProperties)

  return (
    <div data-ds="prompt-bar" className={cn('ds-prompt-dock', className)} data-shown={String(shown)} data-summoned={String(summoned)} inert={!shown}>
      <style href="ds-prompt-bar" precedence="ds">{css}</style>
      <div className="ds-prompt-trigger" style={{ width: open ? '480px' : '280px' }}>
        {/* mousedown is cancelled so picking a template doesn't blur the input and fold the stack before the click lands. */}
        <ul aria-label="Templates" hidden={!focused || chatting} className="ds-prompt-templates">
          {templates.map((t, i) => (
            <li key={t.label}>
              <button
                type="button"
                style={templateStyles[i]}
                className="ds-prompt-glass ds-prompt-press ds-prompt-template"
                onMouseDown={(e: ReactMouseEvent) => e.preventDefault()}
                onPointerDown={(e: ReactPointerEvent) => { if (e.button === 0) pick(t) }}
                onClick={(e: ReactMouseEvent) => { if (e.detail === 0) pick(t) }}
              >
                {pattern(t.icon)
                  ? <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><path d={pattern(t.icon)} fill="currentColor" /></svg>
                  : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
                        {t.icon === 'phone'
                          ? <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                          : <><rect x="2" y="4" width="20" height="16" /><path d="m22 7-10 6L2 7" /></>}
                      </svg>
                    )}
                {t.label}
                <span aria-hidden="true" className="ds-prompt-go">
                  <span><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1.5 5h7M5.5 2l3 3-3 3" /></svg></span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <form className="ds-prompt-glass ds-prompt-form" onSubmit={submit} onClick={() => input.current?.focus()}>
          <div className="ds-prompt-thread" data-open={String(chatting)} inert={!chatting} onClick={e => e.stopPropagation()}>
            <div className="ds-prompt-thread-in">
              <div className="ds-prompt-head">
                <svg viewBox="0 0 149 134" width="12" height="10" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d={MARK} /></svg>
                <span className="ds-prompt-head-label">{words.ask}</span>
                <button type="button" aria-label={words.close} className="ds-prompt-press ds-prompt-close" onClick={clear}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m1.5 1.5 7 7m0-7-7 7" /></svg>
                </button>
              </div>
              {turns.length > 0 && (
                <div ref={threadEl} className="ds-prompt-turns" aria-live="polite">
                  {turns.map((turn, n) => (
                    <TurnView key={turn.id} turn={turn} answer={answers[n]!} onLocal={clear} />
                  ))}
                  {nextUp.length > 0 && (
                    <ul className="ds-prompt-next">
                      {nextUp.map((t, i) => (
                        <li key={t.label}>
                          <button type="button" className="ds-prompt-word ds-prompt-more ds-prompt-ask" style={nextUpStyles[i]} onClick={() => ask(t.label, t)}>
                            {pattern(t.icon) && <svg width="12" height="12" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><path d={pattern(t.icon)} fill="currentColor" /></svg>}
                            {t.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="ds-prompt-row" data-ruled={chatting || undefined}>
            {shortcuts && <kbd className="ds-prompt-key">⌘K</kbd>}
            <input
              ref={input}
              value={value}
              onChange={e => setValue(e.target.value)}
              type="text"
              placeholder={listening ? 'Listening' : placeholder}
              aria-label={label}
              className="ds-prompt-input"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {(value || chatting) && <button type="button" className="ds-prompt-press ds-prompt-key ds-prompt-clear" onClick={(e) => { e.stopPropagation(); clear() }}>{words.clear}</button>}
            {voice && canListen && (
              <button
                type="button"
                aria-label={listening ? 'Stop listening' : 'Ask by voice'}
                aria-pressed={listening}
                className="ds-prompt-press ds-prompt-mic"
                data-listening={String(listening)}
                onMouseDown={e => e.preventDefault()}
                onClick={(e) => { e.stopPropagation(); listen() }}
              >
                {listening
                  ? <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="ds-prompt-icon-in"><rect x="1" y="1" width="8" height="8" fill="currentColor" /></svg>
                  : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    )}
              </button>
            )}
            <button type="submit" aria-label="Send message" disabled={!ready} className="ds-prompt-press ds-prompt-send">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// One question and its answer: the words fade up one after the other, then the link onward.
function TurnView({ turn, answer, onLocal }: { turn: Turn, answer: { words: ReturnType<typeof parts>, more: CSSProperties }, onLocal: () => void }) {
  return (
    <>
      <p className="ds-prompt-q">{turn.q}</p>
      <div className="ds-prompt-a">
        <p>
          {answer.words.map((w, i) => (w.code
            ? <code key={i} className="ds-prompt-word ds-prompt-code" style={w.style}>{w.text}</code>
            : <span key={i} className="ds-prompt-word" style={w.style}>{w.text}</span>))}
        </p>
        {turn.more && (
          <div className="ds-prompt-more-row">
            <a href={turn.more} target={turn.external ? '_blank' : undefined} rel={turn.external ? 'noopener' : undefined} className="ds-prompt-word ds-prompt-more ds-prompt-link" style={answer.more} onClick={() => { if (!turn.external) onLocal() }}>
              {turn.moreLabel}
              <ArrowIcon />
            </a>
          </div>
        )}
      </div>
    </>
  )
}

export default PromptBar

const css = `
.ds-prompt-dock {
  --prompt-ink: var(--ds-color-glass-ink);
  --prompt-glass: color-mix(in srgb, var(--ds-color-warm-ink) 52%, transparent);
  --prompt-light: color-mix(in srgb, var(--ds-color-off-white) 18%, transparent);
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  justify-content: center;
  padding: 0 var(--ds-space-xl) var(--ds-space-2xl);
  pointer-events: none;
  transform: translateY(calc(100% + 24px));
  visibility: hidden;
  transition: transform var(--ds-duration-enter) var(--ds-easing-out), visibility 0s linear var(--ds-duration-enter);
}
.ds-prompt-dock[data-shown="true"] { transform: none; visibility: visible; transition: transform var(--ds-duration-dock) var(--ds-easing-out), visibility 0s; }
.ds-prompt-dock[data-summoned="true"] { transform: none; visibility: visible; transition: none; }
.ds-prompt-trigger { max-width: 100%; pointer-events: auto; transition: width var(--ds-duration-glide) var(--ds-easing-standard); }
/* The glass: warm dark at 52%, blurred and saturated behind, a 1px light along the top. */
.ds-prompt-glass { border-radius: var(--ds-radius-control); background: linear-gradient(var(--prompt-light), var(--prompt-light)) top / 100% 1px no-repeat, var(--prompt-glass); -webkit-backdrop-filter: blur(36px) saturate(140%); backdrop-filter: blur(36px) saturate(140%); }
.ds-prompt-glass:focus-within { outline: var(--ds-border-hairline) solid color-mix(in srgb, var(--prompt-ink) 42%, transparent); outline-offset: -1px; }
/* The form's glass on its own layer, so the typing placeholder does not re-run the blur on every repaint. */
.ds-prompt-form { position: relative; isolation: isolate; display: flex; flex-direction: column; background: none; -webkit-backdrop-filter: none; backdrop-filter: none; cursor: text; }
.ds-prompt-form::before { position: absolute; inset: 0; z-index: -1; background: linear-gradient(var(--prompt-light), var(--prompt-light)) top / 100% 1px no-repeat, var(--prompt-glass); -webkit-backdrop-filter: blur(36px) saturate(140%); backdrop-filter: blur(36px) saturate(140%); content: ""; pointer-events: none; transform: translateZ(0); will-change: transform; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-prompt-form:hover::before { background: linear-gradient(var(--prompt-light), var(--prompt-light)) top / 100% 1px no-repeat, color-mix(in srgb, var(--ds-color-warm-ink-hover) 56%, transparent); }
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .ds-prompt-glass, .ds-prompt-form::before { background: color-mix(in srgb, var(--ds-color-warm-ink) 98%, transparent); }
  .ds-prompt-form { background: none; }
}
.ds-prompt-templates { display: flex; flex-direction: column; align-items: flex-start; gap: var(--ds-space-md); margin-bottom: var(--ds-space-md); }
.ds-prompt-templates[hidden] { display: none; }
.ds-prompt-templates button { animation: ds-prompt-settle var(--ds-duration-enter) var(--ds-easing-standard) backwards; animation-delay: calc(var(--i, 0) * 40ms); }
@keyframes ds-prompt-settle { from { opacity: 0; transform: translateY(12px); } }
.ds-prompt-press { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard), border-color var(--ds-duration-micro) var(--ds-easing-standard), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-prompt-press:active { background-color: color-mix(in srgb, var(--ds-color-off-white) 14%, transparent); }
.ds-prompt-press:focus-visible { outline: var(--ds-border-focus) solid color-mix(in srgb, var(--prompt-ink) 90%, transparent); outline-offset: var(--ds-border-focus); }
.ds-prompt-template { display: flex; height: var(--ds-size-control-lg); align-items: center; gap: var(--ds-space-md); padding: 0 12px; color: var(--prompt-ink); font-size: var(--ds-text-body); cursor: pointer; }
/* Under the pointer the glass lightens and an arrow opens out after the label on grid columns; the arrow itself stays still. */
.ds-prompt-go { display: grid; margin-left: -8px; grid-template-columns: 0fr; opacity: 0; transition: grid-template-columns var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-prompt-go > span { min-width: 0; overflow: hidden; }
.ds-prompt-go svg { margin-left: var(--ds-space-md); }
@media (hover: hover) and (pointer: fine) {
  .ds-prompt-template:hover { background: linear-gradient(color-mix(in srgb, var(--ds-color-off-white) 32%, transparent), color-mix(in srgb, var(--ds-color-off-white) 32%, transparent)) top / 100% 1px no-repeat, color-mix(in srgb, var(--ds-color-warm-lift) 60%, transparent); outline: var(--ds-border-hairline) solid color-mix(in srgb, var(--ds-color-off-white) 14%, transparent); outline-offset: -1px; }
  .ds-prompt-template:hover .ds-prompt-go { grid-template-columns: 1fr; opacity: 1; }
}
.ds-prompt-template:focus-visible .ds-prompt-go { grid-template-columns: 1fr; opacity: 1; }
/* The thread folds open above the input on grid rows, so the glass grows with it. */
.ds-prompt-thread { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-prompt-thread[data-open="true"] { grid-template-rows: 1fr; }
.ds-prompt-thread-in { min-height: 0; overflow: hidden; }
.ds-prompt-head { display: flex; height: var(--ds-size-control-lg); align-items: center; gap: var(--ds-space-md); padding: 0 var(--ds-space-md) 0 var(--ds-space-xl); border-bottom: var(--ds-border-hairline) solid color-mix(in srgb, var(--ds-color-off-white) 10%, transparent); color: var(--prompt-ink); cursor: auto; }
.ds-prompt-head-label { color: color-mix(in srgb, var(--prompt-ink) 70%, transparent); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
.ds-prompt-close { display: flex; width: 24px; height: 24px; align-items: center; justify-content: center; margin-left: auto; color: color-mix(in srgb, var(--prompt-ink) 60%, transparent); cursor: pointer; }
@media (hover: hover) and (pointer: fine) { .ds-prompt-close:hover { background-color: color-mix(in srgb, var(--ds-color-off-white) 10%, transparent); color: var(--prompt-ink); } }
.ds-prompt-turns { display: flex; max-height: min(70vh, 600px); min-height: min(40vh, 320px); flex-direction: column; gap: var(--ds-space-xl); overflow-y: auto; padding: var(--ds-space-xl) var(--ds-space-xl) var(--ds-space-lg); color: var(--prompt-ink); font-size: var(--ds-text-body); line-height: var(--ds-text-body-lg-leading); cursor: auto; }
.ds-prompt-q { max-width: 80%; align-self: flex-end; padding: var(--ds-space-sm) var(--ds-space-lg); background: color-mix(in srgb, var(--ds-color-off-white) 10%, transparent); }
.ds-prompt-a { max-width: 90%; align-self: flex-start; padding: var(--ds-space-md) var(--ds-space-lg); background: color-mix(in srgb, var(--ds-color-warm-ink) 85%, transparent); }
.ds-prompt-code { padding: 0 var(--ds-space-xs); background: color-mix(in srgb, var(--ds-color-off-white) 10%, transparent); font-family: var(--ds-font-code); font-size: var(--ds-text-meta); }
.ds-prompt-more-row { display: flex; justify-content: flex-end; margin: var(--ds-space-md) 0 var(--ds-space-xs); }
.ds-prompt-word { animation: ds-prompt-word var(--ds-duration-word) var(--ds-easing-standard) both; animation-delay: calc(var(--i) * 22ms); }
@keyframes ds-prompt-word { from { opacity: 0; } }
.ds-prompt-more { border: var(--ds-border-hairline) solid color-mix(in srgb, var(--ds-color-off-white) 20%, transparent); font-size: var(--ds-text-ui); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard), border-color var(--ds-duration-micro) var(--ds-easing-standard), color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-prompt-more:hover { border-color: color-mix(in srgb, var(--ds-color-off-white) 40%, transparent); background-color: color-mix(in srgb, var(--ds-color-off-white) 10%, transparent); color: var(--prompt-ink); } }
.ds-prompt-link { display: inline-flex; align-items: center; gap: var(--ds-space-sm); padding: var(--ds-space-2xs) var(--ds-space-md); color: color-mix(in srgb, var(--prompt-ink) 70%, transparent); }
.ds-prompt-next { display: flex; flex-wrap: wrap; gap: var(--ds-space-md); margin-top: auto; padding-top: var(--ds-space-lg); }
.ds-prompt-ask { display: flex; height: var(--ds-size-control-sm); align-items: center; gap: var(--ds-space-md); padding: 0 var(--ds-space-md); color: color-mix(in srgb, var(--prompt-ink) 80%, transparent); cursor: pointer; }
/* The input row, ruled off from the thread while it is open. */
.ds-prompt-row { display: flex; height: 38px; align-items: center; gap: var(--ds-space-md); padding: var(--ds-space-xs) var(--ds-space-xs) var(--ds-space-xs) var(--ds-space-lg); border-top: var(--ds-border-hairline) solid transparent; transition: border-color var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-prompt-row[data-ruled] { border-top-color: color-mix(in srgb, var(--ds-color-off-white) 10%, transparent); }
.ds-prompt-key { flex-shrink: 0; padding: 0 var(--ds-space-xs); border: var(--ds-border-hairline) solid color-mix(in srgb, var(--ds-color-off-white) 20%, transparent); color: color-mix(in srgb, var(--prompt-ink) 60%, transparent); font-family: var(--ds-font-text); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-prompt-clear { cursor: pointer; }
@media (hover: hover) and (pointer: fine) { .ds-prompt-clear:hover { border-color: color-mix(in srgb, var(--ds-color-off-white) 40%, transparent); color: var(--prompt-ink); } }
.ds-prompt-input { min-width: 0; flex: 1; background: transparent; color: var(--prompt-ink); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); outline: none; }
.ds-prompt-input::placeholder { color: color-mix(in srgb, var(--prompt-ink) 60%, transparent); }
.ds-prompt-mic, .ds-prompt-send { position: relative; display: flex; width: var(--ds-size-control-sm); height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; justify-content: center; cursor: pointer; }
.ds-prompt-mic { background: color-mix(in srgb, var(--ds-color-off-white) 10%, transparent); color: color-mix(in srgb, var(--prompt-ink) 90%, transparent); }
@media (hover: hover) and (pointer: fine) { .ds-prompt-mic:hover { background: color-mix(in srgb, var(--ds-color-off-white) 16%, transparent); } }
.ds-prompt-mic[data-listening="true"] { background: var(--ds-color-home-red); color: var(--ds-color-off-white); }
/* While it listens a red ring breathes out from the mic, over and over, and the stop square comes in. */
.ds-prompt-mic[data-listening="true"]::after { position: absolute; inset: 0; border: var(--ds-border-hairline) solid var(--ds-color-home-red); content: ""; pointer-events: none; animation: ds-prompt-listen 1400ms var(--ds-easing-swap) infinite; }
@keyframes ds-prompt-listen { from { opacity: 0.9; transform: scale(1); } to { opacity: 0; transform: scale(1.6); } }
.ds-prompt-icon-in { animation: ds-prompt-icon-in var(--ds-duration-enter) var(--ds-easing-out) both; }
@keyframes ds-prompt-icon-in { from { opacity: 0; transform: scale(0.6); } }
.ds-prompt-send { background: var(--prompt-ink); color: var(--ds-color-warm-ink); }
@media (hover: hover) and (pointer: fine) { .ds-prompt-send:hover:not(:disabled) { background: var(--ds-color-off-white); } }
.ds-prompt-send:disabled { cursor: not-allowed; opacity: 0.4; }
@media (prefers-reduced-motion: reduce) {
  .ds-prompt-dock, .ds-prompt-dock[data-shown="true"], .ds-prompt-trigger, .ds-prompt-thread, .ds-prompt-go { transition: none; }
  .ds-prompt-templates button, .ds-prompt-word, .ds-prompt-mic[data-listening="true"]::after, .ds-prompt-icon-in { animation: none; }
  .ds-prompt-press { transition: opacity var(--ds-duration-micro) ease, background-color var(--ds-duration-micro) ease; }
}
`
