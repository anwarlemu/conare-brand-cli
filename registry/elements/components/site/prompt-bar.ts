import { html, nothing, svg } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { live } from 'lit/directives/live.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// PromptBar.vue as <conare-prompt-bar>: the website's floating prompt bar (home.css .prompt-*): warm dark glass pinned
// bottom centre that types its phrases in and out, widens from 280 to 480px in use, and lights the send button once
// there is text. Focusing it raises the templates; picking one fills the input, opens its `href`, or, when it has an
// `answer`, asks it: the bar grows upward into a thread, the question on the right and the answer on the left, word by
// word, with a link to `more`. A question it has no answer for gets `words.fallback`, linking to `href`. Clear or Escape
// folds the thread away. It waits below the screen until the page scrolls up and goes back down while the page scrolls
// down; `docked` shows it from the start. `shortcuts` shows the key and focuses it with Cmd+K or Cmd+I. `voice` adds a
// mic that dictates with the browser's own speech recognition, only where the browser has it. Nothing is sent anywhere:
// `ask` fires with each question, and links open in a new tab.
type Pattern = 'dots' | 'hatch' | 'checker' | 'ruling' | 'columns' | 'grid'
export type PromptTemplate = { label: string, icon: 'phone' | 'mail' | Pattern, answer?: string, more?: string, href?: string }
export type PromptWords = { ask: string, readMore: string, clear: string, close: string, fallback: string, fallbackLink: string }

// The pixel patterns of the website's team tabs: a path on a 16px square, 2px cells, centred.
function cells(on: (x: number, y: number) => boolean) {
	const lit: [number, number][] = []
	for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (on(x, y)) lit.push([x, y])
	const ox = (16 - (Math.max(...lit.map((c) => c[0])) + Math.min(...lit.map((c) => c[0])) + 1) * 2) / 2
	const oy = (16 - (Math.max(...lit.map((c) => c[1])) + Math.min(...lit.map((c) => c[1])) + 1) * 2) / 2
	return lit.map(([x, y]) => `M${x * 2 + ox} ${y * 2 + oy}h2v2h-2Z`).join('')
}
const PATTERNS: Record<Pattern, string> = {
	dots: cells((x, y) => x % 2 === 0 && y % 2 === 0),
	hatch: cells((x, y) => (x + y) % 3 === 0),
	checker: cells((x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0),
	ruling: cells((_, y) => y % 2 === 0),
	columns: cells((x) => x % 2 === 0),
	grid: cells((x, y) => x % 3 === 0 || y % 3 === 0),
}
const pattern = (icon: PromptTemplate['icon']) => (icon in PATTERNS ? PATTERNS[icon as Pattern] : undefined)
const MARK = 'M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457ZM0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799ZM0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597ZM0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692ZM148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z'
const PHONE = 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z'

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
	.flatMap((part) => (part.startsWith('`') ? [{ text: part.slice(1, -1), code: true }] : part.split(/(?<=\s)/).map((text) => ({ text, code: false }))))

const ARROW = html`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1.5 5h7M5.5 2l3 3-3 3"></path></svg>`

/**
 * @summary The website's floating prompt bar: templates, a thread of sample answers, and a send button.
 * @fires ask - A question was asked; detail { question }.
 */
export class PromptBar extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		phrases: { type: Array },
		templates: { type: Array },
		href: {},
		label: {},
		docked: { type: Boolean },
		voice: { type: Boolean },
		shortcuts: { type: Boolean },
		words: { type: Object },
		value: { state: true },
		turns: { state: true },
		chatting: { state: true },
		focused: { state: true },
		placeholder: { state: true },
		listening: { state: true },
		canListen: { state: true },
		scrolled: { state: true },
		goingDown: { state: true },
		summoned: { state: true },
	}

	/** The phrases the placeholder types in and out. */
	phrases = ['Book a demo', 'Ask anything']
	/** [{ label, icon, answer?, more?, href? }]: icon is phone, mail or a pattern (dots, hatch, checker, ruling, columns, grid). */
	templates: PromptTemplate[] = []
	/** Where a question without an answer links (book a demo). */
	href = '#'
	/** The input's name. */
	label = 'Message us'
	/** Shown from the start. */
	docked = false
	/** A mic, where the browser has speech recognition. */
	voice = false
	/** The ⌘K key, and Cmd+K or Cmd+I to focus it. */
	shortcuts = false
	/** The bar's words: { ask, readMore, clear, close, fallback, fallbackLink }. */
	words: PromptWords = { ask: 'Ask anything', readMore: 'Read more', clear: 'Clear', close: 'Close', fallback: 'I can answer only a few questions here for now. Book a demo and we will answer the rest with you.', fallbackLink: 'Book a demo' }

	private value = ''
	private turns: Turn[] = []
	private chatting = false
	private focused = false
	private placeholder = ''
	private listening = false
	private canListen = false
	private scrolled = false
	private goingDown = false
	private summoned = false
	private turnId = 0
	private typing = { phrase: 0, len: 0, deleting: true }
	private timer?: number
	private lastY = 0
	private recognition: Recognition | null = null

	private get input() {
		return this.renderRoot.querySelector<HTMLInputElement>('.ds-prompt-input')
	}
	private get open() {
		return this.focused || this.value.length > 0 || this.chatting || this.listening
	}

	connectedCallback() {
		super.connectedCallback()
		this.placeholder = this.phrases[0] ?? ''
		this.typing = { phrase: 0, len: this.placeholder.length, deleting: true }
		this.canListen = !!speech()
		this.start()
		this.onScroll()
		window.addEventListener('scroll', this.onScroll, { passive: true })
		window.addEventListener('keydown', this.onKey)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		window.clearTimeout(this.timer)
		this.recognition?.stop()
		window.removeEventListener('scroll', this.onScroll)
		window.removeEventListener('keydown', this.onKey)
	}

	private stop() {
		window.clearTimeout(this.timer)
		this.typing.len = this.phrases[this.typing.phrase]?.length ?? 0
		this.typing.deleting = true
		this.placeholder = this.phrases[this.typing.phrase] ?? ''
	}
	private tick = () => {
		const t = this.typing
		const phrase = this.phrases[t.phrase] ?? ''
		let delay: number
		if (t.deleting) {
			t.len -= 1
			if (t.len <= 0) {
				t.len = 0
				t.deleting = false
				t.phrase = (t.phrase + 1) % this.phrases.length
				delay = GAP_MS
			} else delay = DELETE_MS
		} else {
			t.len += 1
			if (t.len >= phrase.length) {
				t.deleting = true
				delay = HOLD_MS
			} else delay = TYPE_MS + Math.random() * 30
		}
		this.placeholder = (this.phrases[t.phrase] ?? '').slice(0, t.len)
		this.timer = window.setTimeout(this.tick, delay)
	}
	private start() {
		window.clearTimeout(this.timer)
		if (this.phrases.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
		this.timer = window.setTimeout(this.tick, HOLD_MS)
	}
	// Vue's watch(focused), from the input's own focus and blur.
	private onFocus() {
		this.focused = true
		this.stop()
	}
	private onBlur() {
		this.focused = false
		this.start()
		this.summoned = false
	}

	// Shown once the page has scrolled a little and while it scrolls back up, hidden while it scrolls down; always while
	// in use or once a shortcut called it. A few pixels either way are ignored, so a trackpad's settle doesn't flick it.
	private onScroll = () => {
		const y = window.scrollY
		this.scrolled = y > 40
		if (Math.abs(y - this.lastY) < 8) return
		this.goingDown = y > this.lastY
		this.lastY = y
	}
	private async summon() {
		this.summoned = true
		await this.updateComplete
		this.input?.focus()
	}
	private onKey = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && this.chatting) return this.clear()
		if (!this.shortcuts || !(e.metaKey || e.ctrlKey)) return
		const k = e.key.toLowerCase()
		if (k === 'k' || k === 'i') {
			e.preventDefault()
			void this.summon()
		}
	}

	private listen() {
		if (this.listening) return this.recognition?.stop()
		const Speech = speech()
		if (!Speech) return
		const before = this.value.trim()
		let heard = ''
		const r = new Speech()
		this.recognition = r
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
			this.value = [before, (heard + interim).trim()].filter(Boolean).join(' ')
		}
		r.onend = r.onerror = () => {
			this.listening = false
			this.input?.focus()
		}
		this.listening = true
		this.stop()
		r.start()
	}

	private go(to: string) {
		window.open(to, '_blank', 'noopener')
	}
	private async toEnd() {
		await this.updateComplete
		const thread = this.renderRoot.querySelector<HTMLElement>('.ds-prompt-turns')
		thread?.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' })
	}
	private ask(q: string, t?: PromptTemplate) {
		this.value = ''
		const turns = this.chatting ? this.turns : []
		this.chatting = true
		this.turns = [...turns, t?.answer
			? { id: ++this.turnId, q, a: t.answer, more: t.more, moreLabel: this.words.readMore, external: false }
			: { id: ++this.turnId, q, a: this.words.fallback, more: this.href, moreLabel: this.words.fallbackLink, external: true }]
		this.emit('ask', { question: q })
		void this.toEnd()
	}
	private clear() {
		this.value = ''
		this.chatting = false
		this.input?.focus()
	}
	private submit(event: Event) {
		event.preventDefault()
		if (!this.value.trim()) return
		const q = this.value.trim()
		const known = this.templates.find((t) => t.label.toLowerCase() === q.toLowerCase())
		if (known?.href) {
			this.go(known.href)
			this.value = ''
			return
		}
		this.ask(known?.label ?? q, known)
	}
	private pick(t: PromptTemplate) {
		if (t.href) return this.go(t.href)
		if (t.answer) this.ask(t.label, t)
		else this.value = t.label
		this.input?.focus()
	}

	private renderIcon(t: PromptTemplate, size: number) {
		const d = pattern(t.icon)
		if (d) return html`<svg width=${size} height=${size} viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d=${d} fill="currentColor"></path></svg>`
		return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${t.icon === 'phone' ? svg`<path d=${PHONE}></path>` : svg`<rect x="2" y="4" width="20" height="16"></rect><path d="m22 7-10 6L2 7"></path>`}</svg>`
	}

	render() {
		const open = this.open
		const ready = this.value.trim().length > 0
		const shown = ((this.docked || this.scrolled) && !this.goingDown) || open || this.summoned
		const templates = this.templates ?? []
		const words = this.words
		const nextUp = templates.filter((t) => t.answer && !this.turns.some((turn) => turn.q === t.label))
		const answers = this.turns.map((turn) => parts(turn.a))
		const lastParts = answers.at(-1)?.length ?? 0
		return html`<div data-ds="prompt-bar" class="ds-prompt-dock" data-shown=${String(shown)} data-summoned=${String(this.summoned)} ?inert=${!shown}>
			<div class="ds-prompt-trigger" style=${`width: ${open ? '480px' : '280px'}`}>
				<!-- mousedown is cancelled so picking a template doesn't blur the input and fold the stack before the click lands. -->
				<ul aria-label="Templates" ?hidden=${!this.focused || this.chatting} class="ds-prompt-templates">
					${repeat(templates, (t) => t.label, (t, i) => html`<li>
						<button
							type="button"
							style=${`--i: ${templates.length - 1 - i}`}
							class="ds-prompt-glass ds-prompt-press ds-prompt-template"
							@mousedown=${(e: MouseEvent) => e.preventDefault()}
							@pointerdown=${(e: PointerEvent) => { if (e.button === 0) this.pick(t) }}
							@click=${(e: MouseEvent) => { if (e.detail === 0) this.pick(t) }}
						>${this.renderIcon(t, 16)}${t.label}<span aria-hidden="true" class="ds-prompt-go"><span><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1.5 5h7M5.5 2l3 3-3 3"></path></svg></span></span></button>
					</li>`)}
				</ul>

				<form class="ds-prompt-glass ds-prompt-form" @submit=${(e: Event) => this.submit(e)} @click=${() => this.input?.focus()}>
					<div class="ds-prompt-thread" data-open=${String(this.chatting)} ?inert=${!this.chatting} @click=${(e: Event) => e.stopPropagation()}>
						<div class="ds-prompt-thread-in">
							<div class="ds-prompt-head">
								<svg viewBox="0 0 149 134" width="12" height="10" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d=${MARK}></path></svg>
								<span class="ds-prompt-head-label">${words.ask}</span>
								<button type="button" aria-label=${words.close} class="ds-prompt-press ds-prompt-close" @click=${() => this.clear()}>
									<svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="m1.5 1.5 7 7m0-7-7 7"></path></svg>
								</button>
							</div>
							${this.turns.length
								? html`<div class="ds-prompt-turns fade-y" aria-live="polite">
										${repeat(this.turns, (turn) => turn.id, (turn, n) => html`<p class="ds-prompt-q">${turn.q}</p>
											<div class="ds-prompt-a">
												<p>${answers[n]!.map((w, i) => (w.code ? html`<code class="ds-prompt-word ds-prompt-code" style=${`--i: ${i}`}>${w.text}</code>` : html`<span class="ds-prompt-word" style=${`--i: ${i}`}>${w.text}</span>`))}</p>
												${turn.more
													? html`<div class="ds-prompt-more-row"><a href=${turn.more} target=${ifDefined(turn.external ? '_blank' : undefined)} rel=${ifDefined(turn.external ? 'noopener' : undefined)} class="ds-prompt-word ds-prompt-more ds-prompt-link" style=${`--i: ${answers[n]!.length}`} @click=${() => { if (!turn.external) this.clear() }}>${turn.moreLabel}${ARROW}</a></div>`
													: nothing}
											</div>`)}
										${nextUp.length
											? html`<ul class="ds-prompt-next">${repeat(nextUp, (t) => t.label, (t, i) => html`<li><button type="button" class="ds-prompt-word ds-prompt-more ds-prompt-ask" style=${`--i: ${lastParts + 2 + i * 2}`} @click=${() => this.ask(t.label, t)}>${pattern(t.icon) ? this.renderIcon(t, 12) : nothing}${t.label}</button></li>`)}</ul>`
											: nothing}
									</div>`
								: nothing}
						</div>
					</div>

					<div class="ds-prompt-row" data-ruled=${ifDefined(this.chatting ? 'true' : undefined)}>
						${this.shortcuts ? html`<kbd class="ds-prompt-key">⌘K</kbd>` : nothing}
						<input
							.value=${live(this.value)}
							type="text"
							placeholder=${this.listening ? 'Listening' : this.placeholder}
							aria-label=${this.label}
							class="ds-prompt-input"
							@input=${(e: Event) => { this.value = (e.target as HTMLInputElement).value }}
							@focus=${() => this.onFocus()}
							@blur=${() => this.onBlur()}
						>
						${this.value || this.chatting ? html`<button type="button" class="ds-prompt-press ds-prompt-key ds-prompt-clear" @click=${(e: Event) => { e.stopPropagation(); this.clear() }}>${words.clear}</button>` : nothing}
						${this.voice && this.canListen
							? html`<button type="button" aria-label=${this.listening ? 'Stop listening' : 'Ask by voice'} aria-pressed=${String(this.listening)} class="ds-prompt-press ds-prompt-mic" data-listening=${String(this.listening)} @mousedown=${(e: MouseEvent) => e.preventDefault()} @click=${(e: Event) => { e.stopPropagation(); this.listen() }}>
									${this.listening
										? html`<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" class="ds-prompt-icon-in"><rect x="1" y="1" width="8" height="8" fill="currentColor"></rect></svg>`
										: html`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>`}
								</button>`
							: nothing}
						<button type="submit" aria-label="Send message" ?disabled=${!ready} class="ds-prompt-press ds-prompt-send">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
						</button>
					</div>
				</form>
			</div>
		</div>`
	}
}

define('prompt-bar', PromptBar)
