# conare-ds

Components, design tokens and checks for building Conare pages and interfaces in any web stack: Vue and Nuxt, React
and Next.js, Svelte, Astro, Angular, Solid, plain HTML and server-rendered templates (Rails, Laravel, Django, PHP), on
Tailwind 4, Tailwind 3 or no Tailwind. Every component is ported from Conare's own console and website (conare-web,
branch `agencidev/console`) and comes in three flavors that render identically: Vue, React, and web components that
need no build step. Each is shown on the library site from the files apps install.

Library site: https://conare-ds.agencidev.com (the `apps/www` Nuxt app in this repository).

## Use it in an app

Requires Node.js 20 or later. It works in any web stack, read from the app's own files:

| Stack | Where the brand stylesheet goes | Pages it reads | Library flavor |
| --- | --- | --- | --- |
| Nuxt 4, Vite + Vue | imported by the main stylesheet | Nuxt `pages/`, Vue Router routes | Vue |
| Next.js 16 (App and Pages Router, `src/` or not) | imported by `globals.css` (or the root layout) | `app/**/page.tsx`, `pages/` | React |
| Vite + React 19, React Router 7 / Remix | imported by `index.css` / `app.css` | `app/routes.ts`, flat routes, `<Route>` and `createBrowserRouter` | React |
| SvelteKit, Vite + Svelte 5 | imported by the root layout's stylesheet, else linked from `app.html` | `src/routes/**/+page.svelte` | web components |
| Astro 5 | imported by the layout's stylesheet, else linked from the layouts | `src/pages/` | web components |
| Angular 20 | imported by `styles.css` (angular.json) | `app.routes.ts` (component, loadComponent) | web components |
| Solid | imported by `index.css` | `<Route path component>` | web components |
| Plain HTML (no package.json) | linked from every page's `<head>` | each `.html` page | web components |
| Rails (ERB) | linked from `layouts/application.html.erb` | `config/routes.rb`, `app/views/<controller>/<action>` | web components |
| Laravel (Blade) | imported by `resources/css/app.css` (Vite), else linked from the layouts | `routes/web.php` (`view()`, `Route::view`) | web components |
| Django, Jinja | linked from `base.html` (served from `/static/`) | `urls.py` (views, `TemplateView`) | web components |
| PHP, Handlebars, EJS, Liquid, Twig, Nunjucks | linked from the partial or layout with the `<head>` | each page file, includes and partials followed | web components |

Tailwind 4 gets the theme (`theme.css`, imported after `@import "tailwindcss"`); Tailwind 3 gets a preset wired into
its config (`tailwind-preset.cjs`: the same utilities, reading the brand's CSS variables); an app with no Tailwind gets
`kinds.css`, the library's look as plain classes (`ds-button`, `ds-button-secondary`, `ds-input`, `ds-card`,
`ds-table-th`...), and its raw CSS values become `var(--ds-*)`. Where something genuinely cannot work (Tailwind 2, a
folder with no app), every command stops before writing and says what to do. When it cannot edit a layout safely,
`init` prints the exact `<link>` lines.

```sh
npm install -D github:anwarlemu/conare-brand-cli#release   # or bun add -d / pnpm add -D
npx conare-ds apply --dry-run                               # every file it would touch, and why
npx conare-ds apply                                         # restyle the whole app
npx conare-ds add button field dialog                       # components by name, in the app's flavor
npx conare-ds view button                                   # how to use one: props, events, slots, examples, source
```

An app with no package.json (Rails, Django, PHP, a plain site) runs it from anywhere with `--cwd <app>` (for example
`npx -p github:anwarlemu/conare-brand-cli#release conare-ds apply --cwd .`). In a monorepo, install it in the app
(`cd apps/web`) or at the root and pass `--cwd apps/web`; packages install with the workspace's manager.

### Restyle an app: the whole of it, or what you name

`apply` restyles: it converts style values by role (Tailwind palette and arbitrary classes, raw colors, radii, type
sizes, durations, easings and shadows) in every file type: Vue (templates, bound classes, `<style>`), JSX and TSX
(`className` and Solid's `class`, `cn()`/`clsx`/`cva`/`tv` strings, style objects, CSS modules), Svelte (`class`,
`class:` directives, `<style>`), Astro (`class`, `class:list`, frontmatter, `<style>`), Angular (templates,
`[class]`, `[ngClass]`, `[class.x]`, inline templates and component styles), HTML and server templates (ERB, Blade,
Django and Jinja, PHP, Handlebars, EJS, Liquid, Twig), and CSS, SCSS, Less and PostCSS. It gives the app's own buttons,
fields, selects, checkboxes, cards, dialogs, badges, tables, tabs, links, labels, alerts and headings the library's
look (its `Button.tsx` or `button.svelte`, a raw `<button>`, shadcn's `buttonVariants`, shadcn-svelte's `tv()`,
Angular Material's `mat-card`, a Bootstrap `.btn`), installs the stylesheet, theme and fonts (what `init` does) and
points shadcn's theme variables at the brand. Template code (`<%= %>`, `{{ }}`, `{% %}`, `<?php ?>`, `{expr}`) is
never changed; where it decides which classes apply, the classes around it change value for value and nothing moves.
It never changes copy, elements, attributes other than `class` and `style`, structure or behavior: every file is
compared before and after with its style values blanked, and a file that would differ in anything else (or does not
parse) is left as it is and reported. Components (`<Layout>`, `<x-card>`) never get a class attribute.

```sh
npx conare-ds apply                                    # the whole app
npx conare-ds apply button card dialog                 # those kinds wherever the app uses them (Button, alert-dialog, badge: any case or dashes)
npx conare-ds apply /settings /billing                 # pages by route, in any stack above
npx conare-ds apply src/app/settings/page.tsx          # pages by file, or a glob in quotes: 'app/views/pages/*.html.erb'
npx conare-ds apply PrimaryButton                      # one of the app's own components, by name
npx conare-ds apply --components button,card --pages /settings   # explicit; both together = buttons and cards on that page
npx conare-ds apply /settings --with-shared            # also the layouts and components other pages share
npx conare-ds apply ... --dry-run --json               # { files: [{ file, reason, changes }] }, nothing written
npx conare-ds apply --redo                             # repeat the recorded scope
```

A page scope is the page file and the components only it uses; components other pages or the layout also use are
left out and listed (name them or pass `--with-shared`). A router file that imports every page does not make the
pages shared. A kind scope restyles only the app components of that kind and the elements of that kind, across the
app. A target that matches nothing (a route, a file, a kind, a component) stops the run with the closest names. The
scope is recorded in `.ds/state.json`: a later `apply <more>` widens it, a bare `apply` makes it the whole app, and
`check` checks only the files in it, so a partial adoption passes. On a plain site, where each page has its own
`<head>`, a page selection links the brand stylesheet from that page only.

### The library by name

The library comes in three flavors: Vue (Vue and Nuxt apps), React (Next.js, Vite + React, React Router) and web
components (everything else: framework-free custom elements with their styles inside, loaded with one `<script>`).
`add` picks the flavor from the app; `--framework vue|react|elements` overrides it. The Vue and React components are
styled with the theme's Tailwind utilities, so in an app without Tailwind `add` stops and points at
`--framework elements`.

| Command | What it does |
| --- | --- |
| `add <item...>` | Copies each item and the items it requires into the app in its flavor. Vue: into the source folder (Nuxt 4: `app/`, Vite: `src/`). React: `components/` and `lib/` in the source folder, `@/react/...` imports through the app's alias (`@/`, `~/`) or made relative, packages (`lucide-react`) installed with the app's manager. Web components: the prebuilt modules and their shared chunk into `<static folder>/conare-ds/elements/`, and the `<script type="module">` line to put on the pages that use them (`/static/...` in Django). Names resolve however they are typed: `Button`, `alert-dialog`, `AlertDialog`, shadcn names such as `badge` (tag) or `dropdown-menu` (menu), and file names such as `Input` (field). Files that differ locally are kept unless `--overwrite`. `--dry-run`, `--no-install`. |
| `view <item...>` (or `show`) | What the item is for and never for, the install line, how to import it (or load it, for web components), each component's props (properties and events for web components; callbacks and children for React), `v-model`s and slots, and its first example, in the app's flavor; `--source` adds every example and the exact source; `--framework` shows another flavor; `--json` for agents. |
| `search <words>` | Items ranked by name, alias and what they do, with their flavors. |
| `list [--json]` | Every item, its group, its flavors, what it requires and its packages. |
| `diff <item...>` | Your copy of each file against the library's, in the app's flavor (exit 1 when one differs). |
| `info` | The app's stack, flavor, source and static folders, alias, package manager, Tailwind version, stylesheet and layouts, installed items (and which changed locally), the applied scope and what to run next. |
| `init` | Writes `brand.css` (fonts, tokens, and the base layer scoped to the library's components, page-wide after a whole-app `apply`) with `theme.css` (Tailwind 4), a Tailwind 3 preset or `kinds.css` (no Tailwind), where the app loads its styles: beside the main stylesheet and imported by it when a build processes it, else in the static folder and linked from every base layout. Copies the fonts and textures to `<static folder>/conare-ds/`, writes `.ds/agent-guide.md` and the contract into `AGENTS.md`. Idempotent. |
| `check [paths...]` | The value check over styles, markup and template files of every type above and scripts: raw colors, Tailwind palette and arbitrary colors, radii and type sizes off the scale, durations off the motion steps, `transition-all`, `ease-in`, custom easings, shadows, bold weights, unknown `--ds-*` tokens and icon packs other than Lucide. Exit 1 on findings; `--fix` applies exact token replacements; `--all` checks every file when a scope is recorded; `--json`. A `ds-override: <reason>` comment on the line above skips a finding. |
| `hook` | For an agent's edit hook (Claude Code `PostToolUse`, Codex, Cursor `afterFileEdit`): reads the edit payload on stdin, checks the files it names (inside the applied scope), and exits 2 with the findings on stderr so the agent fixes them. Register it as the hook command `npx conare-ds hook`. |
| `tokens [term...]` | Finds tokens by name or value. |

All commands take `--cwd <dir>` and `--json`; an unknown option is an error, never ignored.

### What reaches the rest of the app

Only a whole-app `apply` installs the brand's base layer (the page's background, body type and color, heading font,
hairline borders and focus ring on every element). A selection, a plain `add` and `init` install the tokens, the
theme (or preset, or kinds.css) and the fonts, and the base reaches only:

- the library's components: every one renders `data-ds="<name>"` on its root, and the base is scoped to those roots;
- what a selection restyled: the root of each page or file it covered, and each element of a named kind, get the
  class `ds-scope`.

So pages outside a selection keep their computed styles exactly. Verified with Playwright on official scaffolds of
Next.js (App and Pages Router), Vite + React (Tailwind 3 and none), React Router 7, SvelteKit, Vite + Svelte, Astro 5,
Angular 20, Solid, Vite vanilla, a plain HTML site, Django, Express + EJS and samples of Rails and PHP: the same
computed styles on every page outside `apply /settings`, and only buttons (and the boxes they sit in, by height)
changing after `apply button`. Theme keys Tailwind or the app also defines (`font-sans`, `font-mono`,
`tracking-tight`, `ease-out`, `rounded-full`) keep the app's value outside those scopes and take the brand's inside
them; the brand's own neutrals and radius steps are `ds-neutral-*` and `rounded-ds-*`; and the brand registers its
faces under its own names (`"Geist (Conare)"`), so an app that names Inter or Geist itself keeps its own rendering.
After a whole-app apply, later selections and adds keep the full base.

## Work on it

```sh
bun install          # also prepares the docs site
bun run build        # tsc (src -> dist) and scripts/build-brand.mjs (brand -> build)
bun run registry     # validate registry/, write apps/www/public/r, value check, vue-tsc
bun run ci           # build, limits, registry (all three flavors), vitest
bun run parity       # every example in Vue, React and web components, compared in a browser
bun run --cwd apps/www build && PORT=3201 node apps/www/.output/server/index.mjs
```

`CLAUDE.md` says where everything is. `PORTING.md` is the recipe for porting an item to React and web components;
`node scripts/port-order.mjs` lists what is left, in dependency order.
