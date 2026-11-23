import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { copyFlags, formatsFrom, overLimit, seedOf, sizeName, sizesFrom, stemOf, str, type Copy, type Flags, type Format } from './flags.js';
import { assertDrawn } from '../design/adapter.js';
import { platformOf } from '../design/platforms.js';
import { display, pick, unknown, write, type OutFile } from './io.js';
import { imageDoc, LAYOUTS, sizesFor, sizeOf, sizeIds, type Layout, type Size } from './layouts.js';
import { BADGES, compose, layersOf, renderDesign, slotsOf, type BadgeStyle, type Pic } from './og.js';
import { readPicture, type Picture } from './picture.js';

// `image <layout>`: the posts tool's layouts at any of their sizes, from flags or a JSON file of several (or of one
// carousel).

type Spec = Copy & { template: string; size?: string | string[]; width?: number; height?: number; theme?: string; highlight?: string; image?: string; seed?: number; sample?: boolean; name?: string };

/** Fields of an image in a JSON file, with the older names. */
const FIELDS = ['template', 'size', 'width', 'height', 'theme', 'headline', 'title', 'body', 'text', 'badge', 'eyebrow', 'badge-style', 'badgeStyle', 'note', 'page', 'credit', 'partner', 'highlight', 'image', 'seed', 'sample', 'name'];
const CAROUSEL = ['template', 'size', 'theme', 'highlight', 'numbering', 'note', 'name', 'slides', 'seed'];

export function layoutCatalog() {
	const D = imageDoc();
	return {
		templates: LAYOUTS.map((id) => ({ id, label: D.templates[id]!.label, description: D.templates[id]!.description, theme: D.templates[id]!.theme, badge: D.templates[id]!.badge, slots: slotsOf(id), requires: id === 'avatar' ? [] : id === 'partner' ? ['headline or partner'] : ['headline'], takesImage: id === 'feature' || id === 'app', sizes: sizesFor(id), layers: layersOf(id), sample: D.templates[id]!.sample })),
		sizes: sizeIds().map((id) => {
			const z = sizeOf(id)!;
			const p = platformOf(id, z.w, z.h);
			return { id, width: z.w, height: z.h, label: z.label, aliases: [...p.aliases, ...Object.entries(D.sizeAliases).filter(([, v]) => v === id).map(([k]) => k)], frame: z.frame, covered: p.avoid, safe: p.safe ?? null, note: p.note ?? null, source: p.source ?? null, uploadLimitMb: p.limit ? p.limit.bytes / 1048576 : null, shownAt: p.shown };
		}),
		customSize: { flags: ['--size custom --width W --height H', '--size WxH'], ...D.custom },
		themes: Object.entries(D.themes).map(([id, t]) => ({ id, label: t.label, ground: t.bg })),
		badges: BADGES,
		highlights: Object.keys(D.highlights),
		slots: ['headline', 'body', 'badge', 'badge-style', 'note', 'page', 'credit', 'partner', 'highlight', 'image'],
		formats: ['png', 'svg', 'jpg', 'webp', 'both', 'all'],
		seed: 'Rearranges the stacks (room, app, funding) or swaps the sides (tile, app and feature beside the words). Other layouts have no seeded art.',
		carousel: { fields: CAROUSEL, note: 'One JSON file: { "carousel": { "template": "card", "size": "square", "slides": [ { "headline": "..." } ] } }. Numbered 1 / N at the foot unless "numbering" is false.' },
		drawsOnly: 'The copy passed, the logo and the address. --sample fills sample copy.',
		notes: D.notes,
	};
}

const SEEDED = new Set<Layout>(['room', 'app', 'funding', 'tile', 'feature']);

function fromJson(x: Record<string, unknown>, i: number, file: string): Spec {
	for (const k of Object.keys(x)) if (!FIELDS.includes(k)) throw unknown(`field in image ${i + 1}`, k, FIELDS);
	if (typeof x.template !== 'string') throw new Error(`Image ${i + 1} in ${file} needs a "template" (${LAYOUTS.join(', ')}).`);
	const flags: Flags = {};
	for (const [k, v] of Object.entries(x)) {
		if (['template', 'size', 'width', 'height', 'seed', 'sample', 'name'].includes(k)) continue;
		if (typeof v !== 'string') throw new Error(`Image ${i + 1} in ${file}: "${k}" takes text.`);
		flags[k === 'badgeStyle' ? 'badge-style' : k] = v;
	}
	const size = x.size as string | string[] | undefined;
	if (size !== undefined && typeof size !== 'string' && !(Array.isArray(size) && size.every((s) => typeof s === 'string'))) throw new Error(`Image ${i + 1} in ${file}: "size" takes a size or a list of sizes.`);
	return { ...copyFlags(flags), template: x.template, size, width: x.width as number, height: x.height as number, theme: str(flags.theme), highlight: str(flags.highlight), image: str(flags.image), seed: x.seed as number | undefined, sample: x.sample === true, name: x.name as string | undefined };
}

function carouselSpecs(c: Record<string, unknown>, file: string): Spec[] {
	for (const k of Object.keys(c)) if (!CAROUSEL.includes(k)) throw unknown('field in the carousel', k, CAROUSEL);
	const slides = c.slides;
	if (!Array.isArray(slides) || slides.length < 2) throw new Error(`The carousel in ${file} needs a "slides" list of two or more.`);
	if (slides.length > 20) throw new Error(`The carousel in ${file} has ${slides.length} slides; platforms take up to 20.`);
	const size = (c.size as string | undefined) ?? 'square';
	if (typeof size !== 'string' || size.includes(',') || size === 'all') throw new Error('A carousel takes one size, so every slide matches.');
	const name = (c.name as string | undefined) ?? 'carousel';
	return slides.map((s, i) => {
		if (!s || typeof s !== 'object') throw new Error(`Slide ${i + 1} of the carousel in ${file} is not an object.`);
		const own = s as Record<string, unknown>;
		for (const k of ['size', 'page', 'width', 'height', 'name']) if (own[k] !== undefined) throw new Error(`Slide ${i + 1} of the carousel sets "${k}"; that goes on the carousel.`);
		const base = { template: c.template ?? 'card', ...(c.theme ? { theme: c.theme } : {}), ...(c.highlight ? { highlight: c.highlight } : {}), ...(c.note ? { note: c.note } : {}), ...(c.seed !== undefined ? { seed: c.seed } : {}) };
		const spec = fromJson({ ...base, ...own, size }, i, file);
		if (c.numbering !== false && spec.template !== 'avatar') spec.page = `${i + 1} / ${slides.length}`;
		spec.name = `${name}-${String(i + 1).padStart(2, '0')}`;
		return spec;
	});
}

export type ImageResult = { json: { files: OutFile[]; notes: string[] }; text: string };

export async function runLayouts(cwd: string, template: string | undefined, sizeArgs: string[], flags: Flags): Promise<ImageResult> {
	for (const n of ['image', 'template', 'size', 'theme', 'out', 'format', 'highlight', 'input', 'ground', 'width', 'height', 'seed', 'scale']) if (flags[n] === true) throw new Error(`--${n} needs a value.`);
	if (str(flags.by) || str(flags.author)) throw new Error('A layout does not draw --by. Quote is one of the five cards (image quote).');
	if (str(flags.ground) && str(flags.theme)) throw new Error('Pass --theme or --ground, not both.');
	const out = str(flags.out);
	const { formats, named } = formatsFrom(flags, cwd, out);
	let specs: Spec[];
	let base = cwd;
	let flat = false;
	if (str(flags.input)) {
		const path = isAbsolute(String(flags.input)) ? String(flags.input) : resolve(cwd, String(flags.input));
		let parsed: unknown;
		try {
			parsed = JSON.parse(readFileSync(path, 'utf8'));
		} catch (err) {
			throw new Error(`Could not read ${flags.input} as JSON (${(err as Error).message}).`);
		}
		const doc = parsed as { images?: unknown; carousel?: unknown };
		if (doc.carousel && typeof doc.carousel === 'object') {
			specs = carouselSpecs(doc.carousel as Record<string, unknown>, String(flags.input));
			flat = true;
		} else {
			const list = Array.isArray(doc.images) ? doc.images : [parsed];
			if (!list.length) throw new Error(`${flags.input} has no images.`);
			specs = list.map((x, i) => {
				if (!x || typeof x !== 'object') throw new Error(`Image ${i + 1} in ${flags.input} is not an object.`);
				return fromJson(x as Record<string, unknown>, i, String(flags.input));
			});
		}
		base = dirname(path);
		for (const k of ['template', 'headline', 'title', 'body', 'text', 'subtitle', 'badge', 'eyebrow', 'note', 'page', 'image', 'theme', 'highlight', 'partner', 'credit', 'seed']) if (flags[k] !== undefined) throw new Error(`--${k} goes with one image; with --input, put it in the file.`);
		if (template) throw new Error(`\`${template}\` goes with one image; with --input, put "template" in the file.`);
	} else {
		const sizes = [str(flags.size), ...sizeArgs].filter((x): x is string => Boolean(x));
		const ground = str(flags.ground);
		if (ground && !['paper', 'ink'].includes(ground)) throw unknown('ground', ground, ['paper', 'ink']);
		specs = [{ ...copyFlags(flags), template: template ?? String(flags.template), size: sizes.length ? sizes : undefined, theme: str(flags.theme) ?? (ground === 'ink' ? 'black' : ground), highlight: str(flags.highlight), image: str(flags.image), seed: seedOf(flags), sample: flags.sample === true, width: flags.width as unknown as number, height: flags.height as unknown as number }];
	}
	const scale = scaleFlag(flags);
	const dir = named ? dirname(named) : resolve(cwd, out ?? 'imagery');
	const jobs: { spec: Spec; layout: Layout; size: Size }[] = [];
	for (const spec of specs) {
		const layout = pick('template', spec.template, LAYOUTS) as Layout;
		const list = Array.isArray(spec.size) ? spec.size : spec.size ? [spec.size] : [];
		const sizes = sizesFrom(list, { width: spec.width === undefined ? undefined : String(spec.width), height: spec.height === undefined ? undefined : String(spec.height) }, sizesFor(layout));
		for (const size of sizes.length ? sizes : [sizeOf(layout === 'avatar' ? 'avatar' : 'og')!]) jobs.push({ spec, layout, size });
	}
	if (named && jobs.length > 1) throw new Error('--out is a file, so ask for one image. For several, pass a directory.');
	const files: OutFile[] = [];
	const notes = new Set<string>();
	const writes: { path: string; data: Buffer | string }[] = [];
	for (const { spec, layout, size } of jobs) {
		const theme = spec.theme ? pick('theme', spec.theme, Object.keys(imageDoc().themes)) : undefined;
		const highlight = spec.highlight ? pick('highlight', spec.highlight, Object.keys(imageDoc().highlights)) : undefined;
		if (spec.image && layout !== 'feature' && layout !== 'app') throw new Error(`${layout} has no picture window. --image goes in the feature layout (or app).`);
		if (spec.seed && !SEEDED.has(layout)) notes.add(`${layout} has no seeded art; --seed changes nothing.`);
		const picture = spec.image ? await readPicture(base, spec.image, 2000) : null;
		const d = compose({ template: layout, size, theme, headline: spec.headline, body: spec.body, badge: spec.badgeStyle as BadgeStyle, badgeText: spec.badge, note: spec.note, page: spec.page, highlight, partner: spec.partner, credit: spec.credit, seed: spec.seed, sample: spec.sample });
		const r = await renderDesign(d, picture ? picOf(picture) : null, { png: formats.includes('png'), svg: formats.includes('svg'), jpg: formats.includes('jpg'), webp: formats.includes('webp'), scale });
		assertDrawn({ kind: 'image', template: layout, size: { id: size.id, width: size.w, height: size.h }, copy: spec.sample ? {} : { headline: spec.headline, body: spec.body, badge: spec.badge, note: spec.note, page: spec.page, credit: spec.credit, partner: spec.partner }, layers: r.layers });
		const stem = named ? stemOf(named) : join(dir, flat ? `${spec.name}-${sizeName(size)}` : `${spec.name ?? layout}-${sizeName(size)}${theme && theme !== imageDoc().templates[layout]!.theme ? `-${theme}` : ''}${spec.seed ? `-s${spec.seed}` : ''}`);
		for (const n of pictureNotes(picture, r.layers.find((l) => l.id === 'picture')?.box.w ?? 0, spec.image)) notes.add(n);
		const ext = (f: Format) => (f === 'jpg' && named && /\.jpeg$/i.test(named) ? 'jpeg' : f);
		for (const f of formats) {
			const data = f === 'svg' ? r.svg! : f === 'png' ? r.png! : f === 'jpg' ? r.jpg! : r.webp!;
			const path = `${stem}.${ext(f)}`;
			writes.push({ path, data });
			const k = f === 'svg' ? 1 : scale;
			files.push({ path: display(cwd, path), format: f, template: layout, size: size.id, theme: d.theme, width: Math.round(size.w * k), height: Math.round(size.h * k), bytes: data.length });
			if (f !== 'svg') {
				const n = overLimit(size, data.length, display(cwd, path));
				if (n) notes.add(n);
			}
		}
		if (size.note) notes.add(`${size.label}: ${size.note}`);
	}
	for (const w of writes) write(w.path, w.data);
	return { json: { files, notes: [...notes] }, text: [...files.map((f) => `${f.path}  ${f.width}x${f.height}`), ...[...notes].map((n) => `note: ${n}`)].join('\n') };
}

export function scaleFlag(flags: Flags): number {
	const v = str(flags.scale);
	if (v === undefined) return 1;
	const n = Number(v);
	if (![1, 2, 3].includes(n)) throw new Error(`--scale takes 1, 2 or 3, not ${v}.`);
	return n;
}

export const picOf = (p: Picture): Pic => ({ img: p.canvas, w: p.width, h: p.height });

/** A picture stretched past its own pixels looks soft; say so. */
export function pictureNotes(p: Picture | null, drawn: number, path: string | undefined): string[] {
	if (!p || !drawn || drawn <= p.natural * 1.25) return [];
	return [`${path} is ${p.natural} px wide and is drawn ${Math.round(drawn)} px wide, so it will look soft.`];
}

export { sizeIds };
