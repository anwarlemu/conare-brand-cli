# Conare: what good looks like

Conare is context infrastructure for AI companies. It stores a company's data, keeps it in sync, and returns the right
context to its AI. The console is where a team connects sources, watches them sync and checks what search returns.
Write and draw it the way you would a database: engineered, direct, confident and fast.

## The console

- One ground. Pages are off-white (#FEFEFE). The sidebar and quiet panels (table heads, code hints, hovered rows) are
  the paper (#F7F6F4). Separation is a 1px hairline (#DEDDDC), never a shadow. Conare has no shadows.
- Ink is off-black (#020202). Secondary text is #494745; meta text (captions, timestamps, placeholders) is #6C6A68,
  the lightest text allowed. #989694 is never text.
- Red is the website red (#EA3325) and it stays scarce, about 10% of a view: the red edge on the current sidebar row,
  the marker square in a menu row, the pixels of the dark button's hover, a failure. Small red text uses the darker
  #B42317. Never a second accent.
- Faces: Geist for everything at 13px (the console's default) with 12px meta and 11px captions; Faculty Glyphic,
  regular weight only, for page titles (20px), greetings and heroes; Geist Mono for code, keys, IDs and namespace
  names. Weights 400 and 500 only. Sentence case everywhere in the console; the website's tag is the only capitals.
- Everything is square: buttons, fields, tags, menus, cards and dialogs have no corner radius. The only round shape is
  none: even the status dot is a 4px square.
- Controls are 28px (32px fields, 40px table rows, 48px bars), and 40px on phones and touch. One dark button per
  view; it fills with red 6px squares from the left on hover. The rest are secondary (hairline border that turns ink
  on hover), ghost for tools in rows, danger (red label, filled red on hover) for what removes something, held to
  confirm.
- Fields: a #C3C1BF hairline that turns ink on focus; never a red border at rest; a red border and message when
  invalid. Labels are 12px #494745 over the field.
- Menus are square panels in a hairline, rows 32px with a 4px red square marker on the row under the pointer.
- Tables: a paper head in sentence case, 12px muted; 40px rows; numbers in tabular figures; IDs in mono.
- Motion is quick and quiet: 120ms colour changes on the console's curve cubic-bezier(0.2, 0, 0, 1); 160 to 200ms for
  things that move, on cubic-bezier(0.23, 1, 0.32, 1); exits faster than entrances; nothing over 320ms; never ease-in;
  reduced motion keeps opacity only. The command palette opens without animation.

## Always

- Keep what each screen is for: its main action stays the most prominent thing, its key information easy to scan.
- Loading is never empty: rows keep their layout while they load, and the dot matrix shows after 300ms.
- Visible focus on every control (a 2px ink outline, red on dark buttons); touch targets at least 40px on phones.
- Press feedback starts on pointer-down, in colour; no size changes on hover.

## Refuse

- Shadows, rounded corners in the console, gradients, a second accent colour, red body text, bold (600+) weights,
  capitals in the console, emoji, exclamation marks, more than one dark button in a view.

## Voice (for any text an agent writes)

Short declarative sentences, second person, contractions on, sentence case, American spelling, no em dashes. Say what
it does before what it means. Never: seamless, revolutionary, cutting-edge, supercharge, next-generation, robust,
powerful, leverage, empower, unlock, delve, elevate.
