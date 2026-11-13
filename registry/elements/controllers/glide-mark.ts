import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * useGlideMark as a Lit controller: one block for a whole list (the website's Product menu highlight): it glides on
 * transform to the row under the pointer or focus, and rests on the current row (`rest`) when the pointer leaves, or
 * hides when there is none. Rows are the list's [data-glide-row] elements, in order, each positioned relative to the
 * list. The first placement doesn't glide. It settles once the host has first rendered. Draw the block with
 * <conare-glide-mark>, which uses this on its own list when it has `follow`.
 */
export class GlideMarkController implements ReactiveController {
	mark: { y: number, h: number } | null = null
	shown = false
	instant = true
	hot: number | null = null

	constructor(private host: ReactiveControllerHost, private list: () => HTMLElement | null | undefined, private rest: () => number | null) {
		host.addController(this)
	}

	hostConnected() {
		void this.host.updateComplete.then(() => this.settle())
	}

	private place(i: number | null, instantly: boolean) {
		const row = i === null ? undefined : this.list()?.querySelectorAll<HTMLElement>('[data-glide-row]')[i]
		if (!row) {
			this.shown = false
			this.hot = null
			this.host.requestUpdate()
			return
		}
		this.instant = instantly
		this.mark = { y: row.offsetTop, h: row.offsetHeight }
		this.shown = true
		this.hot = i
		this.host.requestUpdate()
	}

	/** The pointer or focus is on row `i`. */
	point = (i: number) => this.place(i, !this.shown)
	/** The pointer left the list: back to the resting row, gliding. */
	leave = () => this.place(this.rest(), false)
	/** The resting row changed: put the block there at once. */
	settle = () => this.place(this.rest(), true)
}
