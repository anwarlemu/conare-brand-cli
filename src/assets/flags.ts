import { resolve } from 'node:path';
import { platformOf } from '../design/platforms.js';
import { CopyError } from './glyphs.js';
import { num, pick, unknown } from './io.js';
import { customSize, sizeIds, sizeOf, type Size } from './layouts.js';
import { BADGES, type BadgeStyle } from './og.js';

// The flags every asset command shares, with the names other commands used before kept as aliases: --headline (--title),
// --body (--text, --subtitle), --badge (--eyebrow), --theme (--ground), --size, --image, --out, --seed.

export type Flags = Record<string, string | boolean | string[] | undefined>;
export const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const raw = (v: unknown) => (typeof v === 'string' ? v.replace(/\\n/g, '\n') : undefined);

/** One value from a flag and its aliases; two that disagree are an error. */
export function oneOf(flags: Flags, names: string[]): string | undefined {
	const given = names.map((n) => [n, raw(flags[n])] as const).filter((x): x is readonly [string, string] => x[1] !== undefined);
	for (const n of names) if (flags[n] === true) throw new Error(`--${n} needs a value.`);
	if (!given.length) return undefined;
	const [first] = given;
	for (const [n, v] of given) if (v.trim() !== first![1].trim()) throw new Error(`--${first![0]} and --${n} disagree. Pass one.`);
	return first![1];
}

export type Copy = { headline?: string; body?: string; badge?: string; badgeStyle?: BadgeStyle; note?: string; page?: string; credit?: string; partner?: string };

/** The copy flags. `--badge` is the badge's words; a style name there (label, pill...) still picks the style. */
export function copyFlags(flags: Flags): Copy {
	const badgeRaw = raw(flags.badge);
	if (flags.badge === true) throw new Error('--badge needs a value.');
	const style = str(flags['badge-style']) ?? (badgeRaw && (BADGES as string[]).includes(badgeRaw.trim().toLowerCase()) ? badgeRaw : undefined);
	const words = badgeRaw !== undefined && style !== badgeRaw ? badgeRaw : undefined;
	const eyebrow = oneOf(flags, ['eyebrow']);
	if (words !== undefined && eyebrow !== undefined && words.trim() !== eyebrow.trim()) throw new Error('--badge and --eyebrow disagree. Pass one.');
	const badgeStyle = style ? (pick('badge style', style, BADGES) as BadgeStyle) : undefined;
	return {
		headline: oneOf(flags, ['headline', 'title']), body: oneOf(flags, ['body', 'text', 'subtitle']), badge: words ?? eyebrow, badgeStyle,
		note: oneOf(flags, ['note']), page: oneOf(flags, ['page']), credit: oneOf(flags, ['credit']), partner: oneOf(flags, ['partner']),
	};
}

/** Sizes from a list of ids, aliases, WxH, `custom` (with --width and --height) or `all` (those in `all`). */
export function sizesFrom(tokens: string[], flags: Flags, all: string[]): Size[] {
	const out: Size[] = [];
	for (const t of tokens.flatMap((x) => x.split(',')).map((x) => x.trim()).filter(Boolean)) {
		if (t.toLowerCase() === 'all') out.push(...all.map((id) => sizeOf(id)!));
		else if (t.toLowerCase() === 'custom') {
			const w = num('width', flags.width, 1, 100000, { integer: true });
			const h = num('height', flags.height, 1, 100000, { integer: true });
			if (!w || !h) throw new Error('--size custom needs --width and --height.');
			out.push(customSize(w, h));
		} else {
			const s = sizeOf(t);
			if (!s) throw unknown('size', t, [...sizeIds(), 'custom', 'all']);
			out.push(s);
		}
	}
	if (!tokens.length && (flags.width !== undefined || flags.height !== undefined)) return sizesFrom(['custom'], flags, all);
	const seen = new Set<string>();
	return out.filter((s) => {
		const k = `${s.id}-${s.w}x${s.h}`;
		return seen.has(k) ? false : (seen.add(k), true);
	});
}

/** A size as it names a file. */
export const sizeName = (s: Size) => (s.id === 'custom' ? `${s.w}x${s.h}` : s.id);

export const RASTER = ['png', 'jpg', 'webp'] as const;
export type Format = 'png' | 'svg' | 'jpg' | 'webp';
const FORMATS: Format[] = ['png', 'svg', 'jpg', 'webp'];

/** --format: png, svg, jpg, webp, a list of them, both (PNG and SVG, the default) or all. A file name for --out decides. */
export function formatsFrom(flags: Flags, cwd: string, out: string | undefined): { formats: Format[]; named?: string } {
	const ext = out ? /\.(png|svg|jpe?g|webp)$/i.exec(out)?.[1]?.toLowerCase().replace('jpeg', 'jpg') : undefined;
	const bad = out ? /\.([a-z0-9]{2,4})$/i.exec(out)?.[1]?.toLowerCase() : undefined;
	if (!ext && bad && ['gif', 'pdf', 'mp4', 'webm', 'avif', 'tiff', 'bmp', 'ico'].includes(bad)) throw new Error(`--out ${out}: this command writes png, svg, jpg or webp, not ${bad}.`);
	if (flags.format === true) throw new Error('--format needs a value.');
	if (ext) {
		const asked = str(flags.format);
		if (asked && asked !== 'both' && asked.toLowerCase().replace('jpeg', 'jpg') !== ext) throw new Error(`--out ends in .${ext} and --format says ${asked}. Pass one.`);
		return { formats: [ext as Format], named: resolve(cwd, out!) };
	}
	const list = (str(flags.format) ?? 'both').toLowerCase().split(',').map((f) => f.trim().replace('jpeg', 'jpg'));
	const formats = list.flatMap((f) => (f === 'both' ? (['png', 'svg'] as Format[]) : f === 'all' ? FORMATS : [pick('format', f, [...FORMATS, 'both', 'all'] as const) as Format]));
	return { formats: [...new Set(formats)] };
}

/** The stem of a named file. */
export const stemOf = (named: string) => named.replace(/\.(png|svg|jpe?g|webp)$/i, '');

/** A note when a raster file is over what the platform takes. */
export function overLimit(s: Size, bytes: number, path: string): string | undefined {
	const limit = platformOf(s.id, s.w, s.h).limit;
	if (!limit || bytes <= limit.bytes) return undefined;
	return `${path} is ${(bytes / 1048576).toFixed(1)} MB; ${s.label} takes ${(limit.bytes / 1048576).toFixed(0)} MB${limit.official ? '' : ' (approximate)'}. Write it as jpg or webp (--format jpg).`;
}

export const seedOf = (flags: Flags) => num('seed', flags.seed, 0, 1_000_000_000, { integer: true });
export { CopyError };
