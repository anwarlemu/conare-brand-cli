# {{brand}} design system
- Read `.ds/agent-guide.md` before changing UI. It covers setup, component discovery, composition and verification.
- Follow the user's brief. When only restyling, preserve existing content, links, order and behavior.
- Find components with `{{cli}} list --json` and add them with `{{cli}} add <names...>` (`--dry-run` first). Read the
  installed source or {{registry}}/r/<name>.json for props and examples; do not guess them.
- Style with brand tokens only: the Tailwind utilities from the installed theme (bg-surface, bg-surface-subtle,
  text-fg, text-fg-soft, text-fg-muted, border-edge, border-edge-strong, bg-action-primary, type-ui, type-meta...) or
  `var(--ds-*)` in CSS. `{{cli}} tokens <term>` finds values. No shadows, no corner radius in the console, no
  second accent colour, no ease-in, no transition-all.
- Icons are Lucide (`lucide-vue-next`) at a 1.5 stroke, 12 to 14px in the console.
- Run the project's checks and build, then `{{cli}} check --json`, and fix what it reports.
