import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { styleMap } from 'lit/directives/style-map.js'
import { ChevronsUpDown, LogOut, ShieldCheck } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/menu'
import '@/elements/components/ui/menu-item'
import '@/elements/components/ui/menu-separator'
import styles from 'virtual:tw'

// AccountMenu.vue as <conare-account-menu>: the person, at the foot of the sidebar (AccountMenu.vue): a black square
// for the picture, their email, and a menu that opens upward with sign-in settings and Sign out in red. Its top shows
// the credits left on a 4px meter (.v2-meter) when `credits` is given (a JSON attribute or the property); `open` fires
// each time it opens, so the app can fetch them then. `signing-out` keeps the menu open on "Signing out" while the app
// ends the session. `up="false"` opens it downward.

/**
 * @summary The person's email and account menu, at the foot of the sidebar.
 * @fires open - The menu opened.
 * @fires sign-out - Sign out was chosen.
 */
export class AccountMenu extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		email: {},
		credits: { type: Object },
		securityHref: { attribute: 'security-href' },
		signingOut: { type: Boolean, attribute: 'signing-out' },
		up: { converter: { fromAttribute: (v: string | null) => v !== 'false' } },
	}

	email = ''
	/** The credits left and their share of the plan (0 to 1). */
	credits: { left: string, share: number } | null = null
	securityHref = '#'
	/** The menu stays open on "Signing out". */
	signingOut = false
	/** Opens upward (up="false" for downward). */
	up = true

	private onOpenChange = (event: CustomEvent<{ value: boolean }>) => {
		if (event.target !== event.currentTarget) return
		if (event.detail.value) this.emit('open')
	}

	render() {
		const menu = tag('menu')
		const item = tag('menu-item')
		const sep = tag('menu-separator')
		const share = `${Math.max(0, Math.min(1, this.credits?.share ?? 0)) * 100}%`
		const credits = this.credits
			? staticHtml`<div class="flex flex-col gap-1.5 px-3.5 pt-2 pb-2.5" role="none">
					<p class="flex items-baseline justify-between gap-2"><span class="type-meta text-fg-muted">Credits left</span><span class="font-medium tabular-nums">${this.credits.left}</span></p>
					<div class="h-1 bg-edge" aria-hidden="true"><span class="block h-full bg-surface-inverse" style=${styleMap({ width: share })}></span></div>
				</div>
				<${sep}></${sep}>`
			: nothing
		return html`${staticHtml`<${menu} data-ds="account-menu" label="account" ?up=${this.up} offset="8px" width="calc(100% - 16px)" class="!flex h-full w-full" @open-change=${this.onOpenChange}>
			<button slot="trigger" type="button" class="relative isolate flex h-full w-full cursor-pointer items-center gap-2 px-3 text-left text-meta before:absolute before:inset-x-2 before:inset-y-1.5 before:-z-10 before:transition-colors before:duration-120 before:ease-standard hover:before:bg-edge/45 aria-expanded:before:bg-edge/45 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus">
				<span class="size-5 shrink-0 bg-off-black" aria-hidden="true"></span>
				<span class="min-w-0 flex-1 truncate text-left">${this.email}</span>
				${icon(ChevronsUpDown, 'chevrons-up-down', { size: 14, strokeWidth: 1.5, class: 'mr-0.75 shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}
			</button>
			${credits}
			<${item} href=${this.securityHref}>${icon(ShieldCheck, 'shield-check', { size: 14, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}Sign-in and security</${item}>
			<${sep}></${sep}>
			<${item} danger keep-open ?disabled=${this.signingOut} @select=${() => this.emit('sign-out')}>${icon(LogOut, 'log-out', { size: 14, strokeWidth: 1.5, class: 'shrink-0', attrs: { 'aria-hidden': 'true' } })}${this.signingOut ? 'Signing out' : 'Sign out'}</${item}>
		</${menu}>`}`
	}
}

define('account-menu', AccountMenu)
