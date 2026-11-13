# Porting an item to React and web components

Every item exists in Vue (`registry/components`, the source of truth) and gets two ports that render identically:
React (`registry/react`) and a web component (`registry/elements`, Lit). The pilots show every pattern: button
(PixelButton, HoldButton), field, dialog, tabs, card, menu, toast, popover, switch and scope-menu (Select, Combobox,
ScopeMenu). Read the pilot nearest to your item before you start; copy its shape.

## What you may touch

A port creates only its own item's files. Several agents run at once, so nothing else changes:

| Yours (create) | Not yours (ask in your report) |
| --- | --- |
| `registry/react/components/<group>/<Name>.tsx` for each Vue file the item lists | `registry/react/lib/*`, `registry/react/hooks/useControllable.ts` |
| `registry/react/examples/<item>/<Example>.tsx` for each example | `registry/elements/lib/*` (the shared chunk) |
| `registry/elements/components/<group>/<name>.ts` (and `<name>.css`) per Vue file | `scripts/*`, `apps/parity/src/*`, `apps/www/*`, `brand/*` |
| `registry/elements/examples/<item>/<Example>.html` for each example | `package.json`, `tsconfig*`, other items' files, Vue files |
| `apps/parity/interactions/<item>.mjs` | `registry/docs/*.md` (except adding `react_files`/`elements_files`, see below) |
| the hook and controller for a composable your item owns (table below) | |

A composable's ports are created by one item and reused by the rest (`node scripts/port-order.mjs` prints the table):
useAccordion: accordion, useCellBurst: cell-burst, useChart: chart, useDirection: direction, useDocumentDownload:
document-download, useForm: form, useGlideMark: glide-mark, useParse: parse-page, useSearchResults: search-results,
useSheet: sheet, useSteps: steps. Already ported: useCopy, usePixelGrid, useMenu, useToast, usePopover (React hooks;
for elements: `controllers/copy.ts`, `controllers/pixel-grid.ts`, menu logic in `menu.ts`, the toast store in
`toaster.ts`, popovers in `lib/popover.ts`).

Order: `node scripts/port-order.mjs` lists the remaining items in waves; an item comes after every item it or its
examples use (its React and element files import theirs). Items joined by `+` (loader + tag) need each other: one agent
ports both. Items in one wave run in parallel.

If your item needs a change to a shared file (a token, a helper in `lib/`, a prop on another item's component), do not
make it: work around it inside your files if you can, and put the exact change in your report.

## The loop for one item

```sh
bun install && bun run build                      # once
bun run registry                                  # builds every flavor, checks values, type-checks Vue, React, elements
node scripts/check-parity.mjs <item> [<item>...]  # builds the docs site if needed, compares every example
open apps/parity/report/report.html               # the screenshots, diffs and differences
bun run ci                                        # must pass before you commit
```

`check-parity` flags: `--flavor react|elements`, `--width 1440|390`, `--no-build` (reuse apps/www/.output),
`--out <dir>` (use your own when several agents run it). It serves the docs site on 3350 and the parity app on 3351; give other ports with `--www-port` and
`--parity-port` when several agents run it at once (stay in your assigned range). It fails an example when more than
0.5% of its pixels differ from Vue's at 1440 or 390, when any element with `data-ds` has a different computed style or
box (in flat-tree order, through shadow roots), when the keyboard trail differs, or when the page logs an error.

Pass means: `bun run registry` clean, and every example of the item `ok` in both flavors at both widths with your
interaction steps. Look at the screenshots yourself; a blank example passes against a blank example.

### Interaction steps

`apps/parity/interactions/<item>.mjs` exports the steps a person takes; after each, focus (role, name, `data-ds`) and
state (open dialogs, menus, `aria-expanded`, `aria-selected`, `aria-checked`, `data-active`) are compared with Vue's,
and `shot: true` diffs the pixels too. Six Tabs from the page as it loads always run first.

```js
export default [
	{ example: 'Product', click: 'role=button[name="Settings"]', wait: 500, shot: true, label: 'a click opens it' },
	{ key: 'ArrowDown' }, { type: 'eu' }, { hover: 'role=menuitem[name=/Invite/]', shot: true },
	{ hold: 'role=button[name="hold to revoke"]', ms: 1500 }, { focus: '...', down: 'Space', wait: 1400 },
	{ clickAt: [8, 8] }, { reload: true, focus: '...' },
]
```

Use role selectors (`role=button[name="..."]`, `role=option[name="EU"]`): they find the same control in all three
flavors, inside shadow roots too. Cover what the Vue file handles: every key it listens to, hover, press, open and
close, Escape and focus return, form submission. Steps that fail to find their target are reported, not skipped.

## Vue to React

The file mirrors the Vue file line for line: same comments (adjusted), same class strings, same DOM.

| Vue | React |
| --- | --- |
| `components/ui/Button.vue` | `react/components/ui/Button.tsx`, `export function Button` and `export default Button` |
| `composables/useX.ts` | `react/hooks/useX.ts` |
| `import X from '@/components/ui/X.vue'` | `import { X } from '@/react/components/ui/X'` (only `@/react/...`, never relative) |
| `lucide-vue-next`, `:size="14" :stroke-width="1.5"` | `lucide-react`, `size={14} strokeWidth={1.5}` |
| `defineProps` with `withDefaults` | an exported `<Name>Props` interface, defaults in the destructuring (the API reader uses both) |
| `defineModel()` (v-model) | `value`, `defaultValue`, `onValueChange` via `useControllable` |
| boolean v-model (switch, checkbox, toggle) | `checked`, `defaultChecked`, `onCheckedChange` |
| `defineModel('open')` | `open`, `defaultOpen`, `onOpenChange` |
| `emit('select', x)` | `onSelect?: (x) => void` |
| default slot | `children` |
| named slot `#actions` | a `ReactNode` prop `actions` |
| scoped slot `v-slot="{ id }"` | a render function: `children?: ReactNode \| ((slot) => ReactNode)` (Field) or `option?: (slot) => ReactNode` (Combobox) |
| `$slots.foot` | the prop is truthy |
| `class` falling through to the root | `className` appended with `cn(...)` (no tailwind-merge, as Vue does not merge) |
| `inheritAttrs: false` + `v-bind="$attrs"` | spread `...rest` onto the same element |
| `ref`, `computed`, `watch`, `onMounted` | `useRef`, plain expressions, `useEffect`, `useEffect(..., [])` |
| `nextTick` after a state change | an effect that runs after the render (see `useMenu`'s pending focus) |
| `provide` / `inject` | `createContext` (Menu's `MenuClose`) |
| `defineExpose` | a `ref` prop with `useImperativeHandle` (Menu) |
| `<Teleport>` | `createPortal` (PopoverPanel) |
| `<Transition name>` / `<TransitionGroup name>` | `Transition` / `TransitionGroup` from `@/react/lib/transition` (same class names) |
| `<style>` block | `const css = \`...\`` at the end of the file, rendered as `<style href="ds-<name>" precedence="ds">{css}</style>` |
| `useId()` | `useId()` |
| `data-ds="<name>"` on the root | the same, on the same element |

- Start the file with `'use client'` when it calls a hook (other than `useId`) or portals; the build enforces it.
- No Next.js, router, fetch or auth imports; data comes through props.
- React drops whitespace between elements on separate lines and Vue condenses it the same way; where Vue renders a
  space between inline elements on one line (`<span>a</span> <span>b</span>`), keep `{' '}` or the literal space.
- `aria-*` booleans: Vue renders `aria-selected="false"`; React does too for `aria-selected={false}`. Keep `|| undefined`
  where Vue has it.
- An example is a default-exported function named after the file, with the same sample data and layout classes. A
  Vue example's `ref` state becomes `useState`; `onMounted` that opens something becomes an effect (dialog Product).

## Vue to a web component

Lit, shadow DOM, one module per Vue component file, tag `<elementPrefix>-<name>` (brand.json's `elementPrefix`;
`PixelButton.vue` is `pixel-button.ts`, `<conare-pixel-button>`). The skeleton:

```ts
import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { Check } from 'lucide'
import styles from 'virtual:tw'

/**
 * @summary One line for the manifest and the docs.
 * @slot - The label.
 * @slot actions - Links or buttons at the end of the head.
 * @fires select - The row was chosen.
 */
export class Thing extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, flush: { type: Boolean }, options: { type: Array } }
	/** The title (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = ''
	flush = false
	render() {
		return html`<section data-ds="thing" class="border border-edge bg-surface">...<slot></slot></section>`
	}
}

define('thing', Thing)
```

- **Styles.** `import styles from 'virtual:tw'` is this file's sheet, compiled at build time from the class names in
  the file. Copy the Vue `<style>` block verbatim into a sibling `<name>.css` (it lands unlayered, as in Vue; `@apply`
  works there). Write every class whole: `class=${['border bg-surface', on ? 'outline' : ''].join(' ')}`, never
  `` `bg-surface${x}` `` (the build fails on a class glued to an interpolation: the scanner cannot see it).
- **The host.** By default the host is `display: contents` and the shadow root's first element is the box, with
  `data-ds`. When a Vue example puts classes on the component itself (`<Field class="max-w-90">`, `<Menu class="!flex
  h-full">`), the host must be the box: write the root's classes as `:host { @apply ... }` in `<name>.css` and drop
  the wrapper (field, menu). The page's classes on the host then win over `:host`, as a class on the Vue root does.
- **Properties.** `static properties` plus a typed field with its default (`useDefineForClassFields` is off, so this
  works with Lit). Attributes are kebab-case (`keepOpen: { attribute: 'keep-open' }`); arrays and objects are JSON
  attributes (`options='[...]'`) or set as properties. Never name a property after an `HTMLElement` member: `id`,
  `title` (use `heading`), `hidden`, `slot`, `style`, `part`, `role`, `popover`, `inert`, `lang`, `dir`, `before`,
  `after`, `remove`, `append`; `tsc` catches most. `aria-label` on the host passes to the inner control as a `label`
  property with `attribute: 'aria-label'` (button, input).
- **v-model** is `value` and `this.commit(next)`, which sets it and fires `input` and `change`. A boolean model is
  `checked` (`this.commit(next, 'checked')` fires `checked-change`); `v-model:open` is a reflected `open` with
  `open-change`. **Emits** are `this.emit('name', detail)` (bubbling, composed).
- **Slots** stay slots; `$slots.x` is `this.hasSlot('x')` (it re-renders on slotchange). A scoped slot has no
  equivalent: make it a method a subclass overrides (Combobox's `renderTrigger` and `renderOption`, used by Select and
  ScopeMenu, which `extends Combobox` with `static styles = [Combobox.styles, styles]`), or render from properties. A
  trigger the page styles (Vue's `triggerClass` plus `#trigger`) is `<button slot="trigger" class="...">` that the
  element wires (aria-expanded, click, keys); other trigger content goes in a default trigger (menu, popover).
- **Icons** inside an element: `icon(Check, 'check', { size: 14, strokeWidth: 1.5, class: 'shrink-0', attrs: {
  'aria-hidden': 'true' } })` (the same svg lucide-vue-next renders; the markup is stable, so CSS transitions on it
  run). In examples: `<i data-lucide="key-round" data-size="14" data-stroke-width="1.5" class="..." aria-hidden="true"></i>`,
  expanded at build.
- **Composables** become a Lit `ReactiveController` in `elements/controllers/<name>.ts` (`controllers/pixel-grid.ts`,
  `controllers/copy.ts`), bundled into each element that imports it. State that must be one per page (a stack of open
  panels, the toast list) lives in `lib/` (ask) or in the module that owns it (the toast store is exported from
  `toaster.js`).
- **Transitions:** `enter(el, 'ds-x')`, `leave(el, 'ds-x')` and `measure` + `move` for a group's FLIP, from
  `@/elements/lib/transition`, with the Vue CSS classes unchanged (toaster).
- **Overlays:** `PopoverController` and `popoverStyles` from `@/elements/lib/popover`. The panel stays in the
  element's shadow root and opens in the top layer (`popover="manual"`), over modal dialogs too; placement, Escape for
  the topmost panel, a press outside and focus leaving are usePopover's (popover, combobox). A dialog is a native
  `<dialog>` in the shadow root with `showModal()` (dialog).
- **Forms:** extend `DsFormElement` (ElementInternals): call `this.internals.setFormValue(...)` when the value changes,
  implement `formResetCallback` and `formDisabledCallback`, and set `delegatesFocus` so a label or `focus()` reaches
  the inner control. A button with `type="submit"` calls `this.form?.requestSubmit()`; Enter in a text field submits
  its form (input). Fields set `static dsField = true`, so a dialog starts in them.
- **ARIA across shadow roots:** a `<label for>` or `aria-describedby` cannot point into another shadow root. The
  field element names its control with `aria-label` and describes it with `aria-description`, which the control passes
  to its inner element.

### Gotchas the pilots hit

- A class string glued to `${...}` loses its utility (card's background). The build now fails on it.
- `:has(:focus-visible)` and `.panel > *` cannot see slotted content (the rows of a menu are the page's): the menu
  marks its panel `data-instant` when opened from the keyboard, and the row's own CSS gives itself `flex-shrink: 0`.
- Vue and React take a closed panel out of the page before the browser moves focus; slotted rows stay in the page, so
  Tab from a menu row lands elsewhere. The menu puts focus on its trigger itself, as Vue ends up doing.
- `offsetParent` is null across shadow roots: test visibility with `getClientRects().length` (`firstFocusable`).
- `customElements` upgrade after the module loads: example scripts `await customElements.whenDefined('conare-x')`
  before they read properties.
- A subclass's `dsName` is its own (`define` sets it): Select's trigger says `data-ds="select"`, as Vue's fallthrough
  attribute makes it.
- Text needs a wrapper to go into a named slot: `<span slot="trigger" class="contents"><i data-lucide=...></i>Settings</span>`.
- Hidden icons in examples keep their place unless `hidden` (`<i data-lucide="check" ... hidden>`), as `v-if` does.

### Examples

`registry/elements/examples/<item>/<Example>.html`: the Vue example's markup with the elements, the same layout
classes (the docs site and the parity app compile them; on a page without Tailwind the reader uses their own layout),
the same sample data, and an inline `<script type="module">` with no imports for behavior (listen for the element's
events, set properties, call methods). Start with the Vue example's comment as an HTML comment.

## Docs and the build

Nothing to add to `registry/docs/<item>.md`: the build finds the ports by name. Only when a port's files are named
otherwise, list them with `react_files:` or `elements_files:` (that is the one edit to a docs file a port may make).
The build fails on a half port (some files or examples missing), on files that belong to no item, on a React file
with hooks and no `'use client'`, on a missing `data-ds`, on Next or Vue imports, on an element that does not
`define('<file name>', ...)`, on value check findings (the same rules as Vue: tokens only, motion steps, no ease-in,
no transition-all), and on type errors (`tsconfig.registry-react.json`, `tsconfig.registry-elements.json`). It prints
the coverage; `--require-all-flavors` (release) fails while any item lacks a port.
