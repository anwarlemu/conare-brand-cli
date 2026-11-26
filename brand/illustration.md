# Illustration

How the brand draws, as rules the `illustrate` command follows (`src/illustrate/`, data in `brand/assets/illustrate.json`).
Every rule names its source. Nothing here is invented: where the sources say nothing, the command does nothing.

## Sources

- agd-playground posts tool, `src/components/conare-og/` (`draw.ts`, `brand.ts`, `app.ts`) and its art,
  `public/conare-og/` (`stack-tall.png`, `stack-wide.png`, `pixels.png`).
- The website's hero frame and bands (`registry/components/site/Hero.vue`, `registry/components/visuals/`), which take the
  same parts from conare.ai.
- `brand/tokens.css` for every color.

## Rules

1. **Stacks of documents are the subject.** A stack is a front sheet with nested frames and some 28 sheets stepping back
   behind it, 5 px across and 4 px up (tall) or down (wide), drawn in hairlines on off-white sheets. Source:
   `stack-tall.png` (412 by 498), `stack-wide.png` (626 by 336).
2. **The red pixel grid marks a document.** Six by six cells in home-red and a pale red at the front sheet's top corner
   (top left on a tall stack, top right on a wide one), with a hairline gap between cells. The pattern is the one in
   `pixels.png`; a seed only reshuffles the same cells. The file's pale cell (#FFD6D2) has no token and draws in
   home-wash-hover (#FFDEDD).
3. **The perspective room is the ground.** A back wall about a third of the frame, four rings stepping out toward the
   edges faster as they near them (power 1.7), and lines from the wall's corners and edges out past the frame, in a
   thin translucent ink (off-white at 34% on red, off-black at 12% on paper). Source: `draw.ts` `drawRoom`.
4. **Stacks sit squared up at the sides of a room, two a side, mirrored**, behind the words, never rotated or tilted.
   Source: `draw.ts` `roomStacks`.
5. **The wordmark is also a texture**: a staggered tile at 5% (7% on black, 14% on red) and a huge hollow outline along
   the foot. Never the mark alone as a pattern. Source: `draw.ts` `tileWords` and the outline band.
6. **Hatching is fine and at 45 degrees**, on a floor under a hairline. Source: `draw.ts` `hatchLines`, the hatch layout.
7. **Searching is a strip of small squares**, a few of them red: the documents searched and the ones found. Source:
   `app.ts` (the strip under "Found in").
8. **The product is the dark agent window**, never a browser frame: neutral-100 ground, hairline chips, the task marked
   with a small red square. Its sample copy uses Acme and neutral source names, never third-party products. Source:
   `app.ts`.
9. **Five grounds only**: white, paper, red, black and grey (`image.json` themes). Red covers a whole frame or nothing;
   on red, marks and words go off-white.
10. **No people, no third-party logos, no photos** of anyone. A picture you pass with `--image` goes on a stack's front
    sheet, inside its frames, as a document. The playground's product scenes are left out: they show third-party logos
    and photos of people.

## Subjects

`stack` (tall or wide, `--image` on the front sheet), `stacks` (the room with stacks), `pixels`, `room`, `tile`,
`outline`, `hatch` (a wide stack on a hatched floor, `--image` on it), `strip`, `panel` and `scene` (the room, stacks and
the agent window: the feature layout's stand-in). Each renders as SVG of real vector shapes (a picture you pass stays a
bitmap inside it) and as PNG, at any size from 64 to 4000 px, on any of the five themes.
