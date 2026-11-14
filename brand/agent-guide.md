# {{brand}} design system: instructions for agents

Use this system to build {{brand}} pages and interfaces in any web stack: Vue and Nuxt, React (Next.js, Vite, React
Router), Svelte and SvelteKit, Astro, Angular, Solid, plain HTML and server templates (Rails, Laravel, Django, PHP,
Liquid, Twig, Handlebars, EJS), with Tailwind 4, Tailwind 3 or plain CSS. These instructions work with any agent that
can read text and edit project files.

## Start here

1. Read the project's instructions, then run `{{cli}} info`: it names the stack, the library flavor (Vue, React or web
   components), the package manager, Tailwind's version (or none), the main stylesheet and the layouts.
2. Read `brand/principles.md` (installed at the library site, {{registry}}) and the references of the components you
   need. The library is at {{registry}}; each item is also at {{registryHost}}/r/<name>.json with its files, its
   examples, what it requires and its packages.
3. Reuse the library's components and their props. Do not recreate them from screenshots.

## Install and prepare a project

Requires Node.js 20 or later. Run commands from the app's root (an app with no package.json, such as Rails, Django or
a plain site, runs them with `--cwd <app>`).

```sh
bun add -d {{source}}      # or npm install --save-dev {{source}}
{{cli}} init
{{cli}} add button field dialog
```

`init` writes `brand.css` (fonts, tokens, and base styles scoped to the library's components; a whole-app `apply`
makes them page-wide) where the app loads its styles: beside the main stylesheet and imported by it when a build
processes it (Vite, Next, Angular, SvelteKit, Astro, Laravel's Vite, Tailwind's CLI), else in the static folder and
linked from every base layout (`index.html`, `application.html.erb`, `base.html`, the PHP header). With Tailwind 4 it
adds `theme.css` (the utilities); with Tailwind 3 a preset wired into the config; with no Tailwind `kinds.css` (the
library's look as `ds-*` classes). It copies the fonts to `<static folder>/{{bin}}/` and writes this guide and the
contract in AGENTS.md. `add` copies each item in the app's flavor: Vue and React files into the source folder with
their library imports made to resolve there (and their packages installed, such as `lucide-react`), web components as
prebuilt modules into `<static folder>/{{bin}}/elements/` with the `<script type="module">` line to put on the pages
that use them. It runs `init` once if the stylesheet is missing. Existing files that differ are kept unless
`--overwrite` is passed. Names resolve however they are typed (`Button`, `alert-dialog`, `badge`); `{{cli}} view
<name>` prints an item's props, events, slots, examples and source in the app's flavor, and `{{cli}} search <words>`
finds one.

To restyle what the app already has, `{{cli}} apply` converts style values to the tokens and gives buttons, fields,
cards, dialogs, tables and the rest the library's look, without changing copy, markup, template code or behavior, in
every file type the stack uses (Vue, JSX, Svelte, Astro, Angular templates, HTML, ERB, Blade, Django, PHP, Liquid,
Twig, CSS). Name a selection to limit it: `{{cli}} apply button card`, `{{cli}} apply /settings`, `{{cli}} apply
<page file>`, or `--components button --pages /settings`; `--dry-run --json` lists every file and change first.

## Library flavors

`{{cli}} add` writes the app's flavor: Vue in Vue and Nuxt, React in React apps (Next, Vite, React Router), web
components everywhere else, and also in a Vue or React app without Tailwind (they carry their own styles).
`--framework vue|react|elements` picks one by name. `{{cli}} info` says which this app has. Read an item before using
it: `{{cli}} view <name>` prints its API, examples and source in the app's flavor; `{{cli}} view <name> --framework
react` (or `vue`, `elements`) shows another, and `--json` gives the same to a program. Never guess a prop or an event.

| | Vue | React | Web components |
| --- | --- | --- | --- |
| Use it | `import Button from '@/components/ui/Button.vue'` (Nuxt: `<UiButton>`) | `import { Button } from '@/components/ui/Button'` | `<script type="module" src="/{{bin}}/elements/button.js">` once per page, then `<{{elementPrefix}}-button>` |
| Data in | props | the same props | attributes, or properties for lists and objects (`el.options = [...]`) |
| Two-way value | `v-model` | `value` + `onValueChange` (`defaultValue` alone uncontrolled); `checked` + `onCheckedChange`, `open` + `onOpenChange` | the `value` property with `input` and `change` events (`checked`, `open` with `checked-change`, `open-change`) |
| Events | `@select` | `onSelect` | `addEventListener('select', ...)`; details in `event.detail` |
| Slots | `<template #actions>` | a prop (`actions={...}`) or `children`; a scoped slot is a function (`{({ id }) => ...}`) | `slot="actions"` on a child; a scoped slot is a method or a property function (`table.cells = { status: ({ value }) => node }`) |
| `title` | `title` | `title` | `heading` (`title` is HTML's tooltip) |
| Forms | native controls | native controls | fields are form-associated: their `name` and value go with the `<form>`, `required` blocks it with the browser's message, `checkValidity()` works |

React files start with `'use client'` where they need it, so a Next server component can import and render them;
pass functions (callbacks, render props) only from client components. Web components:

- Use them for every stack without a Vue or React flavor (SvelteKit, Astro, Angular, Solid, a plain page, Rails,
  Laravel, Django and other templates) and wherever there is no build step. `add` copies the modules to
  `<static folder>/{{bin}}/elements/` (rewritten on every add), prints the `<script>` lines for the pages that use them
  (Django: `{% static %}`), and writes their types (`<source>/{{bin}}/elements.d.ts`) so `<{{elementPrefix}}-button
  variant="dark">` type-checks in TSX, Svelte and Astro.
- Angular: add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to each component that uses them. Vue or Nuxt with the elements:
  `isCustomElement` for the `{{elementPrefix}}-` prefix (add sets it where the config allows). Server-rendered pages
  (Svelte, Nuxt): set list and object properties once mounted, or write them as JSON attributes.
- Their examples lay out with the theme's utility classes; on a page without Tailwind, `{{cli}} view <name>` prints
  each example with the CSS those classes need, or use your own layout. Tokens reach inside them through `var(--ds-*)`,
  and `[data-theme="dark"]` on any ancestor themes them.
- `{{cli}} add --update` brings every installed item to the package's version (files you changed are kept unless
  `--overwrite`).

## Compose

- Components take data through props and slots (children in React, slots on web components) and emit events; none
  calls an API, reads a session or uses framework-only code. Wire them to the app's own state and routes.
- One dark action per view (`Button variant="dark"`, `<{{elementPrefix}}-button variant="dark">` in the web components,
  or `PixelButton`); secondary is the default; ghost for tools in rows; danger for what removes, held with `HoldButton`.
  In an app without Tailwind, the restyled elements carry `ds-button ds-button-dark` and the like: keep those classes.
- Use the type utilities: `type-ui` (13px, the default), `type-meta` (12px), `type-caption` (11px), `type-heading-3`
  (20px Faculty Glyphic page titles), `type-code-sm` for IDs and keys. Without Tailwind: `var(--ds-text-ui)` and the
  other tokens in CSS (`{{cli}} tokens <term>` finds them).
- Colors by role: `bg-surface`, `bg-surface-subtle` (paper), `bg-surface-inverse`, `text-fg`, `text-fg-soft`,
  `text-fg-muted`, `text-fg-danger`, `border-edge`, `border-edge-strong`, `border-edge-focus` (or their `--ds-color-*`).
- Mount one toaster per app (`Toaster` with `useToast()` in Vue and React; `<{{elementPrefix}}-toaster>` and its
  `toast(title, detail)` method in the web components).

## Motion

- Hover and colour: 120ms on `ease-standard`. Small moves: 160ms on `ease-out` (the strong curve). Menus and panels in:
  200ms, out: 120ms. Dialogs: 320ms rise. Never ease-in, never `transition-all`.
- Keyboard-opened surfaces (a command palette) do not animate. Gate hover effects with `hover:` (Tailwind's hover
  variant only applies on devices that hover). Reduced motion keeps opacity only.

## Verify

1. Run the app's type check, tests and build.
2. Run `{{cli}} check --json`. Exit 0 means no token violations. Fix every finding and rerun. To check every edit as you
   make it, register `{{cli}} hook` as your edit hook (Claude Code `PostToolUse`, Cursor `afterFileEdit`): it exits 2
   with the findings for the files you just changed.
3. Test every interaction with mouse and keyboard, at desktop and phone widths, with reduced motion on.
4. Compare with the library's previews at {{registry}}.
