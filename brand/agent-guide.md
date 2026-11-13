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

## Compose

- Components take data through props and slots (children in React) and emit events (callbacks in React, DOM events
  on web components, whose `value` property and `input`/`change` events stand in for `v-model`); none calls an API,
  reads a session or uses framework-only code. Wire them to the app's own state and routes.
- One dark action per view (`Button variant="dark"`, `<{{elementPrefix}}-button variant="dark">` is the web component's form,
  or `PixelButton`); secondary is the default; ghost for tools in rows; danger for what removes, held with `HoldButton`.
  In an app without Tailwind, the restyled elements carry `ds-button ds-button-dark` and the like: keep those classes.
- Use the type utilities: `type-ui` (13px, the default), `type-meta` (12px), `type-caption` (11px), `type-heading-3`
  (20px Faculty Glyphic page titles), `type-code-sm` for IDs and keys.
- Colors by role: `bg-surface`, `bg-surface-subtle` (paper), `bg-surface-inverse`, `text-fg`, `text-fg-soft`,
  `text-fg-muted`, `text-fg-danger`, `border-edge`, `border-edge-strong`, `border-edge-focus`.
- Mount one `Toaster` per app and call `useToast()` from anywhere.

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
