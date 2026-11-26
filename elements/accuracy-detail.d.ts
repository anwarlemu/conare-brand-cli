export interface AccuracyRow { id: string, question: string, namespace: string, conare: AccuracyHit, current: AccuracyHit, fix?: { why: string, action: string } }
export interface AccuracyHit { id: string, number: number, count: number, top: number, text: string, key: string, ok: boolean }
/**
 * <conare-accuracy-detail>
 * @fires fix The fix was pressed ({ row }).
 * @fires search Search it was pressed ({ row }).
 * @fires remove Remove question was pressed ({ row }).
 */
export declare class AccuracyDetail extends HTMLElement {
  row?: AccuracyRow | undefined;
  both: boolean;
  name?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-accuracy-detail': AccuracyDetail;
  }
}
