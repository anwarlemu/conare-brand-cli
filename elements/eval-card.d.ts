export type EvalRow = { name: string, value: number, ours?: boolean, rank?: number }
/**
 * <conare-eval-card>

 */
export declare class EvalCard extends HTMLElement {
  href: string;
  name: string;
  metric: string;
  score: number;
  rank: { n: number; of: number; word?: string; };
  rows: EvalRow[];
  max: number;
  better: "higher" | "lower";
  unit?: "%" | undefined;
  limit: number;
  linkLabel: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-eval-card': EvalCard;
  }
}
