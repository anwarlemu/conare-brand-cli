# conare-ds

Components, design tokens and checks for building Conare pages and interfaces in Vue 3.5 and Nuxt 4 with Tailwind 4.
Every component is ported from Conare's own console and website (conare-web, branch `agencidev/console`), takes its
data through props and slots, and is shown on the library site from the files apps install.

Library site: https://conare-ds.agencidev.com (the `apps/www` Nuxt app in this repository).

## Use it in an app

Requires Node.js 20 or later, a Nuxt 4 or Vite + Vue 3.5 app and Tailwind CSS 4 (`@tailwindcss/vite`). On Tailwind 3,
in a React app or outside an app, every command stops before writing anything and says what to do.

```sh
npm install -D github:anwarlemu/conare-brand-cli#release   # or bun add -d / pnpm add -D
npx conare-ds apply --dry-run                               # every file it would touch, and why
npx conare-ds apply                                         # restyle the whole app
npx conare-ds add button field dialog                       # components by name, ready to render
npx conare-ds view button                                   # how to use one: props, slots, examples, source
```

In a monorepo, install it in the app (`cd apps/web`) or at the root and pass `--cwd apps/web`; packages install with
the workspace's manager.

### Restyle an app: the whole of it, or what you name

`apply` restyles: it converts style values by role (Tailwind palette and arbitrary classes, raw colors, radii, type
sizes, durations, easings and shadows, in templates, bound classes, `<style>` blocks, CSS files and class strings in
scripts) to the brand's tokens, gives the app's own buttons, fields, selects, checkboxes, cards, dialogs, badges,
tables, tabs, links, labels, alerts and headings the library's look (its `Button.vue`, a raw `<button>`, a shadcn-vue
`buttonVariants`), installs the theme and fonts (what `init` does) and points shadcn-vue's theme variables at the
brand. It never changes copy, elements, attributes other than `class` and `style`, structure or behavior: every file
is compared before and after with its style values blanked, and a file that would differ in anything else is left as
it is and reported.

```sh
npx conare-ds apply                                    # the whole app
npx conare-ds apply button card dialog                 # those kinds wherever the app uses them (Button, alert-dialog, badge: any case or dashes)
npx conare-ds apply /settings /billing                 # pages by route (Nuxt pages/, or Vue Router routes it can read)
npx conare-ds apply app/pages/settings.vue             # pages by file, or a glob in quotes: 'src/views/{Settings,About}View.vue'
npx conare-ds apply PrimaryButton                      # one of the app's own components, by name
npx conare-ds apply --components button,card --pages /settings   # explicit; both together = buttons and cards on that page
npx conare-ds apply /settings --with-shared            # also the layouts and components other pages share
npx conare-ds apply ... --dry-run --json               # { files: [{ file, reason, changes }] }, nothing written
npx conare-ds apply --redo                             # repeat the recorded scope
```

A page scope is the page file and the components only it uses; components other pages or the layout also use are
left out and listed (name them or pass `--with-shared`). A kind scope restyles only the app components of that kind
and the elements of that kind, across the app. A target that matches nothing (a route, a file, a kind, a component)
stops the run with the closest names. The scope is recorded in `.ds/state.json`: a later `apply <more>` widens it, a
bare `apply` makes it the whole app, and `check` checks only the files in it, so a partial adoption passes.

### The library by name

| Command | What it does |
| --- | --- |
| `add <item...>` | Copies each item's files and the items and composables they import into the app's source folder (Nuxt 4: `app/`, Vite: `src/`), rewrites `@/` imports to relative paths when the app has no `@` alias, installs missing packages with the app's (or workspace's) package manager and installs the theme if it is missing. Names resolve however they are typed: `Button`, `alert-dialog`, `AlertDialog`, shadcn names such as `badge` (tag) or `dropdown-menu` (menu), and file names such as `Input` (field). Files that differ locally are kept unless `--overwrite`. `--dry-run`, `--no-install`. |
| `view <item...>` (or `show`) | What the item is for and never for, the install and import lines (and Nuxt's auto-import names), each component's props with types and defaults, `v-model`s, events and slots, and its first example; `--source` adds every example and the exact source; `--json` for agents. |
| `search <words>` | Items ranked by name, alias and what they do. |
| `list [--json]` | Every item, its group, what it requires and its packages. |
| `diff <item...>` | Your copy of each file against the library's (exit 1 when one differs). |
| `info` | The app's framework, source folder, alias, package manager, Tailwind version, stylesheet and theme, installed items (and which changed locally), the applied scope and what to run next. |
| `init` | Writes `<main stylesheet dir>/conare-ds/brand.css` (fonts, tokens, and the base layer scoped to the library's components, page-wide after a whole-app `apply`) and `theme.css` (the Tailwind 4 theme), imports both right after `@import "tailwindcss"`, copies the fonts and textures to `public/conare-ds/`, writes `.ds/agent-guide.md` and the contract into `AGENTS.md`. Idempotent. |
| `check [paths...]` | The value check over styles, Vue templates and scripts: raw colors, Tailwind palette and arbitrary colors, radii and type sizes off the scale, durations off the motion steps, `transition-all`, `ease-in`, custom easings, shadows, bold weights, unknown `--ds-*` tokens and icon packs other than Lucide. Exit 1 on findings; `--fix` applies exact token replacements; `--all` checks every file when a scope is recorded; `--json`. A `ds-override: <reason>` comment on the line above skips a finding. |
| `tokens [term...]` | Finds tokens by name or value. |

All commands take `--cwd <dir>` and `--json`; an unknown option is an error, never ignored.

### What reaches the rest of the app

Only a whole-app `apply` installs the brand's base layer (the page's background, body type and color, heading font,
hairline borders and focus ring on every element). A selection, a plain `add` and `init` install the tokens, the
theme and the fonts, and the base reaches only:

- the library's components: every one renders `data-ds="<name>"` on its root, and the base is scoped to those roots;
- what a selection restyled: the root of each page or file it covered, and each element of a named kind, get the
  class `ds-scope`.

So pages outside a selection keep their computed styles exactly (verified with Playwright in Nuxt 4 and Vite: the
same computed styles and 0% pixel difference before and after `apply /settings`, `apply button` and `add button`).
Theme keys Tailwind or the app also defines (`font-sans`, `font-mono`, `tracking-tight`, `ease-out`) keep the app's
value outside those scopes and take the brand's inside them; the brand's own neutrals and radius steps are
`ds-neutral-*` and `rounded-ds-*`; and the brand registers its faces under its own names (`"Geist (Conare)"`), so an
app that names Inter or Geist itself keeps its own rendering. After a whole-app apply, later selections and adds keep
the full base.

## Work on it

```sh
bun install          # also prepares the docs site
bun run build        # tsc (src -> dist) and scripts/build-brand.mjs (brand -> build)
bun run registry     # validate registry/, write apps/www/public/r, value check, vue-tsc
bun run ci           # build, limits, registry, vitest
bun run --cwd apps/www build && PORT=3201 node apps/www/.output/server/index.mjs
```

`CLAUDE.md` says where everything is. `PLAN.md` lists the items still to build.
