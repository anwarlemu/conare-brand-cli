# {{brand}} design system
- Read `.ds/agent-guide.md` before changing UI. It covers setup, component discovery, composition and verification.
- Start from `{{cli}} manifest --json` (`describe` is the same command). It lists every command, template, size,
  component, token and rule. If a name is not in that document, the command exits 1. Do not invent a substitute.
- Follow the user's brief. When only restyling, preserve existing content, links, order and behavior.
- Find components with `{{cli}} search <words>`, `{{cli}} list --json` or `{{cli}} component list --json`, and add them with `{{cli}} add <names...>`
  (`--dry-run` first). It adds the app's flavor: Vue in Vue and Nuxt, React in React apps, web components everywhere
  else and in apps without Tailwind (`--framework vue|react|elements` to choose). Read `{{cli}} view <name> --json` (or
  `{{cli}} component inspect <name> --json`) for props, events, slots, states and examples in that flavor (`--framework` for another); do not guess them. The flavors differ:
  React takes `value`/`onValueChange` for v-model and props or children for slots; web components take properties for
  lists, fire DOM events and name `title` as `heading`. `.ds/agent-guide.md` has the table.
{{appNote}}
- To restyle existing screens, run `{{cli}} apply` with what the user named (`apply button card`, `apply /settings`,
  `apply <page file>`), `--dry-run --json` first. It changes style values only, in any file type; `.ds/state.json`
  records the scope and `{{cli}} check` checks it. Only a whole-app apply styles every page; after a selection or a
  plain add, the brand's base reaches the library's components (`data-ds` roots) and elements with the `ds-scope`
  class only, so keep `ds-scope` on what was restyled and do not add brand rules to html or body.
- Style with brand tokens only: with Tailwind, the utilities from the installed theme or preset (bg-surface,
  bg-surface-subtle, text-fg, text-fg-soft, text-fg-muted, border-edge, border-edge-strong, bg-action-primary,
  type-ui, type-meta...); without Tailwind, `var(--ds-*)` in CSS and the `ds-*` classes from kinds.css (ds-button,
  ds-button-secondary, ds-input, ds-card). `{{cli}} brand --json` lists color, type, spacing, radii, motion, fonts, logos and voice;
  `{{cli}} tokens <term>` finds values and errors when nothing matches; `{{cli}} principles --json` is the product and
  website guidance the repository states. No shadows, no corner radius in the
  console, no second accent colour, no ease-in, no transition-all.
- A box that scrolls fades at its edges and never cuts content off: put `fade-y` on one that scrolls down, `fade-x` on
  one that scrolls sideways and `fade-xy` on one that scrolls both ways (the theme, the preset and kinds.css all have
  them; brand.css holds what they run on).
- Icons are Lucide (`lucide-vue-next` in Vue, `lucide-react` in React, inline Lucide SVGs elsewhere) at a 1.5 stroke,
  12 to 14px in the console.
- Run the project's checks and build, then `{{cli}} check --json`, and fix what it reports.
- For an Open Graph image or a social post, run `{{cli}} image --title "..."` (`--text`, `--template`, `--size`,
  `--ground`, `--by`, `--image`, `--json`). `{{cli}} image --list` shows the templates and sizes. It writes PNG and
  SVG from the brand's type, colors and mark. A template refuses a field it does not draw.
- For a short video, run `{{cli}} video --template <id> --size square|vertical|landscape`. Templates are headline,
  statement, announcement and logo. There is no default template. The file is Motion JPEG in an MP4, 18 frames at
  12 fps, from the tokens, the vendored faces and the logo files. The same inputs write the same bytes. It is not
  H.264. `{{cli}} video --list` shows the templates and sizes.
- For posts in the brand's layouts, `{{cli}} image --template hero|brief|tile|app|outline|hatch|room|feature|partner|funding|announce|card`
  at any social size (`--size story,x-banner`, `--theme`, `--input posts.json`). Slides: `{{cli}} deck --input deck.json`.
  Motion: `{{cli}} video --template <layout>` (MP4 or WebM through ffmpeg, `--still` for a PNG). Print files:
  `{{cli}} merch <item>`. Illustrations: `{{cli}} illustrate <subject>` (rules in brand/illustration.md). Figma:
  `{{cli}} figma tokens|push|pull|check` writes files and prints the MCP calls; it never calls Figma. Never draw
  people, photos or third-party logos; use Acme and the person's own pictures (`--image`).
