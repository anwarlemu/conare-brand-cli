# PLAN: the rest of conare-ds

The foundation ships 16 items (button, field, switch, tabs, tag, dialog, menu, table, toast, alert, card, code-block,
copy-button, empty-state, loader, sidebar), the brand build, the CLI and the docs site. This file lists everything still
to build: the rest of conare-web's 81 design-system items (the 60 in `app/design-system/registry.ts` plus the 21
example folders with no registry entry, which are older versions and page compositions) and the shadcn/ui set.

## How to build an item

1. Read the item in conare-web (`agencidev/console`, read-only): its registry entry, `app/design-system/examples/<item>/`,
   the files it lists and its classes in `app/assets/css/console2.css` (or home.css, main.css, docs-viz.css).
2. Write `registry/components/<group>/<Name>.vue` (group: ui, product, site, visuals), data through props and slots, no
   API calls, auth or Nuxt-only code; import library files as `@/...`. Values only from tokens (theme utilities or
   `var(--ds-*)`); motion from the `--ds-duration-*` steps, never ease-in or transition-all, hover behind
   `(hover: hover)`, reduced motion handled. Load the animation skills before writing motion.
3. Port the branch's examples to `registry/examples/<item>/<Example>.vue` with Acme sample data (no customer or real
   people's names), and write `registry/docs/<item>.md` (see an existing one for the frontmatter).
4. `bun run ci`, build the site, and compare `/preview/<item>/<example>` with the branch's
   `/design-system/preview/<item>/<example>` at 1440 and 390 (computed styles and screenshots), as CLAUDE.md says.

## Rules for running the batches in parallel

- Each batch creates only its own items' files: components, examples, docs, and composables named after its items.
- Existing library files are read-only to every batch. If one needs a change (a prop on Menu, a token), note it in
  the batch's report and the owner applies it after merging, or the batch adds a new file instead.
- New tokens go only in the batch's own block at the end of `:root` in `brand/tokens.css` (`/* batch 1 */`,
  `/* batch 2 */`, `/* batch 3 */`, already in place), so the three edits never touch the same lines.
- Generated output (`apps/www/public/r`, `registry.generated.json`, `build/`) is not committed; the docs site needs no edits.
- Ownership: batch 1 owns form controls, the text motion and the product windows (eval, product, price and step viz);
  batch 2 owns Menu-based overlays, the console shell (top bar, account menu, switcher, command palette) and the console's
  page compositions; batch 3 owns display parts, the website's bands and the canvas visuals. A page composition in batch 2
  that needs a batch 1 or 3 item lands last in its batch, after a merge of the others, or uses the foundation items.

## Batch 1: controls, text motion and the product windows (21 Conare items, 10 new shadcn items)

Conare items:

- `button-link` (site): The website's square button link with the pixel fill: dark, outlined, small, red, light and ghost on dark bands (components/home/ButtonLink.vue, home.css .btn-px).
- `link` (ui): Ink text with a quiet underline 4px under it that turns ink on hover (.v2-link).
- `copy-text` (ui): An identifier or endpoint as typed, with its copy button (CopyText.vue).
- `text-swap` (visuals): Two labels in one cell, the first leaving up and the next arriving, so nothing moves (example-only item; .v2-swap).
- `roll-text` (visuals): A label that rolls up to a copy of itself on hover or focus, site and console paces (RollText.vue, .roll).
- `shimmer-text` (visuals): A word with light running across it while work runs (.v2-shimmer).
- `highlight-text` (visuals): The headline reveal: letters start faint and red, then settle to ink (HighlightText.vue, .hl).
- `marked-text` (ui): A passage with the query's words in medium weight (Marked.vue).
- `count` (ui): A number that counts to its new value; format as amount or share; reduced motion jumps (Count.vue).
- `filter-chip` (product): The search's filter chips under the box (example-only item; .v2-chip).
- `search-box` (product): The search box: question textarea, attached files, add menu, scope, Enter cue, red submit (field/Search example, .v2-searchbox, .v2-attach). Uses Menu; it takes the scope picker through a slot, so batch 2's scope-menu drops in after the merge.
- `suggestion-chips` (product): Questions to start from, a block gliding to the one pointed at (SuggestChips.vue, PixelChip.vue).
- `glide-mark` (visuals): One block for a whole list that glides to the row under the pointer (useGlideMark.ts, .v2-rowmark).
- `fix-button` (product): The fix for a failure: pixel squares run black, signs in, counts changes back, ends on a check (namespaces/FixButton.vue; the button Brand example).
- `prompt-bar` (site): The floating dark bar that types phrases and answers shortcuts (PromptBar.vue).
- `login-page` (site): The sign-in page as it ships (example-only item), on Field, Button and the brand mark.
- `request-access-page` (site): The request-access page (example-only item).
- `eval-viz` (visuals): A benchmark window: rows enter, bars grow, Conare's in red (EvalViz.vue).
- `product-viz` (visuals): A product as a small window: embeddings, reranking, a file read (ProductViz.vue).
- `price-viz` (visuals): Accuracy against price, each provider a point (PriceViz.vue).
- `step-viz` (visuals): How it works, one search step by step with real timings (StepViz.vue).

New in Conare's style (shadcn items with no Conare equivalent):

- `button-group`: From agent-prompt's split button (.v2-split): two buttons sharing a hairline.
- `checkbox`: New: 16px square, hairline #C3C1BF, ink fill and a drawn check when on, red focus outline like the switch.
- `form`: Field composition with validation states and submit, on Field, Input, Button.
- `input-otp`: New: square 32px cells, hairline, ink on focus, Geist Mono digits.
- `kbd`: From the sidebar search's kbd (11px, inherits the face); hidden on touch.
- `native-select`: From main.css select.c-input: the field with its own chevron (12px, neutral-400), square under the console.
- `radio-group`: New: square 16px, hairline, ink inner square when picked, rows 28px.
- `slider`: New: 4px track (.v2-meter values), square 12px ink thumb, red focus.
- `textarea`: From the search box's textarea and textarea.c-input: 13px, hairline, ink on focus.
- `toggle`: A pressable chip (.v2-chip with aria-pressed), ink edge when on.

Extensions to Conare items for shadcn parity:

- `input-group` via `search-box`: The search box (.v2-searchbox) is the input group: a field with leading and trailing controls.
- `label` via `field`: Field's label (12px soft); export Label on its own.
- `toggle-group` via `tabs`: The segmented control with aria-pressed (.v2-tabs supports it); add multi-select.

## Batch 2: overlays, menus, the console shell and its pages (23 Conare items, 11 new shadcn items)

Conare items:

- `account-menu` (product): The sidebar's foot: a black square and the email, opening upward, Sign out in red (AccountMenu.vue).
- `workspace-switcher` (product): The sidebar head's organization switcher as one component (WorkspaceMenu.vue; the Menu example composes it today).
- `scope-menu` (product): Where a search looks: namespaces with app marks and sizes, a filter once long, arrows and Escape (ScopeMenu.vue).
- `filter-menu` (product): The filter menu, a count on its button (example-only item).
- `command-palette` (product): Cmd+K box: documents as you type, namespaces, pages, actions; opens without animation (Command.vue, .v2-cmd).
- `product-menu` (site): The header's Product dropdown with a gliding highlight and a window for the item pointed at (ProductMenu.vue).
- `site-header` (site): The website header with the Product menu (example-only item).
- `top-bar` (ui): The 48px bar with breadcrumbs, each step back a link, the page in ink (.v2-bar, .v2-crumb).
- `code-pop` (ui): Show code: the request opens in place under the row on the dark window colour (CodePop.vue).
- `steps` (ui): Steps that open one at a time, finished ones folding to a line (byapi/Step.vue, useMoveSteps.ts).
- `document-download` (product): A document downloads on press and its mark turns to a check (DownloadMark.vue, DownloadButton.vue).
- `credit-history` (product): Credit grants newest first, five at a time, each landing on the rule (billing/Grants.vue).
- `agent-prompt` (product): Connect a coding agent over MCP: the agent at work, the prompt box, Copy prompt and the split API button (agents/Connect.vue).
- `add-documents` (product): Upload files or paste text into a namespace (AddDocuments.vue).
- `add-data` (product): The ways data comes in: connect an app, upload, send by API (namespaces/AddData.vue).
- `source-row` (product): A source as getting started lists it (example-only item).
- `searches-page` (product): Searches as it ships (example-only item), a page composition.
- `overview-page` (product): Overview as it ships (example-only item), a page composition.
- `accuracy-page` (product): Accuracy as it ships (example-only item).
- `accuracy-views` (product): Accuracy views: question sheet, test at work, two searches, verdict first (example-only item).
- `parse-page` (product): Parse as it ships (example-only item).
- `parse-views` (product): Document reading views: page beside text, plain or Conare, regions (example-only item).
- `home-numbers` (product): Home's numbers: double rule, foot strip, in the title (example-only item).

New in Conare's style (shadcn items with no Conare equivalent):

- `alert-dialog`: On Dialog: title, one line, Cancel and a danger action; prefer HoldButton in rows, as the console does.
- `calendar`: New in Conare's style: square day cells, ink selection, red marker on today, 12px meta heads.
- `collapsible`: From .v2-collapse and CodePop's open-in-place.
- `context-menu`: On Menu's panel and rows (MenuItem), opened at the pointer.
- `date-picker`: Calendar in a Popover with a Field trigger.
- `drawer`: From the console's phone sidebar and sheet (.v2-sheet: 220ms in on the strong ease-out).
- `hover-card`: Menu's square panel opened on hover after 300ms (the copy tooltip's wait).
- `menubar`: Menu triggers in a row on the paper, Menu panels.
- `popover`: Menu's square panel for any content (200ms in, 120ms out).
- `sheet`: From the docs panel (.v2-docs: 420px, hairline edge, 48px bar).
- `tooltip`: From Copy.vue version 1's tip: inverse fill, 11px, 2px 6px, under its trigger, 300ms wait on hover, at once on focus, 125ms.

Extensions to Conare items for shadcn parity:

- `breadcrumb` via `top-bar`: top-bar's crumbs (.v2-crumb) are the breadcrumb; export Breadcrumb from it.
- `combobox` via `scope-menu`: scope-menu is the combobox (filter plus list); generalize it to any options.
- `navigation-menu` via `product-menu`: product-menu is the navigation menu.
- `select` via `scope-menu`: A listbox on Menu's panel with a check on the pick, from scope-menu.

## Batch 3: display, product, site and visuals (21 Conare items, 13 new shadcn items)

Conare items:

- `chart` (ui): Bars per day under a total, lines over time, shares, a split bar; 1px grid, hover reads a value (BarChart.vue, LineChart.vue, usage/*).
- `meter` (ui): Progress as a bar or one square per step (.v2-meter, SetupMeter.vue).
- `stat` (ui): A label over a number in a row of stats; a stat that drives a chart is a button (.v2-stats).
- `facts` (ui): Short facts, each a small box with its name and value (.v2-fact).
- `search-results` (product): Best match in its card with answer and source, then matches opening to their passage (search/BestMatch.vue...).
- `search-run` (product): A search on the request's clock: Searching shimmers, cells flicker, the result reveals timed (SearchRun.vue).
- `written-answer` (product): The written answer views (example-only item, three versions).
- `overview-band` (product): Overview band views: live, pipeline, three questions (example-only item).
- `work-panel` (product): A card beside the dark panel with grain, cells and one window playing once (SetupStep.vue, docs-viz.css).
- `hero` (site): The home's first band: the headline with its red stop, team tabs and the search (Hero.vue).
- `faq` (site): Questions in the double-rule frame, one open at a time (Faq.vue).
- `call-to-action` (site): The closing band over the redrawing grid (Cta.vue).
- `site-footer` (site): Lowercase link columns, trust marks, legal line (Footer.vue).
- `announcement-bar` (site): One line above the header with its link (AnnouncementBar.vue).
- `blog-card` (site): A post card: its picture of cells with the red category, title and date (BlogCard.vue).
- `eval-card` (site): A benchmark card (example-only item).
- `subprocessor-table` (site): Who, what for, where (SubprocessorTable.vue).
- `docs-blocks` (site): One of each docs block as a docs page sets them (example-only item).
- `cell-burst` (visuals): Seeded square cells bursting from a point; jumble, ledger, strong, trace (CellBurst.vue).
- `burst` (visuals): The hero frame's infinite cells pattern on red (Burst.vue).
- `room-grid` (visuals): The hero frame as a one-point-perspective room with lit tiles (RoomGrid.vue).

New in Conare's style (shadcn items with no Conare equivalent):

- `accordion`: Build in Conare's style from the FAQ (Faq.vue) and the console's disclosure (.c-details, .v2-collapse: 0fr to 1fr over 260ms opening, 180ms closing).
- `aspect-ratio`: A plain wrapper (aspect-ratio), used by blog-card and the viz windows.
- `avatar`: Square: the account menu's black square with an initial, the 20px org tile (.v2-tile); never round.
- `carousel`: New: square, hairline, arrows as ghost icon buttons, no autoplay.
- `data-table`: Compose Table with filter-chip, filter-menu, sorting heads and a show-more foot (credit-history).
- `direction`: A dir provider (rtl/ltr) wrapper; code windows stay ltr.
- `item`: From the console's rows (.v2-row, .v2-row-link) and source-row.
- `pagination`: New: secondary buttons and a page count in tabular figures; prefer show more (credit-history).
- `resizable`: New: hairline handle that turns ink on hover, the docs panel's split.
- `scroll-area`: Thin scrollbars in neutral-600 (main.css html scrollbar-color).
- `separator`: The hairline (MenuSeparator, .v2-menu-sep) as its own item.
- `skeleton`: From the held rows (data-held): the row's own layout, blank, rules after 300ms; never a shimmer block.
- `typography`: The type-* utilities and link and marked-text as one reference item: heading-3 page titles, ui, meta, caption, code-sm.

## Foundation follow-ups (owner, after the batches)

- button: the branch's FixButton (button Brand example) is listed as `fix-button`; the dark button's Handoff swap uses
  a plain label change instead of `.v2-swap`'s cross-fade (lands with `text-swap`).
- copy-button: only version 2 (Copy to Copied, the picked one) is ported; versions 1 (quiet icon with tooltip) and 3
  (pixel check) are open in the branch's Versions menu.
- code-block: the fold (Show full code past 15 lines) and the docs variant (DocsCode) are not ported yet.
- table: the Product example is a simplified namespaces table; the branch's NamespacesTable (rows that open to
  documents, sources and settings, app marks, share bars) needs `document-download`, `meter` and app marks.
- menu: the trigger mark is an initial tile; the branch shows the Conare mark (`brand/logo/svg/mark.svg`).
- tooltip: Conare has no standalone tooltip item; batch 2 builds it from Copy.vue version 1's tip.

## shadcn/ui coverage

The requested list names 60 components (the sibling Inkbox library's 68 add its own attachment, bubble, marker,
message, message-scroller, questionnaire, surface and trace, which are Inkbox-specific; Conare's code-block exists).

| shadcn | Conare item | Status | Batch |
| --- | --- | --- | --- |
| accordion | (new) | build new in Conare's style | 3 |
| alert | `alert` | covered (built) | done |
| alert-dialog | (new) | build new in Conare's style | 2 |
| aspect-ratio | (new) | build new in Conare's style | 3 |
| avatar | (new) | build new in Conare's style | 3 |
| badge | `tag` | covered (built) | done |
| breadcrumb | `top-bar` | covered by a Conare item to build | 2 |
| button | `button` | covered (built) | done |
| button-group | (new) | build new in Conare's style | 1 |
| calendar | (new) | build new in Conare's style | 2 |
| card | `card` | covered (built) | done |
| carousel | (new) | build new in Conare's style | 3 |
| chart | `chart` | covered by a Conare item to build | 3 |
| checkbox | (new) | build new in Conare's style | 1 |
| collapsible | (new) | build new in Conare's style | 2 |
| combobox | `scope-menu` | covered by a Conare item to build | 2 |
| command | `command-palette` | covered by a Conare item to build | 2 |
| context-menu | (new) | build new in Conare's style | 2 |
| data-table | (new) | build new in Conare's style | 3 |
| date-picker | (new) | build new in Conare's style | 2 |
| dialog | `dialog` | covered (built) | done |
| direction | (new) | build new in Conare's style | 3 |
| drawer | (new) | build new in Conare's style | 2 |
| dropdown-menu | `menu` | covered (built) | done |
| empty | `empty-state` | covered (built) | done |
| field | `field` | covered (built) | done |
| form | (new) | build new in Conare's style | 1 |
| hover-card | (new) | build new in Conare's style | 2 |
| input | `field` | covered (built) | done |
| input-group | `search-box` | covered by a Conare item to build | 1 |
| input-otp | (new) | build new in Conare's style | 1 |
| item | (new) | build new in Conare's style | 3 |
| kbd | (new) | build new in Conare's style | 1 |
| label | `field` | covered (built) | 1 |
| menubar | (new) | build new in Conare's style | 2 |
| native-select | (new) | build new in Conare's style | 1 |
| navigation-menu | `product-menu` | covered by a Conare item to build | 2 |
| pagination | (new) | build new in Conare's style | 3 |
| popover | (new) | build new in Conare's style | 2 |
| progress | `meter` | covered by a Conare item to build | 3 |
| radio-group | (new) | build new in Conare's style | 1 |
| resizable | (new) | build new in Conare's style | 3 |
| scroll-area | (new) | build new in Conare's style | 3 |
| select | `scope-menu` | covered by a Conare item to build | 2 |
| separator | (new) | build new in Conare's style | 3 |
| sheet | (new) | build new in Conare's style | 2 |
| sidebar | `sidebar` | covered (built) | done |
| skeleton | (new) | build new in Conare's style | 3 |
| slider | (new) | build new in Conare's style | 1 |
| sonner | `toast` | covered (built) | done |
| spinner | `loader` | covered (built) | done |
| switch | `switch` | covered (built) | done |
| table | `table` | covered (built) | done |
| tabs | `tabs` | covered (built) | done |
| textarea | (new) | build new in Conare's style | 1 |
| toast | `toast` | covered (built) | done |
| toggle | (new) | build new in Conare's style | 1 |
| toggle-group | `tabs` | covered (built) | 1 |
| tooltip | (new) | build new in Conare's style | 2 |
| typography | (new) | build new in Conare's style | 3 |

Totals: 16 built, 65 Conare items to build, 34 shadcn items to build new;
batches carry 31, 34 and 34 items.
