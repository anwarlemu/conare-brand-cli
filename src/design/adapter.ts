import { createCanvas, loadImage } from '@napi-rs/canvas';
import { brand } from '../lib/brand.js';
import { blend, color, familyFor, font, scratch } from '../assets/canvas.js';
import { deckDoc, renderSlide, slideTypes, type SlideType } from '../assets/deck.js';
import { EXTRAS } from '../assets/slides-extra.js';
import { imageDoc, LAYOUTS, sizeIds, sizesFor, sizeOf, type Layout, type Size } from '../assets/layouts.js';
import { merchDoc, merchItems, renderItem, findItem, PX_PER_IN } from '../assets/merch.js';
import { BADGES, compose, customSize, layersOf, renderDesign, slotsOf, type BadgeStyle, type Pic } from '../assets/og.js';
import { readPicture } from '../assets/picture.js';
import { BLOCKS, blockPictures, drawBlocks, recipeFor } from '../assets/blocks.js';
import { PAGE_FLAVORS, SECTIONS, writePage } from '../assets/page.js';
import { rgbOf, surface, toPng, toSvg } from '../assets/canvas.js';
import { PLATFORMS } from './platforms.js';
import { renderVideo } from '../assets/video.js';
import { illustrateDoc, renderSubject, SUBJECTS } from '../illustrate/draw.js';
import { cardLayers } from '../image/draw.js';
import { cardPicture } from '../image/picture.js';
import { encodeAs, renderImages } from '../image/render.js';
import { GROUNDS, SIZES, TEMPLATE_FIELDS, TEMPLATES, theme as cardTheme, type GroundId, type TemplateId } from '../image/spec.js';
import { checkDesign, checkText, errorsOf, sheetCanvas, type Adapter, type DesignDoc, type DrawnLayer, type Format, type Painter, type TemplateInfo } from './index.js';

// This brand's side of the design core: what can be made, and how a document becomes the engines' own requests.
// Images are the five cards (src/image) and the layouts (src/assets/og.ts); slides, merch, illustrations and videos
// take copy, theme, options, size and seed.

const SEEDED = new Set<string>(['room', 'app', 'funding', 'tile', 'feature']);
const SEEDED_ART = new Set(['stack', 'stacks', 'pixels', 'hatch', 'strip', 'scene']);
const TAKES_ART_PICTURE = new Set(['stack', 'hatch']);
const RASTERS: Format[] = ['png', 'svg', 'jpg', 'webp'];

const isLayout = (t: string): t is Layout => (LAYOUTS as readonly string[]).includes(t);
const isCard = (t: string): t is TemplateId => TEMPLATES.some((x) => x.id === t);
const after = (t: string, prefix: string) => (t.startsWith(prefix) ? t.slice(prefix.length) : undefined);

const themes = () => Object.keys(imageDoc().themes);
const grounds = () => Object.fromEntries(themes().map((t) => [t, color(imageDoc().themes[t]!.bg)]));

/** A slide's words by the shared names, and the engine's slot each one is. */
const SLIDE_COPY: Record<SlideType, Record<string, string>> = {
	cover: { headline: 'title', body: 'body', badge: 'eyebrow' },
	section: { headline: 'title', badge: 'number' },
	statement: { headline: 'title', badge: 'eyebrow' },
	bullets: { headline: 'title', items: 'items' },
	stat: { stat: 'stat', body: 'title' },
	quote: { quote: 'quote', by: 'attribution' },
	image: { headline: 'title', body: 'body', badge: 'eyebrow' },
	end: { headline: 'title', body: 'url' },
	qa: { headline: 'title', body: 'body' },
	agenda: { headline: 'title', items: 'items' },
	timeline: { headline: 'title', items: 'items' },
	comparison: { headline: 'title', left: 'left', right: 'right', leftItems: 'leftItems', rightItems: 'rightItems' },
	chart: { headline: 'title', data: 'data' },
	team: { headline: 'title', people: 'people' },
	grid: { headline: 'title' },
};
/** Slides whose part under the title is drawn beside the layout (deck only for now; their parts are not layers a design edits). */
const DESIGN_SLIDES = () => slideTypes().filter((t) => !(EXTRAS as string[]).includes(t));

const layoutOptions = (): TemplateInfo['options'] => [
	{ id: 'badge-style', values: [...BADGES], description: 'How the badge is drawn' },
	{ id: 'highlight', values: Object.keys(imageDoc().highlights), description: 'The color of *starred words* and the final stop' },
];

/* The lockup, the words and a window are one column, set as a block and centered in what is left: a larger, smaller or
   hidden part moves the others in it, and the foot (address, note, page, rule) gives the column its room. The art,
   patterns and grounds stay put. */
const COLUMN = ['logo', 'badge', 'headline', 'body', 'credit', 'items', 'window', 'picture', 'partner', 'quote', 'by'];
const FOOT = ['address', 'note', 'page', 'rule'];
const REFLOWS: Record<string, string[]> = Object.fromEntries([
	...COLUMN.map((id) => [id, [...COLUMN.filter((x) => x !== id), ...(id === 'logo' ? [...FOOT, 'panel', 'pattern', 'art'] : [])]]),
	...FOOT.map((id) => [id, [...COLUMN, ...FOOT.filter((x) => x !== id)]]),
]);

function layoutInfo(t: Layout): TemplateInfo {
	return {
		id: t, kind: 'image', description: imageDoc().templates[t]!.description, sizes: [...sizesFor(t), ...(t === 'avatar' ? [] : ['custom'])], themes: themes(),
		copy: slotsOf(t).map((id) => ({ id, ...(id === (t === 'partner' ? 'partner' : 'headline') ? { required: true } : {}), ...(COPY_NOTES[id] ? { description: COPY_NOTES[id] } : {}) })),
		images: t === 'app' || t === 'feature' ? [{ id: 'picture' }] : [], options: t === 'avatar' ? [] : layoutOptions(), layers: layersOf(t), grounds: grounds(), formats: RASTERS, reflows: REFLOWS,
	};
}

const COPY_NOTES: Record<string, string> = { badge: 'The label over the words, or in the corner', note: 'A line at the foot', page: 'A page number at the foot (carousels)', credit: 'A small line under the words (an @handle)', partner: "The partner's name beside the logo", by: 'Who said it', items: 'Points, separated by |' };

function cardInfo(t: TemplateId): TemplateInfo {
	const f = TEMPLATE_FIELDS[t].accepts;
	return {
		id: t, kind: 'image', description: TEMPLATES.find((x) => x.id === t)!.description, sizes: [...SIZES.map((s) => s.id), 'custom'], themes: GROUNDS.map((g) => g.id),
		copy: [{ id: 'headline', required: true }, ...(f.includes('text') ? [{ id: 'body' }] : []), ...(f.includes('eyebrow') ? [{ id: 'badge' }] : []), ...(f.includes('by') ? [{ id: 'by', description: COPY_NOTES.by }] : [])],
		images: f.includes('image') ? [{ id: 'picture' }] : [], options: [], layers: cardLayers(t), grounds: Object.fromEntries(GROUNDS.map((g) => [g.id, cardTheme(g.id).bg.toLowerCase()])), formats: RASTERS, reflows: REFLOWS,
	};
}

function slideInfo(t: SlideType): TemplateInfo {
	const d = deckDoc().slides[t];
	const map = SLIDE_COPY[t];
	return {
		id: `slide-${t}`, kind: 'slide', description: d.description, sizes: ['slide'], themes: themes(),
		copy: Object.entries(map).map(([id, slot]) => ({ id, ...(d.required.includes(slot) ? { required: true } : {}), ...(COPY_NOTES[id] ? { description: COPY_NOTES[id] } : {}) })),
		images: d.slots.includes('image') ? [{ id: 'picture' }] : [], options: [{ id: 'highlight', values: Object.keys(imageDoc().highlights) }],
		layers: [...layersOf(d.layout).filter((l) => !['note', 'page', 'credit', 'partner'].includes(l.id)), ...(t === 'bullets' ? [{ id: 'items', can: { scale: [0.7, 1.4] as [number, number] } }] : [])],
		grounds: grounds(), formats: [...RASTERS, 'pdf'], layouts: [`${t} slide`], reflows: REFLOWS,
	};
}

const merchSize = (id: string) => {
	const i = findItem(id);
	return { id: 'print', width: Math.round((i.size[0] + 2 * i.bleed) * MERCH_PPI), height: Math.round((i.size[1] + 2 * i.bleed) * MERCH_PPI) };
};
/** A merch design is drawn at 100 px per inch; --scale 3 is the 300 dpi print file, and SVG is at real size. */
const MERCH_PPI = 100;

function merchInfo(id: string): TemplateInfo {
	const i = findItem(id);
	const vg = Object.fromEntries(i.variants.map((v) => [v, merchDoc().variants[v]!]).filter(([, v]) => (v as { ground: boolean }).ground).map(([k, v]) => [k, color(imageDoc().themes[(v as { theme: string }).theme]!.bg)]));
	return {
		id, kind: 'merch', description: `${i.name}: ${i.size[0]} by ${i.size[1]} in, ${i.method}.`, sizes: ['print'], themes: i.variants,
		copy: [...new Set(i.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : [])))].map((s) => ({ id: s })), images: [], options: [], layers: [], grounds: vg,
		formats: i.variants.some((v) => merchDoc().variants[v]!.ground) ? ['png', 'svg', 'pdf'] : ['png', 'svg'],
	};
}

function artInfo(s: string): TemplateInfo {
	return {
		id: `illustration-${s}`, kind: 'illustration', description: illustrateDoc().subjects[s]!, sizes: ['square', ...sizeIds().filter((x) => x !== 'square'), 'custom'], themes: themes(), copy: [],
		images: TAKES_ART_PICTURE.has(s) ? [{ id: 'picture' }] : [], options: s === 'stack' ? [{ id: 'shape', values: ['tall', 'wide'] }] : [], layers: [], grounds: grounds(), formats: RASTERS, layouts: [`${s} illustration`],
	};
}

function videoInfo(t: Layout): TemplateInfo {
	const i = layoutInfo(t);
	return { ...i, id: `video-${t}`, kind: 'video', description: `${i.description} Coming in the way the site moves.`, sizes: ['square', ...sizesFor(t).filter((s) => s !== 'square'), 'custom'], options: [...i.options, { id: 'fps', range: [12, 60], description: 'Frames a second (30)' }], layers: [], formats: ['png', 'mp4'], layouts: [`${t} video`] };
}

const sizeFor = (doc: DesignDoc): Size => (doc.size.id === 'custom' ? customSize(doc.size.width, doc.size.height) : sizeOf(doc.size.id)!);
const text = (v: string | undefined) => (v === undefined ? undefined : v);
const opt = (doc: DesignDoc, id: string) => (doc.options[id] === undefined ? undefined : String(doc.options[id]));

async function picture(doc: DesignDoc, dir: string): Promise<Pic | null> {
	if (!doc.images.picture) return null;
	const p = await readPicture(dir, doc.images.picture, 2000);
	return { img: p.canvas, w: p.width, h: p.height };
}

/** The layout design a document stands for. */
function layoutDesign(doc: DesignDoc, t: Layout) {
	return compose({
		template: t, size: sizeFor(doc), theme: doc.theme, headline: text(doc.copy.headline), body: doc.copy.body, badgeText: doc.copy.badge, note: doc.copy.note, page: doc.copy.page, credit: doc.copy.credit, partner: doc.copy.partner,
		badge: opt(doc, 'badge-style') as BadgeStyle | undefined, highlight: opt(doc, 'highlight'), seed: doc.seed, layers: doc.layers,
	});
}

type Out = { files: Record<string, Uint8Array>; layers: DrawnLayer[]; notes?: string[] };
const want = (formats: Format[]) => ({ png: formats.includes('png'), svg: formats.includes('svg'), jpg: formats.includes('jpg'), webp: formats.includes('webp') });
function collect(formats: Format[], r: { png?: Buffer; svg?: string; jpg?: Buffer; webp?: Buffer; pdf?: Buffer }): Record<string, Uint8Array> {
	const files: Record<string, Uint8Array> = {};
	for (const f of formats) {
		const v = r[f as 'png'] as Buffer | string | undefined;
		if (v !== undefined) files[f] = typeof v === 'string' ? Buffer.from(v) : v;
	}
	return files;
}

/** A compose design: the brand's blocks in their cells (src/assets/blocks.ts), PNG, JPEG, WebP and SVG. */
async function renderCompose(doc: DesignDoc, dir: string, formats: Format[], scale: number): Promise<Out> {
	const pics = await blockPictures(doc, async (slot) => {
		const v = doc.images[slot];
		if (!v || v === 'none') return null;
		const p = await readPicture(dir, v, 2000);
		return { img: p.canvas, w: p.width, h: p.height };
	});
	const { width: W, height: H } = doc.size;
	/* A design with nothing to draw writes no picture: a blank ground is never a result. */
	if (!(doc.blocks ?? []).some((b) => !doc.layers[b.id]?.hidden)) return { files: {}, layers: [], notes: [`Nothing is drawn yet, so no picture was written. Add a block: ${brand().bin} design compose add <file> headline "..." (blocks: ${BLOCKS.map((b) => b.type).join(', ')}).`] };
	const s = surface(W, H, { scale: formats.length ? scale : 1 });
	const layers = drawBlocks(s.ctx, doc, pics);
	const r: { png?: Buffer; svg?: string; jpg?: Buffer; webp?: Buffer } = {};
	if (formats.includes('png') || !formats.length) r.png = toPng(s, { opaque: true });
	if (formats.includes('jpg')) r.jpg = (s.canvas as unknown as { toBuffer(t: string, q: number): Buffer }).toBuffer('image/jpeg', 92);
	if (formats.includes('webp')) r.webp = (s.canvas as unknown as { toBuffer(t: string, q: number): Buffer }).toBuffer('image/webp', 92);
	if (formats.includes('svg')) {
		const v = surface(W, H, { svg: true });
		drawBlocks(v.ctx, doc, pics);
		r.svg = toSvg(v);
	}
	void rgbOf;
	return { files: collect(formats, r), layers };
}

async function renderDoc(doc: DesignDoc, dir: string, out: { formats: Format[]; scale: number }): Promise<Out> {
	const t = doc.template;
	const { formats, scale } = out;
	if (t === 'compose') return renderCompose(doc, dir, formats, scale);
	if (isLayout(t)) {
		const r = await renderDesign(layoutDesign(doc, t), await picture(doc, dir), { ...want(formats), rgb: !formats.length, scale: formats.length ? scale : 1 });
		return { files: collect(formats, r), layers: r.layers };
	}
	if (isCard(t)) {
		const pic = doc.images.picture ? (await cardPicture(dir, doc.images.picture)).image : undefined;
		const [r] = await renderImages({ template: t, sizes: [sizeFor(doc)], ground: doc.theme as GroundId, title: doc.copy.headline ?? '', text: doc.copy.body, eyebrow: doc.copy.badge, by: doc.copy.by, image: pic, layers: doc.layers, scale, raster: formats.some((f) => f !== 'svg') });
		const files: Record<string, Uint8Array> = {};
		for (const f of formats) {
			if (f === 'svg') files.svg = Buffer.from(r!.svg);
			else if (f === 'png') files.png = r!.png;
			else if (f === 'jpg' || f === 'webp') files[f] = await encodeAs(r!.png, f);
		}
		return { files, layers: r!.layers };
	}
	const slide = after(t, 'slide-') as SlideType | undefined;
	if (slide) {
		const copy = Object.fromEntries(Object.entries(SLIDE_COPY[slide]).flatMap(([id, slot]) => (doc.copy[id] === undefined ? [] : [[slot, doc.copy[id]!]])));
		const r = await renderSlide({ type: slide, ...copy, theme: doc.theme, layers: doc.layers, seed: doc.seed, highlight: opt(doc, 'highlight'), picture: await picture(doc, dir) }, { ...want(formats), pdf: formats.includes('pdf'), png: formats.length === 0 ? true : formats.some((f) => f !== 'svg'), scale: formats.length ? scale : 1 });
		return { files: collect(formats, r), layers: r.layers };
	}
	const art = after(t, 'illustration-');
	if (art) {
		const p = await picture(doc, dir);
		const r = renderSubject({ subject: art, width: doc.size.width, height: doc.size.height, theme: doc.theme, seed: doc.seed || undefined, shape: opt(doc, 'shape') as 'tall' | 'wide' | undefined, picture: p }, { ...want(formats), scale });
		return { files: collect(formats, r), layers: [] };
	}
	const video = after(t, 'video-') as Layout | undefined;
	if (video) {
		const d = layoutDesign({ ...doc, layers: {} }, video);
		const pic = await picture(doc, dir);
		const r = await renderDesign(d, pic, { png: formats.includes('png'), rgb: !formats.includes('png'), scale: formats.includes('png') ? scale : 1 });
		const files = collect(formats, r);
		if (formats.includes('mp4')) files.mp4 = (await renderVideo(d, pic, Number(doc.options.fps ?? 30), 'mp4')).data;
		return { files, layers: r.layers.map((l) => ({ ...l, can: {} })) };
	}
	const item = findItem(t);
	const slots = Object.fromEntries(Object.entries(doc.copy));
	const r = renderItem(item, { variant: doc.theme, slots, dpi: MERCH_PPI * scale, png: formats.includes('png') || !formats.length, svg: formats.includes('svg'), pdf: formats.includes('pdf') });
	const k = MERCH_PPI / PX_PER_IN;
	const box = (b: { x: number; y: number; w: number; h: number }) => ({ x: b.x * k, y: b.y * k, w: b.w * k, h: b.h * k });
	return { files: collect(formats, r), layers: r.layers.map((l) => ({ ...l, box: box(l.box), ...(l.ink ? { ink: l.ink.map(box) } : {}), ...(l.text ? { text: { ...l.text, size: l.text.size * k } } : {}), ...(l.logo ? { logo: { clear: l.logo.clear * k, min: l.logo.min * k } } : {}) })) };
}

/** Every color words may be drawn in or on. */
export function wordColors(): string[] {
	const D = imageDoc();
	const out = new Set<string>();
	for (const t of Object.values(D.themes)) for (const c of [t.bg, t.ink, t.muted]) out.add(color(c));
	for (const c of [D.accent, D.accentSmall, ...Object.values(D.highlightAlt)]) out.add(color(c));
	for (const c of Object.values(D.highlights)) if (c) out.add(color(c));
	/* The pill's faint fill over each ground. */
	for (const t of Object.values(D.themes)) out.add(blend(color(t.dark ? 'off-white/0.14' : 'off-black/0.04'), color(t.bg)));
	for (const g of GROUNDS) {
		const t = cardTheme(g.id);
		for (const c of [t.bg, t.fg, t.fgMuted, t.accent, t.accentSmall, t.onAccent]) out.add(c.toLowerCase());
	}
	return [...out];
}

export function adapter(): Adapter {
	return {
		brand: brand().bin,
		templates: () => [...LAYOUTS.map(layoutInfo), ...TEMPLATES.map((t) => cardInfo(t.id)), ...DESIGN_SLIDES().map(slideInfo), ...merchItems().map((i) => merchInfo(i.id)), ...SUBJECTS().map(artInfo), ...LAYOUTS.filter((l) => l !== 'avatar').map(videoInfo)],
		defaults(template, size) {
			if (template === 'compose') {
				const z = size === 'custom' ? { id: 'custom', w: 1200, h: 800 } : sizeOf(size) ?? (() => { const p = PLATFORMS.find((x) => x.id === size); return p ? { id: p.id, w: p.width, h: p.height } : undefined; })();
				if (!z) throw new Error(`Unknown size ${size}.`);
				return { size: { id: z.id, width: z.w, height: z.h }, theme: 'white', seed: undefined, options: {} };
			}
			const slide = after(template, 'slide-') as SlideType | undefined;
			if (slide) return { size: { id: 'slide', width: deckDoc().width, height: deckDoc().height }, theme: imageDoc().templates[deckDoc().slides[slide].layout]!.theme, seed: undefined, options: {} };
			const art = after(template, 'illustration-');
			const video = after(template, 'video-');
			if (!isLayout(template) && !isCard(template) && !art && !video) return { size: merchSize(template), theme: findItem(template).variants[0]!, seed: undefined, options: {} };
			const z = size === 'custom' ? { id: 'custom', w: 1200, h: 800 } : sizeOf(size)!;
			const dims = { id: z.id, width: z.w, height: z.h };
			if (isCard(template)) return { size: dims, theme: 'paper', seed: undefined, options: {} };
			if (art) return { size: dims, theme: art === 'stacks' || art === 'scene' ? 'red' : illustrateDoc().defaults.theme, seed: SEEDED_ART.has(art) ? 0 : undefined, options: {} };
			const layout = video ?? template;
			return { size: dims, theme: imageDoc().templates[layout]!.theme, seed: SEEDED.has(layout) ? 0 : undefined, options: {} };
		},
		render: renderDoc,
		compose: {
			blocks: () => BLOCKS,
			themes: themes(),
			grounds: grounds(),
			/* The share sizes first (the conformance draws every block at the first four), then the rest, print and custom. */
			sizes: [...new Set(['og', 'square', 'story', 'x-banner', ...sizeIds(), ...PLATFORMS.map((p) => p.id)]), 'custom'],
			formats: RASTERS,
			recipe: (template, size, copy) => recipeFor(template, size, copy),
		},
		page: { sections: () => SECTIONS, flavors: PAGE_FLAVORS, write: writePage },
		sample(template) {
			const layout = isLayout(template) ? template : after(template, 'video-');
			if (layout) return Object.fromEntries(Object.entries(imageDoc().templates[layout]!.sample).filter(([k, v]) => v && slotsOf(layout as Layout).includes(k))) as Record<string, string>;
			const slide = after(template, 'slide-') as SlideType | undefined;
			if (slide) return Object.fromEntries(Object.entries(SLIDE_COPY[slide]).flatMap(([id, slot]) => (deckDoc().slides[slide].sample[slot] ? [[id, deckDoc().slides[slide].sample[slot]!]] : [])));
			if (merchItems().some((i) => i.id === template)) return Object.fromEntries(Object.entries(merchDoc().sample).filter(([k]) => merchInfo(template).copy.some((c) => c.id === k)));
			return {};
		},
		colors: wordColors,
		aliases: {
			sizes: imageDoc().sizeAliases,
			themes: { ink: 'black', dark: 'black', light: 'white', cream: 'paper', gray: 'grey' },
			copy: { title: 'headline', text: 'body', subtitle: 'body', eyebrow: 'badge', label: 'badge', footnote: 'note', handle: 'credit', attribution: 'by', speaker: 'by', points: 'items', bullets: 'items' },
			layers: { stacks: 'art', stack: 'art', mark: 'logo', lockup: 'logo', screenshot: 'picture', shot: 'picture', grid: 'room', hatch: 'floor', hatching: 'floor', frame: 'border', lines: 'guides', tile: 'pattern' },
		},
	};
}

/** Contact sheets, on the same canvas with the brand's face. */
export const paint: Painter = (spec) => {
	scratch(1, 1).ctx.font = font('ui', 400, 12);
	return sheetCanvas(spec, { createCanvas, loadImage } as never, `ds ${familyFor('ui')}`);
};

/** The plain commands keep the design check's rules too: what was drawn is checked, and an error fails the command. */
export function assertDrawn(o: { kind: 'image' | 'slide' | 'merch' | 'video'; template: string; size: { id: string; width: number; height: number }; copy: Record<string, string | undefined>; layers: DrawnLayer[]; png?: Uint8Array }) {
	const copy = Object.fromEntries(Object.entries(o.copy).filter(([, v]) => v !== undefined && v.trim())) as Record<string, string>;
	const doc = { version: 1, brand: brand().bin, kind: o.kind, template: o.template, size: o.size, copy, images: {}, options: {}, layers: {}, history: [], future: [] } as DesignDoc;
	const findings = errorsOf(checkDesign({ doc, info: {} as TemplateInfo, layers: o.layers, adapter: adapter(), png: o.png }));
	if (findings.length) throw new Error(`${o.template} at ${o.size.id} breaks the brand's rules, so nothing was written.\n${checkText(findings)}`);
}
