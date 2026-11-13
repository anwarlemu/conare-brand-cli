import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * useCopy as a Lit controller: copy(text) writes the clipboard, and `copied` is true for 1.5s after. Where the Clipboard
 * API is refused, the older copy command still works inside the click. Only if both are refused does it answer false.
 */
export class CopyController implements ReactiveController {
	copied = false
	private timer?: ReturnType<typeof setTimeout>
	constructor(private host: ReactiveControllerHost, private ms = 1500) {
		host.addController(this)
	}
	hostDisconnected() {
		clearTimeout(this.timer)
	}
	async copy(text: string): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(text)
		} catch {
			if (!copyByCommand(text)) return false
		}
		this.copied = true
		this.host.requestUpdate()
		clearTimeout(this.timer)
		// ds-latency: the Copied label stays 1.5s after the copy, which has already happened.
		this.timer = setTimeout(() => {
			this.copied = false
			this.host.requestUpdate()
		}, this.ms)
		return true
	}
}

/** copy(text) without an element, for example scripts: the clipboard, or the copy command where it is refused. */
export async function copyText(text: string) {
	try {
		await navigator.clipboard.writeText(text)
		return true
	} catch {
		return copyByCommand(text)
	}
}

function copyByCommand(text: string) {
	// The focused element inside shadow roots, not the host, so focus goes back to the button that copied.
	let back = document.activeElement as HTMLElement | null
	while (back?.shadowRoot?.activeElement) back = back.shadowRoot.activeElement as HTMLElement
	const field = document.createElement('textarea')
	field.value = text
	field.setAttribute('readonly', '')
	field.style.position = 'fixed'
	field.style.opacity = '0'
	document.body.appendChild(field)
	field.select()
	let ok = false
	try {
		ok = document.execCommand('copy')
	} catch {
		ok = false
	}
	field.remove()
	back?.focus()
	return ok
}
