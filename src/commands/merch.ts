import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { oneOf, seedOf, str, type Flags } from '../assets/flags.js';
import { helpRow } from '../lib/help-row.js';
import { display, num, pick, write, type OutFile } from '../assets/io.js';
import { findItem, merchCatalog, merchItems, renderItem } from '../assets/merch.js';

// `merch`: print files at real size with bleed and safe area, from the approved lockups, themes and illustration.


export function merchHelp(): string {
	const b = brand().bin;
	const row = (c: string, w: string) => helpRow(c, w, 46);
	const cat = merchCatalog();
	return [
		'Merch print files at real size: SVG in inches (with the die line on stickers) and PNG at 300 dpi. No mockups.',
		'',
		row(`${b} merch tee-back --variant black`, 'The tee back in off-black on a transparent ground'),
		row(`${b} merch poster --headline "..."`, 'An 18x24 in poster with your headline'),
		row(`${b} merch sticker --variant paper --guides`, 'The sticker with its trim and safe area drawn'),
		row(`${b} merch all --out merch`, 'Every item in its first variant'),
		row(`${b} merch --list`, 'Items, sizes, variants and sources'),
		'',
		...cat.items.map((i) => helpRow(i.id, `${i.trim.width}x${i.trim.height} in, bleed ${i.bleed} in, safe ${i.safe} in, ${i.method}. Variants: ${i.variants.join(', ')}.`, 14)),
		'',
		'--variant: red, paper and ink print the theme to the bleed; color is full-color art on a transparent ground; black, white and redline are one color.',
		'--headline (--title) and --url are the words where an item has them; a headline is drawn only when you pass one (or --sample). --theme is the same as --variant.',
		'--dpi 72 to 600 (default 300). --format both (PNG and SVG, the default), png, svg, pdf (ground variants) or a list. --seed moves the found cells of the art.',
		cat.note,
	].join('\n');
}

export async function runMerch(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = merchCatalog();
		return { json: cat, text: cat.items.map((i) => helpRow(i.id, `${i.name}: ${i.trim.width}x${i.trim.height} in + ${i.bleed} in bleed, safe ${i.safe} in, ${i.method}. Variants: ${i.variants.join(', ')}. ${i.source}`, 14)).concat(['', cat.note]).join('\n') };
	}
	for (const n of ['variant', 'theme', 'dpi', 'format', 'out']) if (flags[n] === true) throw new Error(`--${n} needs a value.`);
	if (!args.length) throw new Error(`Name an item: ${brand().bin} merch tee-front (one of ${merchItems().map((i) => i.id).join(', ')}, or all).`);
	const items = args.length === 1 && args[0] === 'all' ? merchItems() : args.map(findItem);
	const formats = [...new Set((str(flags.format) ?? 'both').split(',').flatMap((f) => { const x = pick('format', f.trim(), ['both', 'png', 'svg', 'pdf', 'all'] as const); return x === 'both' ? ['png', 'svg'] : x === 'all' ? ['png', 'svg', 'pdf'] : [x]; }))];
	if (str(flags.variant) && str(flags.theme) && flags.variant !== flags.theme) throw new Error('--variant and --theme disagree. Pass one.');
	const variant = str(flags.variant) ?? str(flags.theme);
	const dpi = num('dpi', flags.dpi, 72, 600, { integer: true });
	const slots: Record<string, string> = {};
	const headline = oneOf(flags, ['headline', 'title']);
	const url = oneOf(flags, ['url']);
	if (headline !== undefined) slots.headline = headline;
	if (url !== undefined) slots.url = url;
	const out = str(flags.out) ?? 'merch';
	const ext = /\.(png|svg|pdf)$/i.exec(out)?.[1]?.toLowerCase();
	if (ext && items.length > 1) throw new Error('--out is a file, so name one item. For several, pass a directory.');
	if (!ext && /\.(jpe?g|webp|gif|eps|ai)$/i.test(out)) throw new Error(`--out ${out}: merch writes png, svg or pdf.`);
	const want = ext ? [ext] : formats;
	const dir = resolve(cwd, out);
	const writes: { path: string; data: Buffer | string }[] = [];
	const files: OutFile[] = [];
	for (const item of items) {
		const own = args[0] === 'all' ? Object.fromEntries(Object.entries(slots).filter(([k]) => item.layers.some((l) => l.type === 'text' && l.slot === k))) : slots;
		const r = renderItem(item, { variant, slots: own, guides: flags.guides === true, sample: flags.sample === true, seed: seedOf(flags), dpi, png: want.includes('png'), svg: want.includes('svg'), pdf: want.includes('pdf') });
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
	}
	for (const w of writes) write(w.path, w.data);
	const note = merchCatalog().note;
	return { json: { files, note }, text: [...files.map((f) => `${f.path}  ${f.widthIn}x${f.heightIn} in${f.format === 'png' ? ` at ${f.dpi} dpi` : ''}`), note].join('\n') };
}
