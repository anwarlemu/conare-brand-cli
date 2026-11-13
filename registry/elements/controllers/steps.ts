import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * useSteps as a Lit controller: steps that open one at a time (the console's useMoveSteps.ts). `reached` is the
 * furthest step; one step shows at a time, and any step reached opens again, so there is always a way back. state(n) is
 * what <conare-step> takes: now (open), done (reached and passed), todo (reached, folded) or next (not reached, locked).
 */
export type StepState = 'now' | 'done' | 'todo' | 'next'
export class StepsController implements ReactiveController {
	reached: number
	shown: number
	constructor(private host: ReactiveControllerHost, private start = 1) {
		this.reached = start
		this.shown = start
		host.addController(this)
	}
	hostConnected() {}
	state(n: number): StepState {
		return n === this.shown ? 'now' : n < this.reached ? 'done' : n === this.reached ? 'todo' : 'next'
	}
	reach(n: number) {
		this.reached = Math.max(this.reached, n)
		this.shown = n
		this.host.requestUpdate()
	}
	toggle(n: number) {
		this.shown = this.shown === n ? 0 : n
		this.host.requestUpdate()
	}
	/** Back to the first step, nothing reached. */
	reset() {
		this.reached = this.start
		this.shown = this.start
		this.host.requestUpdate()
	}
}
