import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { oneOf, seedOf, str } from '../assets/flags.js';
import { helpRow } from '../lib/help-row.js';
import { display, num, pick, write } from '../assets/io.js';
import { findItem, merchCatalog, merchItems, renderGuides, renderItem } from '../assets/merch.js';
// `merch`: print files at real size with bleed and safe area, from the approved lockups, themes and illustration.
/** The words an item can take, by flag: every text slot of the print engine. */
export const PRINT_SLOTS = ['headline', 'body', 'badge', 'name', 'role', 'email', 'phone', 'date', 'stat', 'quote', 'by', 'note', 'url'];
export function merchHelp(kind = 'merch') {
    const b = brand().bin;
    const row = (c, w) => helpRow(c, w, 46);
    const cat = merchCatalog();
    if (kind === 'document')
        return printHelp();
    return [
        'Merch print files at real size: SVG in inches (with the die line on stickers) and PNG at 300 dpi. No mockups.',
        '',
        row(`${b} merch tee-back --variant black`, 'The tee back in off-black on a transparent ground'),
        row(`${b} merch poster --headline "..."`, 'An 18x24 in poster with your headline'),
        row(`${b} merch sticker --variant paper --guides`, 'The sticker, and its trim and safe area in a separate -guides file to lay over a proof'),
        row(`${b} merch all --out merch`, 'Every item in its first variant'),
        row(`${b} merch --list`, 'Items, sizes, variants and sources'),
        '',
        ...cat.items.filter((i) => i.kind !== 'document').map((i) => helpRow(i.id, `${i.trim.width}x${i.trim.height} in, bleed ${i.bleed} in, safe ${i.safe} in, ${i.method}. Variants: ${i.variants.join(', ')}.`, 14)),
        '',
        '--variant: red, paper and ink print the theme to the bleed; color is full-color art on a transparent ground; black, white and redline are one color.',
        '--headline (--title) and --url are the words where an item has them; a headline is drawn only when you pass one (or --sample). --theme is the same as --variant.',
        '--dpi 72 to 600 (default 300). --format both (PNG and SVG, the default), png, svg, pdf (ground variants) or a list. --seed moves the found cells of the art.',
        cat.note,
    ].join('\n');
}
function printHelp() {
    const b = brand().bin;
    const row = (c, w) => helpRow(c, w, 50);
    const cat = merchCatalog();
    return [
        'Documents to print or send as PDF, at their paper size, with bleed and safe area: business cards, letterheads, report covers, one-pagers, case studies, event badges, name tags, certificates.',
        '',
        row(`${b} print business-card --name "Ada Acme" --role "Engineer" --email ada@acme.com`, 'A business card, PNG, SVG and PDF'),
        row(`${b} print one-pager-a4 --headline "..." --body "..."`, 'An A4 one-pager'),
        row(`${b} print case-study-letter --headline "..." --stat 40% --quote "..." --by "Acme"`, 'A case study'),
        row(`${b} print --list`, 'Documents, sizes, variants and sources'),
        '',
        ...cat.items.filter((i) => i.kind === 'document').map((i) => helpRow(i.id, `${i.trim.width}x${i.trim.height} in, bleed ${i.bleed} in. Words: ${i.slots.join(', ')}. Variants: ${i.variants.join(', ')}.`, 20)),
        '',
        `Words: ${PRINT_SLOTS.map((x) => `--${x}`).join(' ')} (only where a document has them; only what you pass is drawn). --format png, svg, pdf, a list or all (the default for print is all). --dpi 72 to 600.`,
        'Use Acme or the person\'s own details; never another real person\'s name.',
    ].join('\n');
}
export async function runMerch(cwd, args, flags, kind = 'merch') {
    const mine = (i) => (i.kind ?? 'merch') === kind;
    if (flags.list === true || args[0] === 'list') {
        const all = merchCatalog();
        const cat = { ...all, items: all.items.filter(mine) };
        return { json: cat, text: cat.items.map((i) => helpRow(i.id, `${i.name}: ${i.trim.width}x${i.trim.height} in + ${i.bleed} in bleed, safe ${i.safe} in, ${i.method}. Variants: ${i.variants.join(', ')}. ${i.source}`, 14)).concat(['', cat.note]).join('\n') };
    }
    for (const n of ['variant', 'theme', 'dpi', 'format', 'out'])
        if (flags[n] === true)
            throw new Error(`--${n} needs a value.`);
    const pool = merchItems().filter(mine);
    if (!args.length)
        throw new Error(`Name an item: ${brand().bin} ${kind === 'document' ? 'print business-card' : 'merch tee-front'} (one of ${pool.map((i) => i.id).join(', ')}, or all).`);
    const items = args.length === 1 && args[0] === 'all' ? pool : args.map((a) => {
        const it = findItem(a);
        if (!mine(it))
            throw new Error(`${it.id} is ${kind === 'document' ? 'merch: use merch' : 'a document: use print'} ${it.id}.`);
        return it;
    });
    const formats = [...new Set((str(flags.format) ?? (kind === 'document' ? 'all' : 'both')).split(',').flatMap((f) => { const x = pick('format', f.trim(), ['both', 'png', 'svg', 'pdf', 'all']); return x === 'both' ? ['png', 'svg'] : x === 'all' ? ['png', 'svg', 'pdf'] : [x]; }))];
    if (str(flags.variant) && str(flags.theme) && flags.variant !== flags.theme)
        throw new Error('--variant and --theme disagree. Pass one.');
    const variant = str(flags.variant) ?? str(flags.theme);
    const dpi = num('dpi', flags.dpi, 72, 600, { integer: true });
    const slots = {};
    for (const k of PRINT_SLOTS) {
        const v = oneOf(flags, k === 'headline' ? ['headline', 'title'] : k === 'body' ? ['body', 'text'] : k === 'badge' ? ['badge', 'eyebrow'] : [k]);
        if (v !== undefined)
            slots[k] = v;
    }
    const out = str(flags.out) ?? (kind === 'document' ? 'print' : 'merch');
    const ext = /\.(png|svg|pdf)$/i.exec(out)?.[1]?.toLowerCase();
    if (ext && items.length > 1)
        throw new Error('--out is a file, so name one item. For several, pass a directory.');
    if (!ext && /\.(jpe?g|webp|gif|eps|ai)$/i.test(out))
        throw new Error(`--out ${out}: merch writes png, svg or pdf.`);
    const want = ext ? [ext] : formats;
    const dir = resolve(cwd, out);
    const writes = [];
    const files = [];
    for (const item of items) {
        const own = args[0] === 'all' ? Object.fromEntries(Object.entries(slots).filter(([k]) => item.layers.some((l) => l.type === 'text' && l.slot === k))) : slots;
        const r = renderItem(item, { variant, slots: own, sample: flags.sample === true, seed: seedOf(flags), dpi, png: want.includes('png'), svg: want.includes('svg'), pdf: want.includes('pdf') });
        const stem = ext ? dir.replace(/\.(png|svg|pdf)$/i, '') : join(dir, `${item.id}-${r.variant}`);
        const meta = { item: item.id, variant: r.variant, widthIn: r.widthIn, heightIn: r.heightIn, bleedIn: item.bleed, safeIn: item.safe, dieCut: Boolean(item.cut) };
        if (r.png) {
            writes.push({ path: `${stem}.png`, data: r.png });
            files.push({ path: display(cwd, `${stem}.png`), format: 'png', width: r.width, height: r.height, dpi: r.dpi, ...meta });
        }
        if (r.pdf) {
            writes.push({ path: `${stem}.pdf`, data: r.pdf });
            files.push({ path: display(cwd, `${stem}.pdf`), format: 'pdf', width: r.width, height: r.height, dpi: r.dpi, ...meta });
        }
        if (r.svg) {
            writes.push({ path: `${stem}.svg`, data: r.svg });
            files.push({ path: display(cwd, `${stem}.svg`), format: 'svg', width: Math.round(r.widthIn * 300), height: Math.round(r.heightIn * 300), ...meta });
        }
        /* The trim and safe area go in their own file, to lay over a proof; the print file never carries them. */
        if (flags.guides === true) {
            const g = renderGuides(item, dpi);
            writes.push({ path: `${stem}-guides.png`, data: g.png }, { path: `${stem}-guides.svg`, data: g.svg });
            files.push({ path: display(cwd, `${stem}-guides.png`), format: 'png', width: r.width, height: r.height, dpi: r.dpi, guides: true, ...meta }, { path: display(cwd, `${stem}-guides.svg`), format: 'svg', width: Math.round(r.widthIn * 300), height: Math.round(r.heightIn * 300), guides: true, ...meta });
        }
    }
    for (const w of writes)
        write(w.path, w.data);
    const note = merchCatalog().note;
    return { json: { files, note }, text: [...files.map((f) => `${f.path}  ${f.widthIn}x${f.heightIn} in${f.format === 'png' ? ` at ${f.dpi} dpi` : ''}`), note].join('\n') };
}
