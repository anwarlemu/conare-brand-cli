# conare-ds

Components, design tokens and checks for building Conare pages and interfaces in Vue 3.5 and Nuxt 4 with Tailwind 4.
Every component is ported from Conare's own console and website (conare-web, branch `agencidev/console`), takes its
data through props and slots, and is shown on the library site from the files apps install.

Library site: https://conare-ds.vercel.app (the `apps/www` Nuxt app in this repository).

## Use it in an app

Requires Node.js 20 or later, Vue 3.5, Tailwind CSS 4 (`@tailwindcss/vite`) and `lucide-vue-next`.

```sh
bun add -d github:anwarlemu/conare-brand-cli#release   # or npm install --save-dev
npx conare-ds init                                      # stylesheet, theme, fonts, agent contract
npx conare-ds add button field dialog                   # components and what they require
npx conare-ds check                                     # values off the tokens
```

| Command | What it does |
| --- | --- |
| `list [--json]` | Every item, its group, what it requires and its packages. |
| `add <item...>` | Copies each item's files and the items and composables they import into the app's source folder (Nuxt 4: `app/`, Vite: `src/`), rewrites `@/` imports to relative paths when the app has no `@` alias, installs missing packages with the app's package manager and runs `init` once if the theme is missing. Files that differ locally are kept unless `--overwrite`. `--dry-run`, `--no-install`. |
| `init` | Writes `<main stylesheet dir>/conare-ds/brand.css` (fonts, tokens, base styles) and `theme.css` (the Tailwind 4 theme), imports both right after `@import "tailwindcss"`, copies the fonts and textures to `public/conare-ds/`, writes `.ds/agent-guide.md` and the contract into `AGENTS.md`. Idempotent. |
| `check [paths...]` | The value check over styles, Vue templates and scripts: raw colors, Tailwind palette and arbitrary colors, radii and type sizes off the scale, durations off the motion steps, `transition-all`, `ease-in`, custom easings, shadows, bold weights, unknown `--ds-*` tokens and icon packs other than Lucide. Exit 1 on findings; `--fix` applies exact token replacements; `--json`. A `ds-override: <reason>` comment on the line above skips a finding. |
| `tokens [term...]` | Finds tokens by name or value. |

All commands take `--cwd <dir>`.

## Work on it

```sh
bun install          # also prepares the docs site
bun run build        # tsc (src -> dist) and scripts/build-brand.mjs (brand -> build)
bun run registry     # validate registry/, write apps/www/public/r, value check, vue-tsc
bun run ci           # build, limits, registry, vitest
bun run --cwd apps/www build && PORT=3201 node apps/www/.output/server/index.mjs
```

`CLAUDE.md` says where everything is. `PLAN.md` lists the items still to build.
