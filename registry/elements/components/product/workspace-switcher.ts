import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { Check, ChevronsUpDown, Plus, Settings, Users } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/menu'
import '@/elements/components/ui/menu-item'
import '@/elements/components/ui/menu-label'
import '@/elements/components/ui/menu-separator'
import styles from 'virtual:tw'

// WorkspaceSwitcher.vue as <conare-workspace-switcher>: the organization switcher at the top of the sidebar
// (WorkspaceMenu.vue): the brand mark (slot `mark`, an initial tile without it), the organization in 12px medium over
// its customer and role in 11px muted, and a 264px menu of every organization the person reaches, grouped by customer
// under a label with the role tag, the current one checked and in medium. Then what goes with an organization: New
// organization (admins), its settings, its members. v-model is `value` (the current organization's id) with `input`
// and `change` events; `switching` marks the one opening while the others wait. `groups` is a JSON attribute or the
// property.
export interface WorkspaceGroup { id: string, name: string, role?: string, organizations: Array<{ id: string, name: string, default?: boolean }> }

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '·'

/**
 * @summary The organization switcher at the top of the sidebar.
 * @slot mark - The brand mark, in place of the initial tile.
 * @fires input - Another organization was picked (read `value`).
 * @fires change - Another organization was picked (read `value`).
 * @fires create - New organization was chosen.
 */
export class WorkspaceSwitcher extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		groups: { type: Array },
		admin: { type: Boolean },
		switching: {},
		error: {},
		settingsHref: { attribute: 'settings-href' },
		membersHref: { attribute: 'members-href' },
		value: {},
	}

	groups: WorkspaceGroup[] = []
	/** Shows New organization and Invite members. */
	admin = false
	/** The organization opening; the others wait. */
	switching?: string
	error?: string
	settingsHref = '#'
	membersHref = '#'
	/** The current organization's id. */
	value = ''

	private choose(id: string) {
		if (id !== this.value && !this.switching) this.commit(id)
	}

	render() {
		const menu = tag('menu')
		const item = tag('menu-item')
		const label = tag('menu-label')
		const sep = tag('menu-separator')
		let where: { org: WorkspaceGroup['organizations'][number], group: WorkspaceGroup } | undefined
		for (const g of this.groups) {
			const o = g.organizations.find((x) => x.id === this.value)
			if (o && !where) where = { org: o, group: g }
		}
		const several = this.groups.length > 1
		const muted = { size: 14, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } }
		return html`${staticHtml`<${menu} data-ds="workspace-switcher" label="workspaces" offset="8px" class="!flex h-full w-full">
			<button slot="trigger" type="button" class="relative isolate flex h-full w-full cursor-pointer items-center gap-2 px-3 text-left before:absolute before:inset-x-2 before:inset-y-1.5 before:-z-10 before:transition-colors before:duration-120 before:ease-standard hover:before:bg-edge/45 aria-expanded:before:bg-edge/45 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus">
				<slot name="mark"><span class="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">${initial(where?.org.name ?? '')}</span></slot>
				<span class="min-w-0 flex-1">
					<span class="block translate-y-[0.5px] truncate text-meta leading-3 font-medium">${where?.org.name ?? ' '}</span>
					<span class="mt-px block translate-y-[0.5px] truncate pb-0.75 -mb-0.75 text-caption leading-2.5 text-fg-muted">${where?.group.name ?? ' '}${where?.group.role ? ` · ${where.group.role}` : nothing}</span>
				</span>
				${icon(ChevronsUpDown, 'chevrons-up-down', { size: 14, strokeWidth: 1.5, class: 'mr-0.75 shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}
			</button>
			${this.groups.map((g) => staticHtml`<${label}>
				<span class="truncate">${g.name}</span>
				${(several || g.role) && g.role ? html`<span class="shrink-0 border border-edge px-1 text-caption leading-4">${g.role}</span>` : nothing}
			</${label}>
			${g.organizations.map((o) => staticHtml`<${item} ?current=${o.id === this.value} ?disabled=${!!this.switching && this.switching !== o.id} @select=${() => this.choose(o.id)}>
				<span class="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">${initial(o.name)}</span>
				<span class="min-w-0 flex-1 truncate">${o.name}</span>
				${this.switching === o.id ? html`<span class="type-meta text-fg-muted">opening</span>` : o.default ? html`<span class="type-meta text-fg-muted">default</span>` : nothing}
				${o.id === this.value ? icon(Check, 'check', { size: 14, strokeWidth: 1.5, class: 'shrink-0', attrs: { 'aria-label': 'current' } }) : nothing}
			</${item}>`)}`)}
			<${sep}></${sep}>
			${this.admin ? staticHtml`<${item} @select=${() => this.emit('create')}>${icon(Plus, 'plus', muted)}New organization</${item}>` : nothing}
			<${item} href=${this.settingsHref}>${icon(Settings, 'settings', muted)}Organization settings</${item}>
			<${item} href=${this.membersHref}>${icon(Users, 'users', muted)}${this.admin ? 'Invite members' : 'Members'}</${item}>
			${this.error ? html`<p class="px-3 py-1 type-meta text-fg-danger" role="alert">${this.error}</p>` : nothing}
		</${menu}>`}`
	}
}

define('workspace-switcher', WorkspaceSwitcher)
