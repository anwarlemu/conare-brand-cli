# {{brand}} design system: instructions for agents

Use this system to build {{brand}} pages and interfaces in Vue 3.5 and Nuxt 4 with Tailwind CSS 4. These
instructions work with any agent that can read text and edit project files.

## Start here

1. Read the project's instructions and package.json. Identify Nuxt or Vite, the package manager and the main
   stylesheet.
2. Read `brand/principles.md` (installed at the library site, {{registry}}) and the references of the components you
   need. The library is at {{registry}}; each item is also at {{registry}}/r/<name>.json with its files, its
   examples, what it requires and its packages.
3. Reuse the library's components and their props. Do not recreate them from screenshots.

## Install and prepare a project

Requires Node.js 20 or later. Run commands from the app's root.

```sh
bun add -d {{source}}      # or npm install --save-dev {{source}}
{{cli}} init
{{cli}} add button field dialog
```

`init` writes `<stylesheet dir>/{{bin}}/brand.css` (fonts, tokens and base styles) and `theme.css` (the Tailwind 4
theme), imports both after `@import "tailwindcss"` in the main stylesheet, copies the fonts to `public/{{bin}}/` and
writes this guide and the contract in AGENTS.md. `add` copies each item's files into the app's source folder (Nuxt 4:
`app/`), follows `@/` imports (rewritten to relative paths when the app has no `@` alias), installs the packages they
import (`lucide-vue-next`) and runs `init` once if the theme is missing. Existing files that differ are kept unless
`--overwrite` is passed. Names resolve however they are typed (`Button`, `alert-dialog`, `badge`); `{{cli}} view <name>`
prints an item's props, slots, events, examples and source, and `{{cli}} search <words>` finds one.

To restyle what the app already has, `{{cli}} apply` converts style values to the tokens and gives buttons, fields,
cards, dialogs, tables and the rest the library's look, without changing copy, markup or behavior. Name a selection to
limit it: `{{cli}} apply button card`, `{{cli}} apply /settings`, `{{cli}} apply app/pages/settings.vue`, or
`--components button --pages /settings`; `--dry-run --json` lists every file and change first.

## Compose

- Components take data through props and slots and emit events; none calls an API, reads a session or uses Nuxt-only
  code. Wire them to the app's own state and routes.
- One dark action per view (`Button variant="dark"` or `PixelButton`); secondary is the default; ghost for tools in
  rows; danger for what removes, held with `HoldButton`.
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
2. Run `{{cli}} check --json`. Exit 0 means no token violations. Fix every finding and rerun.
3. Test every interaction with mouse and keyboard, at desktop and phone widths, with reduced motion on.
4. Compare with the library's previews at {{registry}}.
