import type { InjectionKey } from 'vue'

// What an Accordion gives its items: whether a value is open, and the press that opens or closes it.
export type AccordionContext = { isOpen: (v: string) => boolean, toggle: (v: string) => void }
export const accordionKey: InjectionKey<AccordionContext> = Symbol('accordion')
