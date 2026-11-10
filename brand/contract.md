# {{brand}} design system
- Read `.ds/agent-guide.md` before changing UI. It covers setup, component discovery, composition and verification.
- Start from `{{cli}} manifest --json` (`describe` is the same command). It lists every command, template, size,
  component, token and rule. If a name is not in that document, the command exits 1. Do not invent a substitute.
- Follow the user's brief. When only restyling, preserve existing content, links, order and behavior.
- Find components with `{{cli}} search <words>`, `{{cli}} list --json` or `{{cli}} component list --json`, and add
  them with `{{cli}} add <names...>` (`--dry-run` first). Read `{{cli}} component inspect <name> --json` and
  `{{cli}} view <name> --json` for props, slots, events, states and examples. `{{cli}} component emit <name> --state <id>`
  writes Vue for one state. `example:<Name>` copies that example unchanged. Do not guess a prop, a state or a slot.
- To restyle existing screens, run `{{cli}} apply` with what the user named (`apply button card`, `apply /settings`,
  `apply app/pages/settings.vue`), `--dry-run --json` first. It changes style values only; `.ds/state.json` records
  the scope and `{{cli}} check` checks it. Only a whole-app apply styles every page; after a selection or a plain add,
  the brand's base reaches the library's components (`data-ds` roots) and elements with the `ds-scope` class only, so
  keep `ds-scope` on what was restyled and do not add brand rules to html or body.
- Style with brand tokens only: the Tailwind utilities from the installed theme (bg-surface, bg-surface-subtle,
  text-fg, text-fg-soft, text-fg-muted, border-edge, border-edge-strong, bg-action-primary, type-ui, type-meta...) or
  `var(--ds-*)` in CSS. `{{cli}} brand --json` lists color, type, spacing, radii, motion, fonts, logos and voice.
  `{{cli}} tokens <term>` finds values and errors when nothing matches. `{{cli}} principles --json` is the product
  and website guidance that the repository actually states. No shadows, no corner radius in the console, no
  second accent colour, no ease-in, no transition-all.
- Icons are Lucide (`lucide-vue-next`) at a 1.5 stroke, 12 to 14px in the console.
- Run the project's checks and build, then `{{cli}} check --json`, and fix what it reports.
- For an Open Graph image or a social post, run `{{cli}} image --title "..."` (`--text`, `--template`, `--size`,
  `--ground`, `--by`, `--image`, `--json`). `{{cli}} image --list` shows the templates and sizes. It writes PNG and
  SVG from the brand's type, colors and mark. A template refuses a field it does not draw.
- For a short video, run `{{cli}} video --template <id> --size square|vertical|landscape`. Templates are headline,
  statement, announcement and logo. There is no default template. The file is Motion JPEG in an MP4, 18 frames at
  12 fps, from the tokens, the vendored faces and the logo files. The same inputs write the same bytes. It is not
  H.264. `{{cli}} video --list` shows the templates and sizes.
