# {{brand}} design system
- Read `.ds/agent-guide.md` before changing UI. It covers setup, component discovery, composition and verification.
- Follow the user's brief. When only restyling, preserve existing content, links, order and behavior.
- Find components with `{{cli}} search <words>` or `{{cli}} list --json` and add them with `{{cli}} add <names...>`
  (`--dry-run` first). It adds the app's flavor: Vue in Vue and Nuxt, React in React apps, web components everywhere
  else and in apps without Tailwind (`--framework vue|react|elements` to choose). Read `{{cli}} view <name> --json` for
  props, events, slots and examples in that flavor (`--framework` for another); do not guess them. The flavors differ:
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
  ds-button-secondary, ds-input, ds-card). `{{cli}} tokens <term>` finds values. No shadows, no corner radius in the
  console, no second accent colour, no ease-in, no transition-all.
- Icons are Lucide (`lucide-vue-next` in Vue, `lucide-react` in React, inline Lucide SVGs elsewhere) at a 1.5 stroke,
  12 to 14px in the console.
- Run the project's checks and build, then `{{cli}} check --json`, and fix what it reports.
