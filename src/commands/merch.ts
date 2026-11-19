import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { display, num, pick, write, type OutFile } from '../assets/io.js';
import { findItem, merchCatalog, merchItems, renderItem } from '../assets/merch.js';

// `merch`: print files at real size with bleed and safe area, from the approved lockups, themes and illustration.

type Flags = Record<string, string | boolean | string[] | undefined>;
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

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
		'--headline and --url change the words where an item has them. --dpi 72 to 600 (default 300). --format both (default), png or svg.',
		cat.note,
	].join('\n');
}

export async function runMerch(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = merchCatalog();
		return { json: cat, text: cat.items.map((i) => helpRow(i.id, `${i.name}: ${i.trim.width}x${i.trim.height} in + ${i.bleed} in bleed, safe ${i.safe} in, ${i.method}. Variants: ${i.variants.join(', ')}. ${i.source}`, 14)).concat(['', cat.note]).join('\n') };
	}
	for (const n of ['variant', 'headline', 'url', 'dpi', 'format', 'out']) if (flags[n] === true) throw new Error(`--${n} needs a value.`);
	if (!args.length) throw new Error(`Name an item: ${brand().bin} merch tee-front (one of ${merchItems().map((i) => i.id).join(', ')}, or all).`);
	const items = args.length === 1 && args[0] === 'all' ? merchItems() : args.map(findItem);
	const format = pick('format', str(flags.format) ?? 'both', ['both', 'png', 'svg'] as const);
	const dpi = num('dpi', flags.dpi, 72, 600, { integer: true });
	const slots: Record<string, string> = {};
	for (const k of ['headline', 'url']) if (typeof flags[k] === 'string') slots[k] = flags[k] as string;
	const dir = resolve(cwd, str(flags.out) ?? 'merch');
	const files: OutFile[] = [];
	for (const item of items) {
		const own = args[0] === 'all' ? Object.fromEntries(Object.entries(slots).filter(([k]) => item.layers.some((l) => l.type === 'text' && l.slot === k))) : slots;
		const r = renderItem(item, { variant: str(flags.variant), slots: own, guides: flags.guides === true, dpi, png: format !== 'svg', svg: format !== 'png' });
		const stem = join(dir, `${item.id}-${r.variant}`);
		const meta = { item: item.id, variant: r.variant, widthIn: r.widthIn, heightIn: r.heightIn, bleedIn: item.bleed, safeIn: item.safe, dieCut: Boolean(item.cut) };
		if (r.png) {
			write(`${stem}.png`, r.png);
			files.push({ path: display(cwd, `${stem}.png`), format: 'png', width: r.width, height: r.height, dpi: r.dpi, ...meta });
		}
		if (r.svg) {
			write(`${stem}.svg`, r.svg);
			files.push({ path: display(cwd, `${stem}.svg`), format: 'svg', width: Math.round(r.widthIn * 300), height: Math.round(r.heightIn * 300), ...meta });
		}
	}
	const note = merchCatalog().note;
	return { json: { files, note }, text: [...files.map((f) => `${f.path}  ${f.widthIn}x${f.heightIn} in${f.format === 'png' ? ` at ${f.dpi} dpi` : ''}`), note].join('\n') };
}
