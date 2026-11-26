# {{brand}} design system: instructions for agents

Use this system to build {{brand}} pages and interfaces in any web stack: Vue and Nuxt, React (Next.js, Vite, React
Router), Svelte and SvelteKit, Astro, Angular, Solid, plain HTML and server templates (Rails, Laravel, Django, PHP,
Liquid, Twig, Handlebars, EJS), with Tailwind 4, Tailwind 3 or plain CSS. These instructions work with any agent that
can read text and edit project files.

## Start here

1. Run `{{cli}} manifest --json`. That document lists every command, template, size, component, token and rule.
   `describe` is the same command. If a name is not in it, the command exits 1. Do not invent a substitute.
2. Read the project's instructions, then run `{{cli}} info`: it names the stack, the library flavor (Vue, React or web
   components), the package manager, Tailwind's version (or none), the main stylesheet and the layouts.
3. Query the brand with `{{cli}} brand --json` and the rules with `{{cli}} principles --json`. The product surface
   is the console. The website surface is only what `brand/principles.md` and the comments in `brand/tokens.css`
   already say. There is no separate website section to extend. The library is at {{registry}}; each item is also at
   {{registryHost}}/r/<name>.json with its files, its examples, what it requires and its packages.
4. Reuse the library's components. `{{cli}} component list --json`, `{{cli}} component inspect <item> --json` and
   `{{cli}} view <item> --json` return the real parts, props and states in the app's flavor. Do not recreate a
   component from a screenshot.

## I need X: which command

| I need | Run |
| --- | --- |
| A social post, share image or link preview | `{{cli}} image <layout> --headline "..." --size og,square,story` (twelve layouts; `--size all`) |
| A profile banner (X, LinkedIn, Facebook, YouTube) or profile picture | `{{cli}} image hero --headline "..." --size x-banner` (`linkedin-banner`, `facebook-cover`, `youtube`; `image avatar --size avatar`) |
| A display ad (IAB) | `{{cli}} image room --headline "..." --size ad-300x250,ad-728x90,ad-300x600,ad-320x50,ad-160x600,ad-336x280,ad-970x250` |
| A Pinterest pin, Threads or TikTok cover | `{{cli}} image <layout> --size pinterest` (`threads`, `tiktok-cover`) |
| A product or marketing card (quote, stat, launch, feature, framed screenshot) | `{{cli}} image --template quote\|statement\|announcement\|frame ...`, or the `card`, `funding`, `announce`, `feature` layouts |
| A carousel | `{{cli}} image --input carousel.json` |
| A graphic to revise in plain words | `{{cli}} design new <template> --size ...`, then `design revise <file> "bigger logo"` |
| A graphic no template anticipated | `{{cli}} design new compose --size og -o x.design.json`, then `design compose add x.design.json stat "42%" --place top-right` (blocks: `design --json` lists them) |
| A whole page from sections | `{{cli}} design page compose outline.json -o page` (Vue, React, web components and plain HTML) |
| A video call background or wallpaper | `{{cli}} image room --headline "..." --size meeting` (`desktop`, `phone-wallpaper`), or `illustrate <subject> --size WxH` for art alone |
| A slide deck (agenda, chart, timeline, comparison, team, image grid, questions...) | `{{cli}} deck --input deck.json --out deck` (`deck <slide> ...` for one) |
| A short video, loop or GIF of a layout | `{{cli}} video <layout> --headline "..." --format mp4,webm,gif --loop` |
| A logo sting, lower third, counting stat or screenshot walkthrough | `{{cli}} video logo-reveal`, `video lower-third --name "..." --role "..."`, `video stat --headline "100M+"`, `video walkthrough --image a.png,b.png` |
| A business card, letterhead, report cover, one-pager, case study, badge, name tag or certificate | `{{cli}} print <item> --headline "..." --name "..."` (`print --list`) |
| A poster, sticker sheet, tee, mug, cap, socks, notebook or lanyard | `{{cli}} merch <item> --variant red` (`merch --list`) |
| Favicons, app icons, avatars, a default share image or the icon set | `{{cli}} icons --out public` |
| An email (newsletter, announcement, receipt, password reset, signature) | `{{cli}} email <kind> --headline "..."` |
| An illustration | `{{cli}} illustrate <subject> --size 1500x500` |
| A component, section or page | `{{cli}} add <item>` (`component list`; sections include newsletter, bento, comparison-table, careers-page, not-found-page with `code="500"`) |
| Figma files | `{{cli}} figma tokens` (prints the MCP calls; never calls Figma itself) |

Kinds the brand has no source for are not made: no photos of people, no third-party logos, no invented claims.

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

## Imagery

`{{cli}} image` renders an Open Graph card or a social post at any of the shared sizes from a title. It writes PNG and SVG, using the brand's type, colors and mark. No browser, and the same copy writes the same files.

```sh
{{cli}} image --title "The right context, on every call" --text "Store it and keep it current."
{{cli}} image --list
{{cli}} image --template frame --title "What came back" --image ./shot.png --size og,landscape --json
```

Templates are `headline`, `statement` (the default), `quote`, `announcement` and `frame`. `--ground ink` is the
off-black card. `--eyebrow` sets the red tag, `--by` the name on a quote. A template refuses a field it does not
draw: headline refuses `--text`, `--by` and `--image`; statement and announcement refuse `--by` and `--image`;
quote refuses `--text` and `--image`; frame refuses `--by`. A headline ends in a red full stop. Write the copy in
sentence case. `--size all` writes every size. `--image` is a PNG or JPEG for `frame`.

`{{cli}} video` renders a 1.5 second clip, 18 frames at 12 fps, as Motion JPEG in an MP4. There is no default
template. Sizes are `square` (1080x1080, the default), `vertical` (1080x1920) and `landscape` (1920x1080). `og` is
not a video size. Templates are `headline`, `statement`, `announcement` and `logo`. Headline does not draw `--text`.
Logo does not draw a title, `--text` or `--eyebrow`. The same inputs write the same bytes. The file plays in
ffprobe, ffmpeg, VLC and QuickTime. It is not H.264.

```sh
{{cli}} video --list
{{cli}} video --template statement --size square --title "The right context, on every call" --text "Store it and keep it current."
```

`{{cli}} brand --section color` (or `type`, `spacing`, `radii`, `motion`, `fonts`, `logos`, `voice`) returns that
part of the system. `colour` is `color`. `{{cli}} brand --token --ds-color-fg` returns one token and errors on an
unknown name. Logo clearance, a minimum size and an exclusion zone are not in this repository. Do not invent them.

## Layouts, decks, layout videos, merch, illustrations and Figma

The posts tool's twelve layouts (`hero`, `brief`, `tile`, `app`, `outline`, `hatch`, `room`, `feature`, `partner`,
`funding`, `announce`, `card`) draw at every social size through `image` and `video`, and the same parts make decks,
merch and illustrations. Every color is a token, every face a brand font, the logo the brand's own file. Each command
takes `--list`, `--json` and `--help`; an unknown name exits 1 and suggests the closest one.

```sh
{{cli}} image hero --headline "Everything your agent needs to know." --size og,story
{{cli}} image room --sample --size all                        # sample copy only when asked for
{{cli}} image feature --headline "..." --image ./shot.png     # your picture in the product window, whole
{{cli}} image --input posts.json --out posts                  # { "images": [ { "template": "card", "size": ["og", "square"], "headline": "..." } ] }
{{cli}} image --input carousel.json                           # { "carousel": { "template": "card", "slides": [ { "headline": "..." } ] } }
{{cli}} deck --input deck.json --out deck                     # slides at 1920x1080, a PNG each and deck.pdf
{{cli}} video hero --headline "..." --size landscape --format both  # H.264 MP4 and VP9 WebM
{{cli}} video card --headline "..." --still                         # the settled frame as PNG (--at 0.5 for another)
{{cli}} merch tee-back --variant black                        # print files at real size, with bleed and safe area
{{cli}} illustrate stacks --size 1500x500                     # SVG of vector shapes and PNG
{{cli}} figma tokens                                          # files and the ordered Figma MCP calls
```

- `image` layouts: `--headline`, `--body`, `--badge` (its words; `--badge-style` label, pill, solid, dot or none),
  `--note` and `--page` at the foot, `--theme` white, paper, red, black or grey, `--highlight` for `*starred words*` and
  the final stop, `--partner` (a name beside the lockup; never a third-party logo), `--credit`, `--seed`. Only the copy
  passed is drawn; `--sample` fills sample copy. Sizes: og, square, portrait, story, landscape, x-banner, linkedin,
  linkedin-banner, linkedin-page, youtube, youtube-thumbnail, email, avatar (the `avatar` layout), linkedin-square,
  facebook-cover, pinterest, the IAB ads (ad-300x250, ad-336x280, ad-728x90, ad-300x600, ad-320x50, ad-160x600,
  ad-970x250), facebook (Threads and Meta feed too), meeting (a video call background), desktop, phone-wallpaper, WxH or custom with `--width` and `--height`, or
  all (Threads, TikTok and Meta names map to the shared sizes). Words, the logo and key art keep out of what each
  platform covers (the X profile picture, story bars, YouTube's crop, the person on a call, a phone's clock). `--format` png, svg, jpg, webp; `--scale 2`.
- Copy is drawn whole: it shrinks and re-wraps to a size that reads where the image is shown, then the command fails
  saying what to shorten. Characters no brand face has (emoji, CJK) are refused by name.
- `deck` slides: cover, section, agenda, statement, bullets (up to six points), stat, chart (`--data "Mon 120 | Tue
  180"`), timeline (`--items "May: ... | June: ..."`), comparison (`--left`, `--right`, `--leftItems`, `--rightItems`),
  quote, image, grid (`"images": [...]` in the deck file), team (`--people "Name, role | ..."`, no photos), qa and end,
  each on one of the layouts. Only the slots passed are drawn; a slide's needed slot missing is an error (`--sample`
  fills them where the brand has sample copy).
- `video` layouts come in the way the website moves (the label and lockup settle up, the headline's letters wait faint
  and red and settle to ink, a window arrives on the long ease-out), then hold. Every curve and duration is a motion
  token; nothing eases in. `--format gif` and `--loop` make clean loops. The clips `logo-reveal`, `lower-third` (WebM
  with a transparent ground), `stat` and `walkthrough` (`--image a.png,b.png`) use the same motion steps. It needs
  ffmpeg; `--still` does not.
- `print` documents at paper size (PDF, SVG, PNG): business-card (with bleed), letterhead-letter and -a4,
  report-cover-letter and -a4, one-pager-letter and -a4, case-study-letter and -a4, event-badge, name-tag,
  certificate. Words: `--headline --body --badge --name --role --email --phone --date --stat --quote --by --note --url`,
  only where a document has them. Use Acme or the person's own details.
- `icons`: the shipped favicons plus 192, maskable and a 1024 app icon in their colors, avatars at 400 and 800, a
  default share image, `site.webmanifest`, and the library's icons as SVG with their licence (Lucide, ISC).
- `email newsletter|announcement|receipt|password-reset|signature`: HTML tables with inline styles; `logo.png` is
  written beside them (`--asset-base` for where it is hosted).
- `merch` items: cap-front, tee-front, tee-back, hoodie-front, tote, mug-wrap, sticker (with its cut line in the SVG),
  sticker-sheet (kiss cuts), poster, poster-a3, poster-a2, poster-11x17, poster-24x36, socks, notebook and lanyard. Variants print a theme to the bleed (red, paper, ink), full-color art on a transparent ground (color) or
  one brand color (black, white, redline). Sizes are vendor conventions: confirm against the vendor's template.
- `illustrate` subjects: stack, stacks, pixels, room, tile, outline, hatch, strip, panel and scene. The rules, each
  with its source, are in `brand/illustration.md`. People, photos and third-party logos are never drawn.
- `figma` never calls Figma: `tokens` (variables in Light and Dark), `push image|slide|illustration|asset|component|page`,
  `pull <url>` and `check <files>` write files and print the MCP calls, in order. Do not call the Figma MCP tools
  without the person's go-ahead; their seat may be rate limited.

## Any layout, never only the templates

The templates are starting points, not limits. When a person asks for an arrangement no template has, make it:

- **Ads and posts from a brief:** `{{cli}} design ad brief.md` lays the brief's parts (headline, supporting line, label,
  stat, quote, search prompt, plan, offer, features, pictures, button) out on the brand's grid in its own blocks. A
  `## Layout` section says how in plain words, one row per line from the top, parts side by side split by commas:
  `headline top left`, `stat left, quote right`, `three photos in a row`, `button bottom right`. Without one it makes
  stacked, centered and two-column arrangements of every part. Each result passes the brand check and is a design file.
- **Any graphic at any size:** `{{cli}} design new compose --size <size>`, then
  `{{cli}} design compose add|move|span|remove|order <file> ...` puts any of the brand's blocks (`{{cli}} design --help`
  lists them) on any cells. `{{cli}} design revise <file> "stat on the right, bigger headline"` takes plain words.
- **A template, rearranged:** start from a template and revise or move its parts; nothing stays in the template's
  arrangement unless the person wants it.
- **Pages and sections:** `{{cli}} design page compose outline.json` builds a page from the brand's sections in any
  order, and the library's components combine freely in code.

Only the brand's rules are fixed (its colors, type, logo, contrast and clear space); the arrangement is whatever the
person asks for.

## Revising a design

When the person wants a graphic they can shape (an X banner, a post, a slide), make a design file instead of a one-off
image, and change it until they are happy:

```sh
{{cli}} design new hero --size x-banner --headline "Every answer comes back with its source" -o banner.design.json
{{cli}} design revise banner.design.json "bigger logo, paper theme, left align the headline"
{{cli}} design edit banner.design.json --set badge="Now in beta" --layer logo.anchor=top-right
{{cli}} design undo banner.design.json
{{cli}} design variants banner.design.json --by theme      # files and one labeled sheet
{{cli}} design sizes banner.design.json --to og,square,story,linkedin-banner
{{cli}} design check banner.design.json
```

1. Make it with `design new`, look at the PNG it writes, and show it to the person.
2. Turn what they say into `design revise` (plain words) or, when you know the exact change, `design edit`.
3. Every write is checked. An error (a lost word, an overlap, contrast, a safe area, an off-brand request) changes
   nothing and says why: tell the person, offer what the message suggests, and try again.
4. Repeat until they are happy; `design undo` and `design redo` step through what was done.
5. Never edit the PNG or SVG by hand, and never draw the words some other way: change the design file and render again.

When no template fits, compose one from the brand's blocks on a 12 by 12 grid (any size, the platform's safe area kept):

```sh
{{cli}} design new compose --size og -o open.design.json
{{cli}} design compose add open.design.json logo
{{cli}} design compose add open.design.json headline "How Acme searches every file" --at 0,3,7,3
{{cli}} design revise open.design.json 'add a stat "3x" top right'
{{cli}} design compose move open.design.json stat --place bottom-right
{{cli}} design page compose outline.json -o page     # a page from sections, in every flavor and plain HTML
```

The blocks are the layouts' parts and the site's (headline, body, badge, logo, mark, wordmark, window, picture, stack,
room, tile, hatch, card, stat, quote, list, button, search, chart, divider, icon); words fit their cells or the write
fails saying what to shorten. Every layout can be recreated as blocks.

Only the copy the person passed is drawn, plus the logo and the address. `--sample` fills sample copy on purpose.
Copy that does not fit whole is refused with what to shorten. `{{cli}} manifest --json` has a `design` entry with every
template, layer, what each can do, the phrases `revise` understands and the rules.

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
