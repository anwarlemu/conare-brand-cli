import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadImage, type Image } from '@napi-rs/canvas';
import { blockRects, platformOf, SMALL_FLOOR, type BlockInfo, type DesignDoc, type DrawnLayer, type LayerEdit, type Rect } from '../design/index.js';
import { packageRoot } from '../lib/brand.js';
import { artImage, drawLockup, lockupRatio, logoDoc, wordmarkPath } from './art.js';
import { color, contrast, font, type Ctx } from './canvas.js';
import { CopyError, roleFor, type FaceRole } from './glyphs.js';
import { imageDoc, largeType, logoFloor, unitOf } from './layouts.js';
import { colorsOf, drawRoom, emphasise, hatchLines, tileWords, wallOf, type Pic } from './og.js';
import { drawPanel, PANEL_H, PANEL_W } from './panel.js';
import { plain, setLines, type Line } from './words.js';

// The brand's blocks for compose designs: the share layouts' own parts (the headline with its red stop, the line, the
// label, the lockup, the mark, the hollow wordmark, the dark product window, a picture whole in a hairline frame, the
// stacks, the room, the wordmark tile, the hatch) and the site's (a hairline card led by the red square, a stat, a quote
// with its red-marked attribution, points with red squares, the dark button, a search field, an icon from the library's
// set, a hairline). The chart is not in the brand: bars are its hairline grey with the largest in the accent, labels in
// mono, as the deck's chart slide (brand/assets/deck.json). Words fit their cells or the block fails saying what to shorten.

const TEXT: DrawnLayer['can'] = { scale: [0.5, 1.6], hide: true, align: true };
const PART: DrawnLayer['can'] = { scale: [0.5, 1.6], hide: true };
const ART: DrawnLayer['can'] = { hide: true };

export const BLOCKS: BlockInfo[] = [
	{ type: 'headline', names: ['title', 'heading'], kind: 'text', description: 'The headline in Faculty Glyphic, ending on the red full stop.', copy: [{ id: 'text', required: true }], sample: { text: 'Every answer, with its source.' }, span: { cols: 10, rows: 3 }, place: 'left' },
	{ type: 'body', names: ['subtitle', 'text', 'paragraph', 'line'], kind: 'text', description: 'A line or a paragraph, muted.', copy: [{ id: 'text', required: true }], sample: { text: 'Search the documents you connect.' }, span: { cols: 8, rows: 2 } },
	{ type: 'badge', names: ['eyebrow', 'label', 'chip', 'tag'], kind: 'text', description: 'A short label in mono capitals on the red chip.', copy: [{ id: 'text', required: true }], sample: { text: 'Product update' }, span: { cols: 4, rows: 1 } },
	{ type: 'logo', names: ['lockup'], kind: 'logo', description: 'The lockup, mark and wordmark.', copy: [], span: { cols: 4, rows: 1 }, place: 'top-left' },
	{ type: 'mark', names: ['logomark', 'symbol'], kind: 'logo', description: 'The mark alone.', copy: [], span: { cols: 3, rows: 3 }, place: 'center' },
	{ type: 'wordmark', names: ['outline', 'hollow'], kind: 'art', description: 'The hollow wordmark, as the outline layout sets it.', copy: [], span: { cols: 12, rows: 3 }, place: 'bottom', under: true },
	{ type: 'window', names: ['app', 'product', 'screen'], kind: 'key', description: 'The dark product window from the posts tool, whole (wordless).', copy: [], span: { cols: 6, rows: 6 }, place: 'right' },
	{ type: 'picture', names: ['image', 'photo', 'screenshot'], kind: 'key', description: 'Your picture, whole, in a hairline frame.', copy: [], image: { required: true }, span: { cols: 6, rows: 6 }, place: 'right' },
	{ type: 'stack', names: ['stacks', 'documents', 'box'], kind: 'art', description: 'The stack of documents, the brand illustration.', copy: [], options: [{ id: 'shape', values: ['tall', 'wide'] }], span: { cols: 3, rows: 4 }, place: 'bottom-right' },
	{ type: 'room', names: ['perspective', 'walls'], kind: 'art', description: 'The red room\'s lines, run to its cells\' edges.', copy: [], span: { cols: 12, rows: 12 }, place: 'center', under: true },
	{ type: 'tile', names: ['pattern', 'wordmark tile'], kind: 'art', description: 'The wordmark as a staggered tile.', copy: [], span: { cols: 5, rows: 12 }, place: 'right', under: true },
	{ type: 'hatch', names: ['hatching', 'lines'], kind: 'art', description: 'The hatch layout\'s diagonal lines.', copy: [], span: { cols: 12, rows: 4 }, place: 'bottom', under: true },
	{ type: 'card', names: ['feature', 'box'], kind: 'panel', description: 'A hairline card led by the red square: a heading and a line.', copy: [{ id: 'heading', required: true }, { id: 'text' }], sample: { heading: 'Search', text: 'Find the answer in any file.' }, span: { cols: 4, rows: 3 } },
	{ type: 'stat', names: ['number', 'metric', 'figure'], kind: 'text', description: 'A big number in Faculty Glyphic with a line under it.', copy: [{ id: 'value', required: true }, { id: 'label' }], sample: { value: '42%', label: 'less time searching' }, span: { cols: 4, rows: 4 } },
	{ type: 'quote', names: ['testimonial'], kind: 'text', description: 'A quote, and who said it in mono capitals after the red square.', copy: [{ id: 'text', required: true }, { id: 'attribution' }], sample: { text: 'Search should return the passage.', attribution: 'Head of platform, Acme' }, span: { cols: 10, rows: 4 } },
	{ type: 'list', names: ['bullets', 'points', 'items'], kind: 'text', description: 'Points with | between, each after a red square.', copy: [{ id: 'items', required: true }], sample: { items: 'Search every file | Keep apps in step | Read every row' }, span: { cols: 6, rows: 4 } },
	{ type: 'button', names: ['cta'], kind: 'text', description: 'The dark button with its words in off-white.', copy: [{ id: 'text', required: true }], sample: { text: 'Start building' }, span: { cols: 3, rows: 1 }, place: 'bottom-left' },
	{ type: 'search', names: ['search-bar', 'input', 'field'], kind: 'text', description: 'A search field in a hairline with the words muted.', copy: [{ id: 'text', required: true }], sample: { text: 'Ask anything about your files' }, span: { cols: 8, rows: 1 }, place: 'center' },
	{ type: 'chart', names: ['graph', 'bars'], kind: 'text', description: 'Bars from "label value | label value": grey with the largest in red, labels in mono.', copy: [{ id: 'data', required: true }, { id: 'title' }], sample: { data: 'Mon 120 | Tue 180 | Wed 240', title: 'Searches a day' }, span: { cols: 6, rows: 6 } },
	{ type: 'divider', names: ['rule', 'hairline'], kind: 'art', description: 'A hairline across its cells.', copy: [], span: { cols: 12, rows: 1 }, place: 'center' },
	{ type: 'icon', names: ['glyph', 'symbol icon'], kind: 'key', description: 'An icon from the library\'s set (Lucide, ISC), by name.', copy: [], options: [{ id: 'name', values: iconNames() }], span: { cols: 1, rows: 1 } },
];

function iconNames(): string[] {
	const f = join(packageRoot, 'build', 'icons', 'index.json');
	if (!existsSync(f)) return ['search'];
	const j = JSON.parse(readFileSync(f, 'utf8')) as { icons?: string[] } | string[];
	return (Array.isArray(j) ? j : j.icons ?? []).map(String);
}

const infoOf = (type: string) => BLOCKS.find((b) => b.type === type)!;
const tooLong = (id: string) => new CopyError(`The ${id} is too long for its cells. Shorten it, or give it more cells (make it wider or taller).`);
const meet = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inset = (r: Rect, n: number): Rect => ({ x: r.x + n, y: r.y + n, w: r.w - 2 * n, h: r.h - 2 * n });

type Set_ = { lines: Line[]; size: number; w: number; h: number; role: FaceRole; asked: string };

/** Pictures the blocks draw, read before drawing (the canvas calls are synchronous). */
export type BlockPictures = Record<string, Pic | null>;

export async function blockPictures(doc: DesignDoc, read: (slot: string) => Promise<Pic | null>): Promise<BlockPictures> {
	const out: BlockPictures = {};
	for (const { block } of blockRects(doc)) {
		if (block.type === 'picture') out[block.id] = await read(block.id);
		if (block.type === 'stack') {
			const im = await artImage(imageDoc().art[doc.options[`${block.id}.shape`] === 'wide' ? 'stack-wide' : 'stack-tall']!);
			out[block.id] = { img: im, w: im.width, h: im.height };
		}
		if (block.type === 'icon') {
			const name = String(doc.options[`${block.id}.name`] ?? 'search');
			const f = join(packageRoot, 'build', 'icons', `${name}.svg`);
			if (!existsSync(f)) throw new Error(`There is no icon called ${name}. The set: ${iconNames().slice(0, 12).join(', ')}, ...`);
			const th = doc.theme && imageDoc().themes[doc.theme] ? doc.theme : 'white';
			const ink = colorsOf({ theme: th, highlight: imageDoc().themes[th]?.onAccent?.highlight ?? 'red' }).ink;
			/* The icon's strokes in the theme's ink, at a size that stays sharp. */
			const svg = readFileSync(f, 'utf8').replace(/currentColor/g, ink).replace(/width="24"/, 'width="192"').replace(/height="24"/, 'height="192"');
			out[block.id] = { img: (await loadImage(Buffer.from(svg))) as Image, w: 192, h: 192 };
		}
	}
	return out;
}

/** Draws a compose design: each block into its cells, in order, and reports one layer per block (`<id>-<part>` for more). */
export function drawBlocks(ctx: Ctx, doc: DesignDoc, pictures: BlockPictures): DrawnLayer[] {
	const W = doc.size.width;
	const H = doc.size.height;
	const shown = platformOf(doc.size.id, W, H).shown;
	const theme = doc.theme && imageDoc().themes[doc.theme] ? doc.theme : 'white';
	const C = colorsOf({ theme, highlight: imageDoc().themes[theme]?.onAccent?.highlight ?? 'red' });
	const u = unitOf(W, H);
	const floor = (SMALL_FLOOR * W) / shown;
	const large = largeType(W, shown);
	/* The red square, and the chart's largest bar: in the ink where the ground is red itself. */
	const mark = contrast(color(imageDoc().accent), C.bg) >= 2 ? color(imageDoc().accent) : C.ink;
	const layers: DrawnLayer[] = [];
	const e = (id: string): LayerEdit => doc.layers[id] ?? {};
	const k = (id: string) => e(id).scale ?? 1;
	ctx.fillStyle = C.bg;
	ctx.fillRect(0, 0, W, H);
	const placed = blockRects(doc).filter((b) => !e(b.block.id).hidden);
	const under = placed.filter((b) => infoOf(b.block.type).under);
	const words = (id: string, slot: string) => doc.copy[`${id}.${slot}`]?.trim() ?? '';
	const need = (fg: string, bg: string) => (contrast(fg, bg) >= 4.5 ? floor : Math.max(floor, large));
	const overOf = (r: Rect, self: string) => under.filter((b) => b.block.id !== self && meet(b.rect, r)).map((b) => b.block.id);

	/** Words set as large as fits a rect, from `from` down to the least size; a scale edit must fit as it is. */
	const fit = (id: string, text: string, want: FaceRole, weight: number, from: number, r: Rect, least: number, leading: number, opts: { caps?: boolean; tracking?: number } = {}): Set_ => {
		const role = roleFor(want, opts.caps ? text.toUpperCase() : text, id);
		const set = (size: number): Set_ => {
			ctx.font = font(role, weight, size);
			ctx.letterSpacing = `${(opts.tracking ?? 0) * size}px`;
			const lines = setLines(ctx, opts.caps ? text.toUpperCase() : text, r.w, { breakLong: false });
			ctx.letterSpacing = '0px';
			/* A little room above and below, so tall glyphs stay inside the cells. */
			return { lines, size, w: Math.max(0, ...lines.map((l) => l.w)), h: lines.length * size * leading + size * 0.3, role, asked: text };
		};
		const ok = (s: Set_) => s.w <= r.w + 0.5 && s.h <= r.h + 0.5 && s.lines.every((l) => l.w <= r.w + 0.5);
		let size = Math.max(least, Math.min(from, r.h / leading));
		let s = set(size);
		while (!ok(s) && size > least + 0.01) {
			size = Math.max(least, size * 0.95);
			s = set(size);
		}
		if (!ok(s)) throw tooLong(id);
		if (k(id) === 1) return s;
		const scaled = set(s.size * k(id));
		if (!ok(scaled) || scaled.size < least - 0.01) throw tooLong(`${id} at that size`);
		return scaled;
	};
	/** Draws set words in a rect with an alignment; returns the ink. */
	const paint = (s: Set_, r: Rect, weight: number, fill: string, align: 'left' | 'center' | 'right', valign: 'top' | 'middle' = 'top', opts: { tracking?: number; stop?: string } = {}) => {
		ctx.font = font(s.role, weight, s.size);
		ctx.letterSpacing = `${(opts.tracking ?? 0) * s.size}px`;
		ctx.textBaseline = 'alphabetic';
		ctx.textAlign = 'left';
		const lh = (s.h - s.size * 0.3) / Math.max(1, s.lines.length);
		const m0 = ctx.measureText('Hg');
		const asc = m0.fontBoundingBoxAscent || s.size * 0.9;
		const desc = m0.fontBoundingBoxDescent || s.size * 0.22;
		let y = (valign === 'middle' ? r.y + (r.h - s.h) / 2 : r.y) + s.size * 0.15;
		const ink: Rect[] = [];
		const space = ctx.measureText(' ').width;
		for (const [li, line] of s.lines.entries()) {
			const x0 = align === 'left' ? r.x : align === 'right' ? r.x + r.w - line.w : r.x + (r.w - line.w) / 2;
			const base = y + (lh - (asc + desc)) / 2 + asc;
			const m = ctx.measureText(line.text);
			ink.push({ x: x0, y: base - m.actualBoundingBoxAscent, w: line.w, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent });
			let x = x0;
			line.words.forEach((wd, wi) => {
				if (wi) x += space;
				const last = li === s.lines.length - 1 && wi === line.words.length - 1;
				const stop = opts.stop && last && /(^|[^.])\.$/.test(wd.text);
				ctx.fillStyle = wd.hi && opts.stop ? opts.stop : fill;
				const t = stop ? wd.text.slice(0, -1) : wd.text;
				ctx.fillText(t, x, base);
				if (stop) {
					ctx.fillStyle = opts.stop!;
					ctx.fillText('.', x + ctx.measureText(t).width, base);
				}
				x += ctx.measureText(wd.text).width;
			});
			y += lh;
		}
		ctx.letterSpacing = '0px';
		const box = ink.length ? { x: Math.min(...ink.map((i) => i.x)), y: Math.min(...ink.map((i) => i.y)), w: Math.max(...ink.map((i) => i.x + i.w)) - Math.min(...ink.map((i) => i.x)), h: Math.max(...ink.map((i) => i.y + i.h)) - Math.min(...ink.map((i) => i.y)) } : { ...r, h: 0 };
		return { ink, box };
	};
	const report = (id: string, kind: DrawnLayer['kind'], box: Rect, extra: Partial<DrawnLayer> = {}, can: DrawnLayer['can'] = TEXT) => layers.push({ id, kind, box, can, ...extra });
	const textLayer = (id: string, s: Set_, out: { ink: Rect[]; box: Rect }, fill: string, ground: string[], over: string[], drawn = s.lines.map((l) => l.text).join('\n')) =>
		report(id, 'text', out.box, { ink: out.ink, text: { asked: plain(s.asked), drawn, size: s.size, color: fill, ground }, ...(over.length ? { over } : {}) });

	for (const { block, rect: R } of placed) {
		const id = block.id;
		const align = e(id).align ?? 'left';
		const over = overOf(R, id);
		switch (block.type) {
			case 'headline': {
				const asked = words(id, 'text');
				const t = emphasise(asked);
				if (!t) throw new CopyError(`The ${id} needs words.`);
				const added = t !== asked.replace(/\s+$/, '');
				const s = fit(id, t, 'display', 400, 110 * u, R, Math.max(floor * 1.5, need(C.ink, C.bg), /\*[^*]+\*/.test(asked) ? need(C.hi, C.bg) : 0), 1.08, { tracking: -0.02 });
				const drawn = plain(s.lines.map((l) => l.text).join('\n'));
				textLayer(id, { ...s, asked }, paint(s, R, 400, C.ink, align, 'top', { tracking: -0.02, stop: C.hi }), C.ink, [C.bg], over, added ? drawn.replace(/\.$/, '') : drawn);
				break;
			}
			case 'body': {
				const t = words(id, 'text');
				const s = fit(id, t, 'text', 400, 30 * u, R, need(C.muted, C.bg), 1.45);
				textLayer(id, s, paint(s, R, 400, C.muted, align), C.muted, [C.bg], over);
				break;
			}
			case 'badge': {
				const t = words(id, 'text');
				const role = roleFor('mono', t.toUpperCase(), id);
				const chip = (fs: number) => {
					const on = imageDoc().themes[theme]?.onAccent;
					const red = color(fs >= large ? imageDoc().accent : imageDoc().accentSmall);
					return on?.badgeFill ? { fill: color(on.badgeFill), ink: red } : { fill: red, ink: color('off-white') };
				};
				let fs = Math.min(R.h / 1.9, 22 * u) * k(id);
				const width = (n: number) => {
					ctx.font = font(role, 500, n);
					ctx.letterSpacing = `${0.06 * n}px`;
					const w = ctx.measureText(t.toUpperCase()).width;
					ctx.letterSpacing = '0px';
					return w + n * 1.2;
				};
				while (width(fs) > R.w && fs > floor) fs *= 0.95;
				const c = chip(fs);
				if (fs < floor - 0.01 || width(fs) > R.w + 0.5 || contrast(c.ink, c.fill) < (fs >= large ? 3 : 4.5)) throw tooLong(id);
				const bw = width(fs);
				const bh = fs * 1.9;
				const x = align === 'right' ? R.x + R.w - bw : align === 'center' ? R.x + (R.w - bw) / 2 : R.x;
				const y = R.y + (R.h - bh) / 2;
				ctx.fillStyle = c.fill;
				ctx.fillRect(x, y, bw, bh);
				ctx.font = font(role, 500, fs);
				ctx.letterSpacing = `${0.06 * fs}px`;
				ctx.fillStyle = c.ink;
				ctx.textBaseline = 'middle';
				ctx.fillText(t.toUpperCase(), x + fs * 0.6, y + bh / 2 + fs * 0.04);
				ctx.letterSpacing = '0px';
				ctx.textBaseline = 'alphabetic';
				report(id, 'text', { x, y, w: bw, h: bh }, { text: { asked: t, drawn: t.toUpperCase(), size: fs, color: c.ink, ground: [c.fill] }, ...(over.length ? { over } : {}) });
				break;
			}
			case 'logo':
			case 'mark': {
				const parts = block.type === 'mark' ? 'mark' : 'primary';
				const ratio = lockupRatio(parts);
				const min = logoFloor(W, shown);
				const h = Math.min(R.h, R.w / ratio, (block.type === 'mark' ? 160 : 56) * u) * k(id);
				if (h < min - 0.01 || h * ratio > R.w + 0.5 || h > R.h + 0.5) throw new CopyError(`The ${id} does not fit its cells: it reads from ${Math.ceil(min)} px tall. Give it more cells.`);
				const w = h * ratio;
				const x = align === 'right' ? R.x + R.w - w : align === 'center' || block.type === 'mark' ? R.x + (R.w - w) / 2 : R.x;
				const y = R.y + (R.h - h) / 2;
				drawLockup(ctx, x, y, h, theme === 'red' ? C.ink : C.ink, parts);
				report(id, 'logo', { x, y, w, h }, { logo: { clear: h * 0.2, min }, ...(over.length ? { over } : {}) }, PART);
				break;
			}
			case 'wordmark': {
				const L = logoDoc().wordmark;
				const h = Math.min(R.h, R.w / (L.w / L.h));
				const w = h * (L.w / L.h);
				const x = R.x + (R.w - w) / 2;
				const y = R.y + (R.h - h) / 2;
				ctx.save();
				ctx.translate(x, y);
				ctx.scale(h / L.h, h / L.h);
				ctx.strokeStyle = C.line;
				ctx.lineWidth = Math.max(1, 1.2 * u) / (h / L.h);
				ctx.stroke(wordmarkPath());
				ctx.restore();
				report(id, 'art', { x, y, w, h }, {}, ART);
				break;
			}
			case 'window':
			case 'picture': {
				const pic = block.type === 'picture' ? pictures[id] : null;
				if (block.type === 'picture' && !pic) throw new Error(`The ${id} needs a picture (--image).`);
				const ratio = pic ? pic.h / pic.w : PANEL_H / PANEL_W;
				const w = Math.min(R.w, R.h / ratio) * Math.min(1, k(id));
				const h = w * ratio;
				const x = align === 'left' ? R.x : align === 'right' ? R.x + R.w - w : R.x + (R.w - w) / 2;
				const y = R.y + (R.h - h) / 2;
				if (pic) {
					ctx.drawImage(pic.img, x, y, w, h);
					ctx.strokeStyle = C.line;
					ctx.lineWidth = Math.max(1, u);
					ctx.strokeRect(x - 4 * u, y - 4 * u, w + 8 * u, h + 8 * u);
				} else {
					ctx.save();
					ctx.translate(x, y);
					ctx.scale(w / PANEL_W, h / PANEL_H);
					drawPanel(ctx, false);
					ctx.restore();
				}
				report(id, 'key', pic ? inset({ x, y, w, h }, -4 * u) : { x, y, w, h }, {}, PART);
				break;
			}
			case 'stack': {
				const pic = pictures[id]!;
				const ratio = pic.h / pic.w;
				const w = Math.min(R.w, R.h / ratio) * Math.min(1, k(id));
				const h = w * ratio;
				const x = R.x + (R.w - w) / 2;
				const y = R.y + (R.h - h) / 2;
				ctx.drawImage(pic.img, x, y, w, h);
				report(id, 'art', { x, y, w, h }, {}, PART);
				break;
			}
			case 'room': {
				ctx.save();
				ctx.beginPath();
				ctx.rect(R.x, R.y, R.w, R.h);
				ctx.clip();
				ctx.translate(R.x, R.y);
				drawRoom(ctx, R.w, R.h, u, wallOf(R.w, R.h, 0.5), 5, C.room);
				ctx.restore();
				report(id, 'art', R, { bleeds: true }, ART);
				break;
			}
			case 'tile': {
				ctx.save();
				ctx.fillStyle = C.tile;
				ctx.globalAlpha = C.tileAlpha;
				tileWords(ctx, R, 40 * u, true);
				ctx.restore();
				report(id, 'art', R, { bleeds: true }, ART);
				break;
			}
			case 'hatch': {
				ctx.save();
				ctx.strokeStyle = C.line;
				ctx.lineWidth = Math.max(1, u);
				hatchLines(ctx, R, 14 * u);
				ctx.restore();
				report(id, 'art', R, { bleeds: true }, ART);
				break;
			}
			case 'divider': {
				const h = Math.max(1, u);
				const y = R.y + R.h / 2 - h / 2;
				ctx.fillStyle = C.line;
				ctx.fillRect(R.x, y, R.w, h);
				report(id, 'art', { x: R.x, y, w: R.w, h }, {}, ART);
				break;
			}
			case 'card': {
				const pad = Math.min(24 * u, R.w * 0.08, R.h * 0.12);
				ctx.strokeStyle = C.line;
				ctx.lineWidth = Math.max(1, u);
				ctx.strokeRect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1);
				report(id, 'panel', R, {}, ART);
				const sq = Math.max(6, 10 * u);
				ctx.fillStyle = mark;
				ctx.fillRect(R.x + pad, R.y + pad, sq, sq);
				const inner = { x: R.x + pad, y: R.y + pad + sq * 2.2, w: R.w - 2 * pad, h: R.h - 2 * pad - sq * 2.2 };
				const head = words(id, 'heading');
				const text = words(id, 'text');
				const hs = fit(`${id} heading`, head, 'display', 400, 30 * u, { ...inner, h: text ? inner.h * 0.45 : inner.h }, Math.max(floor, need(C.ink, C.bg)), 1.15);
				textLayer(`${id}-heading`, hs, paint(hs, inner, 400, C.ink, 'left'), C.ink, [C.bg], [id, ...over]);
				if (text) {
					const tr = { ...inner, y: inner.y + hs.h + 8 * u, h: inner.h - hs.h - 8 * u };
					const ts = fit(`${id} text`, text, 'text', 400, 20 * u, tr, need(C.muted, C.bg), 1.4);
					textLayer(`${id}-text`, ts, paint(ts, tr, 400, C.muted, 'left'), C.muted, [C.bg], [id, ...over]);
				}
				break;
			}
			case 'stat': {
				const value = words(id, 'value');
				const label = words(id, 'label');
				const vr = { ...R, h: label ? R.h * 0.68 : R.h };
				const vs = fit(id, value, 'display', 400, 160 * u, vr, Math.max(floor, need(C.ink, C.bg)), 1.0, { tracking: -0.02 });
				const out = paint(vs, vr, 400, C.ink, align, 'top', { tracking: -0.02 });
				textLayer(id, vs, out, C.ink, [C.bg], over);
				if (label) {
					const lr = { ...R, y: R.y + vs.h + 6 * u, h: R.h - vs.h - 6 * u };
					const ls = fit(`${id} label`, label, 'text', 400, 24 * u, lr, need(C.muted, C.bg), 1.4);
					textLayer(`${id}-label`, ls, paint(ls, lr, 400, C.muted, align), C.muted, [C.bg], over);
				}
				break;
			}
			case 'quote': {
				const q = words(id, 'text');
				const by = words(id, 'attribution');
				const byH = by ? Math.max(floor * 1.6, 18 * u) : 0;
				const qr = { ...R, h: R.h - (by ? byH * 1.8 : 0) };
				const qs = fit(id, q, 'display', 400, 44 * u, qr, Math.max(floor * 1.3, need(C.ink, C.bg)), 1.12, { tracking: -0.015 });
				textLayer(id, qs, paint(qs, qr, 400, C.ink, align, 'top', { tracking: -0.015 }), C.ink, [C.bg], over);
				if (by) {
					const sq = byH * 0.45;
					const br = { x: R.x + sq * 2.2, y: R.y + qs.h + byH * 0.8, w: R.w - sq * 2.2, h: byH };
					const bs = fit(`${id} attribution`, by, 'mono', 400, byH * 0.7, br, need(C.muted, C.bg), 1.3, { caps: true, tracking: 0.04 });
					const out = paint(bs, br, 400, C.muted, 'left', 'top', { tracking: 0.04 });
					ctx.fillStyle = mark;
					ctx.fillRect(R.x, out.ink[0] ? out.ink[0].y + out.ink[0].h / 2 - sq / 2 : br.y, sq, sq);
					textLayer(`${id}-attribution`, bs, out, C.muted, [C.bg], over);
				}
				break;
			}
			case 'list': {
				const items = words(id, 'items').split('|').map((x) => x.trim()).filter(Boolean);
				if (!items.length) throw new CopyError(`The ${id} needs points (separated by |).`);
				let fs = Math.min(28 * u, R.h / (items.length * 1.7));
				const least = need(C.ink, C.bg);
				const sets = () => items.map((t) => fit(`${id}`, t, 'ui', 400, fs, { x: 0, y: 0, w: R.w - fs * 1.4, h: fs * 3.2 }, Math.min(fs, Math.max(least, fs * 0.7)), 1.35));
				let all = sets();
				const total = () => all.reduce((n, s) => n + s.h, 0) + (items.length - 1) * fs * 0.6;
				while (total() > R.h && fs > least) {
					fs = Math.max(least, fs * 0.94);
					all = sets();
				}
				if (total() > R.h + 0.5) throw tooLong(id);
				let y = R.y;
				const ink: Rect[] = [];
				all.forEach((s) => {
					const r = { x: R.x + s.size * 1.4, y, w: R.w - s.size * 1.4, h: s.h };
					const out = paint(s, r, 400, C.ink, 'left');
					ctx.fillStyle = mark;
					const sq = s.size * 0.4;
					ctx.fillRect(R.x, (out.ink[0]?.y ?? y) + (out.ink[0]?.h ?? s.size) / 2 - sq / 2, sq, sq);
					ink.push(...out.ink);
					y += s.h + fs * 0.6;
				});
				const box = { x: R.x, y: R.y, w: Math.max(...ink.map((i) => i.x + i.w)) - R.x, h: y - fs * 0.6 - R.y };
				report(id, 'text', box, { ink, text: { asked: items.join(' '), drawn: all.map((s) => s.lines.map((l) => l.text).join('\n')).join('\n'), size: Math.min(...all.map((s) => s.size)), color: C.ink, ground: [C.bg] }, ...(over.length ? { over } : {}) });
				break;
			}
			case 'button':
			case 'search': {
				const t = words(id, 'text');
				const dark = block.type === 'button';
				const fill = dark ? (C.dark ? color('off-white') : color('off-black')) : C.bg;
				const ink = dark ? (C.dark ? color('off-black') : color('off-white')) : C.muted;
				const least = need(ink, fill);
				const fs = Math.max(least, Math.min(R.h * 0.42, 22 * u) * k(id));
				const h = Math.min(R.h, Math.max(fs * 2.1, 44 * u * k(id)));
				if (fs * 1.4 > h + 0.5) throw tooLong(id);
				const s = fit(id, t, 'ui', 500, fs, { x: 0, y: 0, w: (dark ? R.w : R.w - h * 0.9) - h * 0.8, h: fs * 1.5 }, least, 1.3);
				if (s.lines.length > 1) throw tooLong(id);
				const bw = dark ? Math.min(R.w, s.w + h * 0.8) : R.w;
				const x = dark ? (align === 'right' ? R.x + R.w - bw : align === 'center' ? R.x + (R.w - bw) / 2 : R.x) : R.x;
				const y = R.y + (R.h - h) / 2;
				ctx.fillStyle = fill;
				ctx.fillRect(x, y, bw, h);
				if (!dark) {
					ctx.strokeStyle = C.line;
					ctx.lineWidth = Math.max(1, u);
					ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, h - 1);
					/* The magnifier: a ring and a handle in the muted ink. */
					const r = h * 0.16;
					const cx = x + h * 0.45;
					const cy = y + h / 2 - r * 0.2;
					ctx.strokeStyle = C.muted;
					ctx.lineWidth = Math.max(1, h * 0.05);
					ctx.beginPath();
					ctx.arc(cx, cy, r, 0, Math.PI * 2);
					ctx.moveTo(cx + r * 0.7, cy + r * 0.7);
					ctx.lineTo(cx + r * 1.6, cy + r * 1.6);
					ctx.stroke();
				}
				const tr = { x: dark ? x + h * 0.4 : x + h * 0.9, y: y + (h - s.h) / 2, w: s.w, h: s.h };
				const out = paint(s, tr, 500, ink, 'left');
				report(id, 'text', { x, y, w: bw, h }, { ink: out.ink, text: { asked: t, drawn: s.lines.map((l) => l.text).join('\n'), size: s.size, color: ink, ground: [fill] }, ...(over.length ? { over } : {}) });
				break;
			}
			case 'chart': {
				const title = words(id, 'title');
				const rows = words(id, 'data').split('|').map((x) => x.trim()).filter(Boolean).map((x) => {
					const m = /^(.*?)\s+(-?[\d.,]+)\s*%?$/.exec(x);
					if (!m) throw new CopyError(`The ${id}'s data reads "label number | label number"; "${x}" has no number at its end.`);
					return { label: m[1]!, value: Number(m[2]!.replace(/,/g, '')), raw: m[2]! };
				});
				if (!rows.length || rows.length > 12) throw new CopyError(`The ${id} takes 1 to 12 bars.`);
				let top = R.y;
				if (title) {
					const ts = fit(`${id} title`, title, 'display', 400, 28 * u, { ...R, h: R.h * 0.18 }, Math.max(floor, need(C.ink, C.bg)), 1.1);
					textLayer(`${id}-title`, ts, paint(ts, R, 400, C.ink, 'left'), C.ink, [C.bg], over);
					top += ts.h + 10 * u;
				}
				const fs = Math.max(need(C.muted, C.bg), Math.min(16 * u, R.w / rows.length / 4));
				ctx.font = font('mono', 400, fs);
				const max = Math.max(...rows.map((r) => r.value), 1);
				const slot = R.w / rows.length;
				const bw = slot * 0.5;
				const base = R.y + R.h - fs * 1.8;
				const tall = base - top - fs * 1.8;
				if (tall < 10 * u || rows.some((r) => ctx.measureText(r.label).width > slot * 0.96 || ctx.measureText(r.raw).width > slot * 0.96)) throw tooLong(id);
				const ink: Rect[] = [];
				const best = rows.reduce((a, b) => (b.value > a.value ? b : a));
				rows.forEach((r, i) => {
					const h = Math.max(1, (r.value / max) * tall);
					const x = R.x + i * slot + (slot - bw) / 2;
					ctx.fillStyle = r === best ? mark : color(C.dark ? 'neutral-300' : 'neutral-600');
					ctx.fillRect(x, base - h, bw, h);
					ctx.fillStyle = C.muted;
					ctx.textAlign = 'center';
					ctx.fillText(r.label, x + bw / 2, base + fs * 1.3);
					ctx.fillText(r.raw, x + bw / 2, base - h - fs * 0.5);
					ctx.textAlign = 'left';
					ink.push({ x: R.x + i * slot, y: base + fs * 0.3, w: slot, h: fs * 1.2 }, { x: R.x + i * slot, y: base - h - fs * 1.4, w: slot, h: fs * 1.1 });
				});
				ctx.fillStyle = C.line;
				ctx.fillRect(R.x, base, R.w, Math.max(1, u));
				report(id, 'text', { x: R.x, y: top, w: R.w, h: R.y + R.h - top }, { ink, text: { asked: rows.map((r) => `${r.label} ${r.raw}`).join(' '), drawn: rows.map((r) => `${r.label} ${r.raw}`).join('\n'), size: fs, color: C.muted, ground: [C.bg] }, ...(over.length ? { over } : {}) });
				break;
			}
			case 'icon': {
				const pic = pictures[id]!;
				const s = Math.min(R.w, R.h, 48 * u) * Math.min(1.6, k(id));
				const x = R.x + (R.w - s) / 2;
				const y = R.y + (R.h - s) / 2;
				ctx.drawImage(pic.img, x, y, s, s);
				report(id, 'key', { x, y, w: s, h: s }, {}, PART);
				break;
			}
			default:
				throw new Error(`Unknown block ${block.type}.`);
		}
	}
	return layers;
}

/** A layout's design as blocks on the 12 by 12 grid, with every word of its copy (conformance recreates each). */
export function recipeFor(template: string, size: string, copy: Record<string, string>) {
	const c = (id: string, slot: string, v?: string) => (v?.trim() ? { [`${id}.${slot}`]: v } : {});
	const at = (col: number, row: number, cols: number, rows: number) => ({ col, row, cols, rows });
	const T = imageDoc().templates[template as keyof ReturnType<typeof imageDoc>['templates']];
	const card = ['headline', 'statement', 'quote', 'announcement', 'frame'].includes(template);
	const theme = card ? 'white' : T?.theme ?? 'white';
	if (template === 'avatar') return { theme: 'red', blocks: [{ id: 'mark', type: 'mark', at: at(2, 2, 8, 8) }], copy: {} };
	const art: Record<string, { id: string; type: string; at: ReturnType<typeof at> }[]> = {
		room: [{ id: 'room', type: 'room', at: at(0, 0, 12, 12) }],
		tile: [{ id: 'tile', type: 'tile', at: at(8, 0, 4, 12) }],
		hatch: [{ id: 'hatch', type: 'hatch', at: at(0, 10, 12, 2) }],
		outline: [{ id: 'wordmark', type: 'wordmark', at: at(0, 9, 12, 3) }],
		app: [{ id: 'window', type: 'window', at: at(7, 2, 5, 8) }],
		feature: [{ id: 'window', type: 'window', at: at(7, 2, 5, 8) }],
		frame: [{ id: 'window', type: 'window', at: at(7, 2, 5, 8) }],
		funding: [{ id: 'room', type: 'room', at: at(0, 0, 12, 12) }],
		hero: [{ id: 'divider', type: 'divider', at: at(0, 10, 12, 1) }],
		brief: [{ id: 'divider', type: 'divider', at: at(0, 10, 12, 1) }],
	};
	const side = ['tile', 'app', 'feature', 'frame'].includes(template);
	const cols = side ? 6 : 12;
	const quote = template === 'quote';
	const head = copy.headline ?? copy.quote;
	const blocks = [
		...(art[template] ?? []),
		{ id: 'logo', type: 'logo', at: at(0, 0, 3, 1) },
		...(copy.badge ? [{ id: 'badge', type: 'badge', at: at(0, 2, Math.min(cols, 5), 1) }] : []),
		...(head ? [{ id: quote ? 'quote' : 'headline', type: quote ? 'quote' : 'headline', at: at(0, 3, cols, quote ? 5 : 3) }] : []),
		...(copy.body ? [{ id: 'body', type: 'body', at: at(0, 6, cols, 2) }] : []),
		...(copy.partner ? [{ id: 'partner', type: 'body', at: at(4, 0, 4, 1) }] : []),
		...(copy.credit ? [{ id: 'credit', type: 'body', at: at(0, 8, cols, 1) }] : []),
		...(copy.note ? [{ id: 'note', type: 'body', at: at(0, 11, 4, 1) }] : []),
		...(copy.page ? [{ id: 'page', type: 'body', at: at(9, 11, 3, 1) }] : []),
	];
	return {
		theme,
		blocks,
		copy: {
			...c('badge', 'text', copy.badge), ...(quote ? { ...c('quote', 'text', head), ...c('quote', 'attribution', copy.by) } : c('headline', 'text', head)),
			...c('body', 'text', copy.body), ...c('partner', 'text', copy.partner), ...c('credit', 'text', copy.credit), ...c('note', 'text', copy.note), ...c('page', 'text', copy.page),
			...(!quote ? c('by', 'text', copy.by) : {}),
		},
		...(!quote && copy.by ? { blocks: [...blocks, { id: 'by', type: 'body', at: at(0, 9, cols, 1) }] } : {}),
	};
}
