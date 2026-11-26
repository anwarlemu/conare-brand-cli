export interface Eval {
	id: string
	name: string
	description: string
	metric: string
	better: 'higher' | 'lower'
	unit?: '%'
	model: string
	score: number
	rank: { n: number, of: number, word?: string }
	rows: EvalRow[]
	/** The value a full bar stands for. */
	max: number
	disclosure?: string
}
export interface EvalRow { name: string, value: number, ours?: boolean, rank?: number, note?: string }
/**
 * <conare-eval-viz>
 * @slot title What the bar says after the mark.
 * @slot (default) The window's body.
 */
export declare class EvalViz extends HTMLElement {
  item?: Eval | undefined;
  limit: number;
  wide: boolean;
  items?: Eval[] | undefined;
  pick: number;
  runs?: number[] | undefined;
  active: boolean;
  size: "sm" | "md";
  stretch: boolean;
  relative: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-eval-viz': EvalViz;
  }
}
