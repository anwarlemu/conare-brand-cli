import { nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { Pencil } from 'lucide'
import '@/elements/components/product/console-page'
import '@/elements/components/ui/button'
import '@/elements/components/ui/copy-text'
import '@/elements/components/ui/input'
import '@/elements/components/ui/line-tabs'
import '@/elements/components/ui/pixel-button'
import '@/elements/components/ui/switch'
import '@/elements/components/ui/table'
import '@/elements/components/ui/tag'
import styles from 'virtual:tw'

// SettingsPage.vue as <conare-settings-page>: settings (pages/dashboard/settings, SettingsFrame take 3): one title and
// its parts as line tabs under it, switching in place. Every part is the settings table, so a tab changes what it says
// and not how it looks. General: the company's name (Edit opens it in place: Save, Cancel or Escape), its ID to copy
// and when it joined, then who is signed in and Sign out. Members: who is in, their role and when they joined, with
// Invite members, the page's one dark button, on the tabs' row. Sign-in: each way in with its switch. It calls
// nothing: rename (detail: the name), invite, remove (detail: the member), toggle (detail: { id, on }) and sign-out
// are events; `pane` is the open tab (Vue's v-model:part, with `change`). The root is console-page's, named
// settings-page.
export type SettingsPart = 'general' | 'members' | 'sign-in'
export type SettingsMember = { email: string, role: string, joined: string, invited?: boolean }
export type SignInOption = { id: string, label: string, description: string, on: boolean }
const PARTS: { value: SettingsPart, label: string }[] = [{ value: 'general', label: 'General' }, { value: 'members', label: 'Members' }, { value: 'sign-in', label: 'Sign-in' }]

/**
 * @summary Settings: General, Members and Sign-in as line tabs, each a settings table.
 * @fires change - The tab changed (read `pane`).
 * @fires rename - The company's name was saved; detail is the name.
 * @fires invite - Invite members was pressed.
 * @fires remove - Remove was pressed on a member; detail is the member.
 * @fires toggle - A way in was turned; detail is { id, on }.
 * @fires sign-out - Sign out was pressed.
 */
export class SettingsPage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { company: { type: Object }, members: { type: Array }, signIn: { type: Array, attribute: 'sign-in' }, email: {}, pane: {}, editing: { state: true }, draft: { state: true } }

	company = { name: '', id: '', joined: '' }
	members: SettingsMember[] = []
	signIn: SignInOption[] = []
	/** Who is signed in. */
	email = ''
	/** The open tab: general, members or sign-in (Vue's v-model:part; `part` is HTML's). */
	pane: SettingsPart = 'general'
	private editing = false
	private draft = ''
	private renameId = uid('rename')

	private pick(event: Event) {
		event.stopPropagation()
		if (event.type !== 'change') return
		this.pane = (event.currentTarget as HTMLElement & { value: SettingsPart }).value
		this.emit('change')
	}
	private async edit() {
		this.draft = this.company.name
		this.editing = true
		await this.updateComplete
		;(this.renderRoot.querySelector(`[id="${this.renameId}"]`) as HTMLElement | null)?.focus()
	}
	private save(event: SubmitEvent) {
		event.preventDefault()
		const name = this.draft.trim()
		if (!name) return
		this.editing = false
		this.emit('rename', name)
	}
	private toggle(event: Event, id: string) {
		event.stopPropagation()
		if (event.type !== 'change') return
		this.emit('toggle', { id, on: (event.currentTarget as HTMLElement & { checked: boolean }).checked })
	}

	private general() {
		const [table, input, pixel, button, copy] = [tag('table'), tag('input'), tag('pixel-button'), tag('button'), tag('copy-text')]
		const name = this.editing
			? staticHtml`<form class="flex flex-wrap items-center justify-end gap-2" @submit=${this.save}><span class="block w-56 max-w-full"><${input} id=${this.renameId} .value=${this.draft} maxlength="100" aria-label="new name" required @input=${(e: Event) => { this.draft = (e.target as HTMLElement & { value: string }).value }} @keydown=${(e: KeyboardEvent) => { if (e.key === 'Escape') this.editing = false }}></${input}></span><${pixel} type="submit" ?disabled=${!this.draft.trim()}>Save</${pixel}><${button} variant="ghost" @click=${() => { this.editing = false }}>Cancel</${button}></form>`
			: staticHtml`<span class="inline-flex max-w-full items-center justify-end gap-2"><span class="truncate">${this.company.name}</span><${button} variant="ghost" icon aria-label="rename company" @click=${() => this.edit()}>${icon(Pencil, 'pencil', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}></span>`
		return staticHtml`<div class="flex flex-col gap-4"><${table} variant="settings" framed><table><thead><tr><th>Company</th><th><span class="sr-only">Value</span></th></tr></thead><tbody><tr><td class="whitespace-nowrap text-fg-muted">Name</td><td class="text-right">${name}</td></tr><tr><td class="whitespace-nowrap text-fg-muted">Company ID</td><td class="text-right"><span class="inline-flex max-w-full justify-end"><${copy} value=${this.company.id} label="company id"></${copy}></span></td></tr><tr><td class="whitespace-nowrap text-fg-muted">Joined</td><td class="text-right">${this.company.joined}</td></tr></tbody></table></${table}><div class="flex items-center justify-between gap-3 type-ui"><span class="flex min-w-0 items-center gap-3"><span class="whitespace-nowrap text-fg-muted max-sm:hidden">Signed in as</span><span class="truncate">${this.email}</span></span><${button} variant="danger" class="w-23 shrink-0" @click=${() => this.emit('sign-out')}>Sign out</${button}></div></div>`
	}

	private people() {
		const [table, badge, button] = [tag('table'), tag('tag'), tag('button')]
		return staticHtml`<${table} variant="settings" framed><table><thead><tr><th>Member</th><th class="w-32 max-sm:hidden">Role</th><th class="w-32 max-md:hidden">Joined</th><th class="w-px"><span class="sr-only">Actions</span></th></tr></thead><tbody>${this.members.map((m) => staticHtml`<tr><td class="max-w-0"><span class="block truncate" title=${m.email}>${m.email}</span><span class="block type-meta text-fg-muted sm:hidden">${m.role}</span></td><td class="max-sm:hidden"><span class="flex items-center gap-1"><${badge} tone="quiet">${m.role}</${badge}>${m.invited ? staticHtml`<${badge} tone="quiet">invited</${badge}>` : nothing}</span></td><td class="whitespace-nowrap text-fg-muted max-md:hidden">${m.joined}</td><td class="text-right"><${button} aria-label=${`remove ${m.email}`} @click=${() => this.emit('remove', m)}>Remove</${button}></td></tr>`)}</tbody></table></${table}>`
	}

	private ways() {
		const [table, toggle] = [tag('table'), tag('switch')]
		return staticHtml`<${table} variant="settings" framed><table><thead><tr><th class="w-px"><span class="sr-only">On</span></th><th>Sign-in</th></tr></thead><tbody>${this.signIn.map((o) => staticHtml`<tr><td><${toggle} ?checked=${o.on} label=${o.label} @input=${(e: Event) => this.toggle(e, o.id)} @change=${(e: Event) => this.toggle(e, o.id)}></${toggle}></td><td><span class="block">${o.label}</span><span class="block type-meta text-fg-muted">${o.description}</span></td></tr>`)}</tbody></table></${table}>`
	}

	render() {
		const [page, tabs, pixel] = [tag('console-page'), tag('line-tabs'), tag('pixel-button')]
		const body = this.pane === 'general' ? this.general() : this.pane === 'members' ? this.people() : this.ways()
		return staticHtml`<${page} data-ds="settings-page" .rootName=${'settings-page'} heading="Settings"><div class="flex flex-wrap items-end justify-between gap-3"><div class="min-w-0 flex-1"><${tabs} .value=${this.pane} .options=${PARTS} label="settings" @input=${this.pick} @change=${this.pick}></${tabs}></div>${this.pane === 'members' ? staticHtml`<${pixel} class="shrink-0" @click=${() => this.emit('invite')}>Invite members</${pixel}>` : nothing}</div>${body}</${page}>`
	}
}

define('settings-page', SettingsPage)
