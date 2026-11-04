import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'

// The reading direction a Direction wrapper provides to what is inside it, so a component can flip what it draws
// (an arrow, a slide) for right-to-left text. Outside any wrapper it reads `ltr`.
export type Dir = 'ltr' | 'rtl'
export const DIRECTION: InjectionKey<ComputedRef<Dir>> = Symbol('ds-direction')

export function useDirection() {
  return inject(DIRECTION, computed<Dir>(() => 'ltr'))
}
