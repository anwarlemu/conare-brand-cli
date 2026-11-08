# {{brand}} design system
- Read `.ds/agent-guide.md` before changing UI. It covers setup, component discovery, composition and verification.
- Follow the user's brief. When only restyling, preserve existing content, links, order and behavior.
- Find components with `{{cli}} search <words>` or `{{cli}} list --json` and add them with `{{cli}} add <names...>`
  (`--dry-run` first). Read `{{cli}} view <name> --json` for props, slots, events and examples; do not guess them.
- To restyle existing screens, run `{{cli}} apply` with what the user named (`apply button card`, `apply /settings`,
  `apply app/pages/settings.vue`), `--dry-run --json` first. It changes style values only; `.ds/state.json` records
  the scope and `{{cli}} check` checks it. Only a whole-app apply styles every page; after a selection or a plain add,
  the brand's base reaches the library's components (`data-ds` roots) and elements with the `ds-scope` class only, so
  keep `ds-scope` on what was restyled and do not add brand rules to html or body.
- Style with brand tokens only: the Tailwind utilities from the installed theme (bg-surface, bg-surface-subtle,
  text-fg, text-fg-soft, text-fg-muted, border-edge, border-edge-strong, bg-action-primary, type-ui, type-meta...) or
  `var(--ds-*)` in CSS. `{{cli}} tokens <term>` finds values. No shadows, no corner radius in the console, no
  second accent colour, no ease-in, no transition-all.
- Icons are Lucide (`lucide-vue-next`) at a 1.5 stroke, 12 to 14px in the console.
- Run the project's checks and build, then `{{cli}} check --json`, and fix what it reports.
