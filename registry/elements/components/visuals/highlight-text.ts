import { html, nothing, type PropertyValues } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// HighlightText.vue as <conare-highlight-text>: the headline reveal (home.css .hl): each letter waits faint and red,
// fades up over 200ms, then settles to the heading's colour over 400ms. Lines go in order (100ms apart) and within a
// line the letters spread from the centre, or from the start on left-aligned text (40ms a letter). It plays once, when
// the heading comes on screen. `accent` is trailing characters that stay red, such as the hero's full stop. Without
// JavaScript, and with reduced motion, the text just shows. Use it once per view: a screen opened many times a day
// should not replay it; to play it again, put a new element in its place.
//
// The host is the heading's box (highlight-text.css), so a class on it (the type, the alignment) lands as one on
// <HighlightText> does, and it takes the heading's role and level from `as` (h1 to h3; p is a paragraph).
const ROLES = { h1: ['heading', '1'], h2: ['heading', '2'], h3: ['heading', '3'], p: ['paragraph', null] } as const

/**
 * @summary A heading whose letters fade up from faint red once it comes on screen.
 */
export class HighlightText extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { as: {}, text: {}, accent: {}, ready: { state: true }, on: { state: true } }

	/** The tag whose role it takes. */
	as: 'h1' | 'h2' | 'h3' | 'p' = 'h2'
	text = ''
	/** Trailing characters that stay red. */
	accent = ''
	private ready = false
	private on = false
	private internals = this.attachInternals()
	private resize?: ResizeObserver
	private io?: IntersectionObserver

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		const [role, level] = ROLES[this.as] ?? ROLES.h2
		this.internals.role = role
		this.internals.ariaLevel = level
	}

	// Group the letters into rendered lines, then give each its delay.
	private stagger = () => {
		if (this.on) return
		const chars = [...this.renderRoot.querySelectorAll<HTMLElement>('.ds-hl-char')]
		const align = getComputedStyle(this).textAlign
		const fromStart = align === 'left' || align === 'start'
		const lines: HTMLElement[][] = []
		let lastTop: number | null = null
		for (const c of chars) {
			const top = Math.round(c.getBoundingClientRect().top)
			if (lastTop === null || Math.abs(top - lastTop) > 4) lines.push([])
			lines[lines.length - 1]!.push(c)
			lastTop = top
		}
		lines.forEach((line, li) => {
			const mid = (line.length - 1) / 2
			line.forEach((c, ci) => {
				const step = fromStart ? ci : Math.abs(ci - mid)
				c.style.setProperty('--d', `${(0.1 * li + 0.04 * step).toFixed(3)}s`)
			})
		})
	}

	protected async firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		this.ready = true
		await document.fonts?.ready
		if (!this.isConnected) return
		this.stagger()
		this.resize = new ResizeObserver(this.stagger)
		this.resize.observe(this)
		this.io = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting) return
			this.io?.disconnect()
			this.resize?.disconnect()
			requestAnimationFrame(() => { this.on = true })
		}, { threshold: 0, rootMargin: '0px 0px -15% 0px' })
		this.io.observe(this)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.io?.disconnect()
		this.resize?.disconnect()
	}

	render() {
		const words = this.text.split(' ')
		const last = words.length - 1
		return html`<span class=${classMap({ 'ds-hl': true, 'ds-hl-ready': this.ready, 'ds-hl-on': this.on })}><span class="sr-only">${this.text}${this.accent}</span><span aria-hidden="true">${words.map((word, wi) => html`<span><span class="ds-hl-word">${word.split('').map((ch) => html`<span class="ds-hl-char">${ch}</span>`)}${wi === last && this.accent ? html`<span class="inline-block w-0 whitespace-nowrap">${this.accent.split('').map((ch) => html`<span class="ds-hl-char text-fg-accent-display">${ch}</span>`)}</span>` : nothing}</span>${wi === last ? '' : ' '}</span>`)}</span></span>`
	}
}

define('highlight-text', HighlightText)
