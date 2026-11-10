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
| `tokens [term...]` | Finds tokens by name or value. No match is an error. One exact token is `brand --token`. |
| `manifest` (or `describe`) | Every command, template, size, component, token and rule, for an agent. Pass `--json`. |
| `brand` | Tokens (color, type, spacing, radii, motion), fonts, logos and voice. `--section`, `--token`. `colour` is `color`. |
| `principles` | Product and website rules, with do and do-not lists. `--surface product` or `website`. |
| `component` | `list`, `inspect` and `emit` Vue for a real component, including props and states. |
| `image` | Renders an Open Graph card or a social post from a title. PNG and SVG, from the brand's type, colors and mark. |
| `video` | Short Motion JPEG MP4 clips from the tokens, faces and logos. Square, 9:16 and 16:9. |

All commands take `--cwd <dir>` and `--json`; an unknown option is an error, never ignored.

### Open Graph and social images

`image` renders a card from a title and an optional line of subtext. It uses this package's type, colors and mark, writes PNG and SVG, and does not open a browser. The same copy writes the same files, so an agent can run it in CI.

```sh
npx conare-ds image --title "The right context, on every call" --text "Store it and keep it current."
npx conare-ds image --size all --title "The right context, on every call"
npx conare-ds image --template quote --title "Search should return the passage." --by "Acme" --size square,portrait
npx conare-ds image --template frame --title "What came back" --image ./shot.png --size og,landscape --json
npx conare-ds image --list
```

| Template | What it sets |
| --- | --- |
| `headline` | The headline on its own. `--text` is refused; use `statement` for a line under it. |
| `statement` | Headline and subtext. The default. |
| `quote` | A quotation. `--by` (or `--author`) names the speaker. `--text` is not drawn. |
| `announcement` | A tag, a headline and a short line under a rule. |
| `frame` | Headline, subtext and a screenshot in a double rule. Without `--image`, a quiet stand-in of the console. |

Sizes are `og` (1200x630), `square` (1080x1080), `portrait` (1080x1350) and `landscape` (1200x675, for X and LinkedIn). `--size all` writes every size. `--ground paper` is the default; `--ground ink` is the off-black card. `--format` is `png`, `svg` or `both` (the default). `--out` is a directory (default `imagery/`), or one file when there is a single size. `--eyebrow` sets the red tag. `--image` is a PNG or JPEG for `frame`.

A headline ends in a red full stop, as the site's headlines do, including when the title is wrapped in quotes. Write the copy in sentence case. A template refuses a field it does not draw: headline refuses `--text`, `--by` and `--image`; statement and announcement refuse `--by` and `--image`; quote refuses `--text` and `--image`; frame refuses `--by`. `--text` and `--subtitle` must agree when both are set, and so must `--by` and `--author`. `--json` prints `{ template, ground, files: [{ path, format, template, size, ground, width, height }] }`. Rendered examples of each template are in `imagery/samples/`.

### The brand, the rules and the components

`manifest` (alias `describe`) is the entry point for an agent. `manifest --json` lists every command, brand section, token, principle, component, image template, video template and size, and the gaps this repository does not fill. An unknown name exits 1 and names what is allowed. The CLI does not substitute a nearby value.

```sh
npx conare-ds manifest --json
npx conare-ds brand --section color
npx conare-ds brand --token --ds-color-fg
npx conare-ds principles --surface product --json
npx conare-ds component list --group ui --json
npx conare-ds component inspect button --json
npx conare-ds component emit button --state variant:dark --json
npx conare-ds component emit field --prop label=Email
```

`brand` reads `brand/tokens.css`, `brand/brand.json`, `brand/logo` and the Voice section of `brand/principles.md`. Sections are `color`, `type`, `spacing`, `radii`, `motion`, `fonts`, `logos`, `voice` and `other`. Spacing includes space, size, layout and border; the `group` field on each token says which. Fonts are the faces named in `brand.json` and the woff2 files beside them. Logos are the files on disk, with each SVG fill matched to a token when the hex is one of the brand's. This repository has no logo clearance, minimum size or exclusion zone.

`principles --surface product` is the console: the do list, the do-not list and the rules transcribed from `brand/principles.md`. `brand/principles.md` has no website section. `principles --surface website` returns only the sentences in that file, and the comments in `brand/tokens.css`, that name the website or a brand surface outside the console.

`component list` uses the group ids `ui`, `product`, `site` and `visuals`. `inspect` returns every part and the states derived from its props: `rest`, `<prop>:<value>` for each union literal and each boolean, and `example:<Name>` for each example file. In the manifest, `parts` lists every component in the item with its states. When `part` is absent, pass `--part`. `emit` writes Vue that imports that part and sets the state's props. `example:<Name>` copies the example file unchanged. Generated markup leaves the default slot empty. A required prop with no default must be `--prop name=value`.

### Short video

`video` renders a 1.5 second clip (18 frames at 12 fps) as Motion JPEG in an MP4. The frames are the same headless SVG path as the stills: brand tokens, the vendored faces and the logo files. No browser and no system fonts. The same inputs write the same bytes. The file plays in ffprobe, ffmpeg, VLC and QuickTime. It is not H.264, so a browser video element may not play it.

```sh
npx conare-ds video --list
npx conare-ds video --template headline --size square --title "Context that stays current"
npx conare-ds video --template statement --size landscape --title "The right context, on every call" --text "Store it, keep it current, and hand it to the model."
npx conare-ds video --template announcement --size vertical --eyebrow "Now shipping" --title "Sources sync themselves" --text "Connect a source once."
npx conare-ds video --template logo --size square
```

There is no default template. Sizes are `square` (1080x1080, the default), `vertical` (1080x1920, 9:16) and `landscape` (1920x1080, 16:9). `og` is not a video size. `--ground paper` is the default; `--ground ink` is the off-black card. Headline does not draw `--text`. Logo does not draw a title, `--text` or `--eyebrow`. One sample per template, plus a PNG of its last frame, is in `imagery/samples/` (`video-<template>-<size>`).

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
