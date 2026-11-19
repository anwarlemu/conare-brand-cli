import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { BADGES, LAYOUTS, compose, imageDoc, renderDesign, sizeIds, sizeOf, type BadgeStyle, type Layout, type Pic } from './og.js';
import { display, pick, unknown, write, type OutFile } from './io.js';
import { readPicture } from './picture.js';

// `image --template <layout>`: the posts tool's layouts at any of their sizes, from flags or a JSON file of several.

type Flags = Record<string, string | boolean | string[] | undefined>;
type Spec = { template: string; size?: string | string[]; theme?: string; title?: string; text?: string; eyebrow?: string; badge?: string; highlight?: string; partner?: string; credit?: string; image?: string; name?: string };

const FIELDS = ['template', 'size', 'theme', 'title', 'text', 'eyebrow', 'badge', 'highlight', 'partner', 'credit', 'image', 'name'];

export function layoutCatalog() {
	const D = imageDoc();
	return {
		templates: LAYOUTS.map((id) => ({ id, label: D.templates[id]!.label, description: D.templates[id]!.description, theme: D.templates[id]!.theme, badge: D.templates[id]!.badge, sample: { title: D.templates[id]!.headline, text: D.templates[id]!.body, eyebrow: D.templates[id]!.badgeText, partner: D.templates[id]!.partner }, takesImage: id === 'feature' })),
		sizes: Object.entries(D.sizes).map(([id, s]) => ({ id, width: s.w, height: s.h, label: s.label, aliases: s.aliases ?? [] })),
		themes: Object.entries(D.themes).map(([id, t]) => ({ id, label: t.label, ground: t.bg })),
		badges: BADGES,
		highlights: Object.keys(D.highlights),
		slots: ['title', 'text', 'eyebrow', 'badge', 'highlight', 'partner', 'credit', 'image'],
		formats: ['png', 'svg', 'both'],
		notes: D.notes,
	};
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export async function runLayouts(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	for (const n of ['title', 'text', 'subtitle', 'eyebrow', 'image', 'template', 'size', 'theme', 'out', 'format', 'badge', 'highlight', 'partner', 'credit', 'input']) if (flags[n] === true) throw new Error(`--${n} needs a value.`);
	if (str(flags.by) || str(flags.author)) throw new Error('A layout does not draw --by. Quote is one of the first five templates (image --template quote).');
	if (str(flags.ground) && str(flags.theme)) throw new Error('Pass --theme or --ground, not both.');
	const format = pick('format', str(flags.format) ?? 'both', ['png', 'svg', 'both'] as const);
	let specs: Spec[];
	let base = cwd;
	if (str(flags.input)) {
		const path = isAbsolute(String(flags.input)) ? String(flags.input) : resolve(cwd, String(flags.input));
		let parsed: unknown;
		try {
			parsed = JSON.parse(readFileSync(path, 'utf8'));
		} catch (err) {
			throw new Error(`Could not read ${flags.input} as JSON (${(err as Error).message}).`);
		}
		const list = Array.isArray((parsed as { images?: unknown }).images) ? (parsed as { images: unknown[] }).images : [parsed];
		specs = list.map((x, i) => {
			if (!x || typeof x !== 'object') throw new Error(`Image ${i + 1} in ${flags.input} is not an object.`);
			for (const k of Object.keys(x)) if (!FIELDS.includes(k)) throw unknown(`field in image ${i + 1}`, k, FIELDS);
			if (typeof (x as Spec).template !== 'string') throw new Error(`Image ${i + 1} needs a "template" (${LAYOUTS.join(', ')}).`);
			return x as Spec;
		});
		base = dirname(path);
		for (const k of ['template', 'title', 'text', 'eyebrow', 'image', 'theme', 'badge', 'highlight', 'partner', 'credit']) if (flags[k] !== undefined) throw new Error(`--${k} goes with one image; with --input, put it in the file.`);
	} else {
		const sizes = [str(flags.size), ...args].filter(Boolean).join(',');
		const text = str(flags.text);
		const subtitle = str(flags.subtitle);
		if (text && subtitle && text !== subtitle) throw new Error('--text and --subtitle disagree. Pass one.');
		specs = [{ template: String(flags.template), size: sizes || undefined, theme: str(flags.theme) ?? (str(flags.ground) === 'ink' ? 'black' : str(flags.ground)), title: typeof flags.title === 'string' ? flags.title : undefined, text: text ?? subtitle ?? (typeof flags.text === 'string' ? flags.text : undefined), eyebrow: typeof flags.eyebrow === 'string' ? flags.eyebrow : undefined, badge: str(flags.badge), highlight: str(flags.highlight), partner: typeof flags.partner === 'string' ? flags.partner : undefined, credit: str(flags.credit), image: str(flags.image) }];
	}
	const out = str(flags.out);
	const named = out && /\.(png|svg)$/i.test(out) ? resolve(cwd, out) : undefined;
	const dir = named ? dirname(named) : resolve(cwd, out ?? 'imagery');
	const jobs: { spec: Spec; size: string }[] = [];
	for (const spec of specs) {
		const raw = Array.isArray(spec.size) ? spec.size : String(spec.size ?? 'og').split(',');
		const sizes: string[] = [];
		for (const t of raw.map((s) => s.trim()).filter(Boolean)) {
			if (t.toLowerCase() === 'all') sizes.push(...sizeIds());
			else {
				const s = sizeOf(t);
				if (!s) throw unknown('size', t, [...sizeIds(), 'all']);
				sizes.push(s.id);
			}
		}
		for (const size of [...new Set(sizes)]) jobs.push({ spec, size });
	}
	if (named && jobs.length > 1) throw new Error('--out is a file, so ask for one image. For several, pass a directory.');
	const files: OutFile[] = [];
	for (const { spec, size } of jobs) {
		const template = pick('template', spec.template, LAYOUTS) as Layout;
		const theme = spec.theme ? pick('theme', spec.theme, Object.keys(imageDoc().themes)) : undefined;
		const badge = spec.badge ? (pick('badge', spec.badge, BADGES) as BadgeStyle) : undefined;
		const highlight = spec.highlight ? pick('highlight', spec.highlight, Object.keys(imageDoc().highlights)) : undefined;
		if (spec.image && template !== 'feature') throw new Error(`${template} has no picture window. --image goes in the feature layout.`);
		const pic: Pic | null = spec.image ? await picture(base, spec.image) : null;
		const s = sizeOf(size)!;
		const d = compose({ template, w: s.w, h: s.h, theme, headline: spec.title?.replace(/\\n/g, '\n'), body: spec.text?.replace(/\\n/g, '\n'), badge, badgeText: spec.eyebrow, highlight, partner: spec.partner, credit: spec.credit });
		const want = named ? (named.toLowerCase().endsWith('.svg') ? 'svg' : 'png') : format;
		const r = await renderDesign(d, pic, { png: want !== 'svg', svg: want !== 'png' });
		const stem = named ? named.replace(/\.(png|svg)$/i, '') : join(dir, `${spec.name ?? template}-${size}${theme && theme !== imageDoc().templates[template]!.theme ? `-${theme}` : ''}`);
		const meta = { template, size, theme: d.theme, width: s.w, height: s.h };
		if (r.png) {
			write(`${stem}.png`, r.png);
			files.push({ path: display(cwd, `${stem}.png`), format: 'png', ...meta });
		}
		if (r.svg) {
			write(`${stem}.svg`, r.svg);
			files.push({ path: display(cwd, `${stem}.svg`), format: 'svg', ...meta });
		}
	}
	return { json: { files }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n') };
}

async function picture(base: string, path: string): Promise<Pic> {
	const p = await readPicture(base, path, 1600);
	return { img: p.canvas, w: p.width, h: p.height };
}
