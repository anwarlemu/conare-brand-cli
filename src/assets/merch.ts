import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { drawLockup, lockupRatio } from './art.js';
import { color, font, rgbOf, surface, toPng, toSvg, type Ctx } from './canvas.js';
import { CopyError, roleFor, type FaceRole } from './glyphs.js';
import { pick } from './io.js';
import { imagesToPdf } from './pdf.js';
import { mostWords, plain, setLines } from './words.js';
import type { DrawnLayer } from '../design/types.js';
import { emphasise, imageDoc } from './og.js';
import { drawSubject } from '../illustrate/draw.js';

// Merch print files (brand/assets/merch.json): each item's trim, bleed and safe area in inches, and a layout of logo,
// words and illustration in inches from the trim. A file is the item at 300 pixels per inch with the bleed around it:
// SVG at physical size (inches on the root, the die line as a CutContour spot path) and PNG at the asked dpi.

export const PX_PER_IN = 300;
type B = [number, number, number, number];
type Layer = { fixed?: boolean; only?: 'one' } & (
	| { type: 'logo'; part: 'primary' | 'mark'; box: B }
	| { type: 'text'; slot: string; box: B; size: number; face: 'display' | 'mono' | 'text'; align?: 'left' | 'center' | 'right'; valign?: 'top' | 'middle'; muted?: boolean; caps?: boolean }
	| { type: 'rule'; box: B }
	| { type: 'repeat'; part: 'primary' | 'mark'; box: B; gap: number }
	| { type: 'art'; subject: string; shape?: 'tall' | 'wide'; box: B; bleed?: boolean }
);
export type MerchItem = { id: string; name: string; kind?: 'merch' | 'document'; cuts?: { box: B; radius: number }[]; size: [number, number]; bleed: number; safe: number; method: string; source: string; cut?: { radius: number }; flow?: 'top' | 'middle'; variants: string[]; layers: Layer[] };
type Variant = { theme?: string; one?: string; ground: boolean };
type MerchDoc = { dpi: number; slots: Record<string, string>; sample: Record<string, string>; textFloor: number; variants: Record<string, Variant>; items: MerchItem[] };

let doc: MerchDoc | undefined;
export const merchDoc = (): MerchDoc => (doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'merch.json'), 'utf8')) as MerchDoc);
export const merchItems = () => merchDoc().items;
export const findItem = (id: string): MerchItem => merchItems().find((i) => i.id === pick('item', id, merchItems().map((x) => x.id)))!;

export function merchCatalog() {
	return {
		items: merchItems().map((i) => ({
			id: i.id, name: i.name, trim: { width: i.size[0], height: i.size[1], unit: 'in' }, bleed: i.bleed, safe: i.safe, method: i.method, variants: i.variants,
			pixels: { width: Math.round((i.size[0] + 2 * i.bleed) * PX_PER_IN), height: Math.round((i.size[1] + 2 * i.bleed) * PX_PER_IN), dpi: PX_PER_IN },
			dieCut: Boolean(i.cut || i.cuts?.length), kind: i.kind ?? 'merch', slots: [...new Set(i.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : [])))], lockups: [...new Set(i.layers.flatMap((l) => (l.type === 'logo' ? [l.part] : [])))], source: i.source,
		})),
		variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ...v })),
		drawsOnly: 'The words passed, the logo and the address. --sample fills a sample headline.',
		note: 'Trim, bleed and safe areas are common vendor conventions, not a vendor spec. Confirm against the print vendor\'s template for the exact blank before ordering.',
	};
}

export type MerchRequest = { variant?: string; slots?: Record<string, string>; sample?: boolean; seed?: number };

function inks(v: Variant) {
	if (v.one) return { ink: color(v.one), hi: color(v.one), bg: '', muted: color(v.one), line: color(v.one) };
	const t = imageDoc().themes[v.theme!]!;
	const hiName = t.onAccent?.highlight === 'ink' ? t.ink : imageDoc().accent;
	return { ink: color(t.ink), hi: color(hiName), bg: color(t.bg), muted: color(t.muted), line: color(t.line.split('/')[0]!) };
}

type Rect = { x: number; y: number; w: number; h: number };
type TextLayer = Extract<Layer, { type: 'text' }>;
type SetText = { lines: string[]; size: number; lh: number; role: FaceRole; text: string; track: number };

/* Words fitted to a box: wrapped at its width, shrunk until they fit its height, down to the smallest print that reads.
   A headline keeps its red stop. */
function setText(ctx: Ctx, item: MerchItem, l: TextLayer, value: string, b: Rect): SetText {
	const display = l.face === 'display';
	/* Only a headline ends on the brand's red stop; a name or a number is set as it is. */
	const stopped = display && (l.slot === 'headline' || l.slot === 'quote');
	const text = stopped ? emphasise(value) : l.caps ? value.toUpperCase() : value;
	const role = roleFor(display ? 'display' : l.face === 'text' ? 'text' : 'mono', plain(text), l.slot);
	const lh = display ? 1.08 : l.face === 'text' ? 1.42 : 1.2;
	const track = display ? -0.02 : l.face === 'text' ? 0 : 0.02;
	const floor = Math.min(merchDoc().textFloor, l.size) * PX_PER_IN;
	const at = (size: number, str: string) => {
		ctx.font = font(role, 400, size);
		ctx.letterSpacing = `${track * size}px`;
		const lines = setLines(ctx, str, b.w, { breakLong: size <= floor, balance: l.face !== 'text' });
		ctx.letterSpacing = '0px';
		return { lines: lines.map((x) => x.text), ok: lines.length * size * lh <= b.h + 0.5 && lines.every((x) => x.w <= b.w + 0.5) };
	};
	for (let size = l.size * PX_PER_IN; ; size = Math.max(floor, size * 0.96)) {
		const t = at(size, text);
		if (t.ok) return { lines: t.lines, size, lh, role, text, track };
		if (size <= floor) break;
	}
	const words = text.split(/\s+/);
	const n = mostWords(words.length, (k) => k > 0 && at(floor, words.slice(0, k).join(' ')).ok);
	throw new CopyError(`The ${l.slot} does not fit the ${item.id}. Shorten it to about ${Math.max(1, n)} words.`);
}

function paintText(ctx: Ctx, l: TextLayer, t: SetText, b: Rect, ink: string, hi: string): Rect[] {
	const display = l.face === 'display';
	ctx.font = font(t.role, 400, t.size);
	ctx.letterSpacing = `${t.track * t.size}px`;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	const top = l.valign === 'top' ? b.y : b.y + (b.h - t.lines.length * t.size * t.lh) / 2;
	const ink_: Rect[] = [];
	t.lines.forEach((line, i) => {
		const m = ctx.measureText(line);
		const x = l.align === 'left' ? b.x : l.align === 'right' ? b.x + b.w - m.width : b.x + (b.w - m.width) / 2;
		const y = top + t.size * t.lh * i + t.size * 0.86;
		ink_.push({ x, y: y - m.actualBoundingBoxAscent, w: m.width, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent });
		const stop = display && (l.slot === 'headline' || l.slot === 'quote') && i === t.lines.length - 1 && /(^|[^.])\.$/.test(line);
		ctx.fillStyle = ink;
		if (stop) {
			const head = line.slice(0, -1);
			ctx.fillText(head, x, y);
			ctx.fillStyle = hi;
			ctx.fillText('.', x + ctx.measureText(head).width, y);
		} else ctx.fillText(line, x, y);
	});
	ctx.letterSpacing = '0px';
	return ink_;
}

/* What an item draws in a variant, with the boxes of parts that are missing closed up. */
function placedLayers(item: MerchItem, v: Variant, slots: Record<string, string>): { layer: Layer; box: B }[] {
	const drawn = (l: Layer) => (l.only === 'one' && !v.one ? false : l.type === 'art' ? !v.one : l.type === 'text' ? Boolean((slots[l.slot] ?? '').trim()) : true);
	const list = item.layers.filter(drawn).map((layer) => ({ layer, box: [...layer.box] as B }));
	const missing = item.layers.filter((l) => !drawn(l) && !(l.type === 'art' && l.bleed) && !(l.only === 'one' && !v.one));
	if (!missing.length || !item.flow) return list;
	const moving = list.filter((p) => !p.layer.fixed && !(p.layer.type === 'art' && p.layer.bleed)).sort((a, b) => a.box[1] - b.box[1]);
	if (!moving.length) return list;
	/* Stack what is left with the gaps it had; a middle flow keeps the group round the middle of the print. */
	let y = Math.min(...item.layers.filter((l) => !l.fixed && !(l.type === 'art' && l.bleed) && (l.only !== 'one' || v.one)).map((l) => l.box[1]));
	const all = item.layers.filter((l) => !l.fixed && !(l.type === 'art' && l.bleed) && (l.only !== 'one' || v.one)).sort((a, b) => a.box[1] - b.box[1]);
	const gap = Math.max(0.5, Math.min(1.2, ...all.slice(1).map((l, i) => l.box[1] - (all[i]!.box[1] + all[i]!.box[3])).filter((g) => g > 0)));
	for (const p of moving) {
		p.box[1] = y;
		/* A logo keeps its clear space (a fifth of its height) from what follows. */
		y += p.box[3] + (p.layer.type === 'logo' ? Math.max(gap, p.box[3] * 0.25) : gap);
	}
	if (item.flow === 'middle') {
		const top = moving[0]!.box[1];
		const h = y - gap - top;
		const shift = (item.size[1] - h) / 2 - top;
		for (const p of moving) p.box[1] += shift;
	}
	return list;
}

const bare = (s: string) => s.replace(/\s+/g, '');

/** What a merch layer can do: the print's parts are placed by the item; words and variants change. */
const MERCH_CAN: DrawnLayer['can'] = {};

export function drawItem(ctx: Ctx, item: MerchItem, req: MerchRequest = {}) {
	const variant = pick(`variant for ${item.id}`, req.variant ?? item.variants[0]!, item.variants);
	const v = merchDoc().variants[variant]!;
	const c = inks(v);
	const o = item.bleed * PX_PER_IN;
	const W = (item.size[0] + 2 * item.bleed) * PX_PER_IN;
	const H = (item.size[1] + 2 * item.bleed) * PX_PER_IN;
	const px = (b: B) => ({ x: b[0] * PX_PER_IN + o, y: b[1] * PX_PER_IN + o, w: b[2] * PX_PER_IN, h: b[3] * PX_PER_IN });
	const takes = new Set(item.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : [])));
	for (const k of Object.keys(req.slots ?? {})) if (!takes.has(k)) throw new Error(`${item.id} does not draw --${k}.${takes.size ? ` It takes ${[...takes].map((s) => `--${s}`).join(', ')}.` : ' It takes no words.'}`);
	const slots: Record<string, string> = { ...merchDoc().slots, ...(req.sample ? merchDoc().sample : {}), ...req.slots };
	const ground = c.bg || color('off-white');
	const layers: DrawnLayer[] = [];
	const backs: string[] = [];
	const report = (id: string, kind: DrawnLayer['kind'], box: Rect, extra: Partial<DrawnLayer> = {}) => layers.push({ id: layers.some((l) => l.id === id) ? `${id}-${layers.length}` : id, kind, box, can: MERCH_CAN, ...(backs.length ? { over: [...backs] } : {}), ...extra });
	if (v.ground) {
		ctx.fillStyle = c.bg;
		ctx.fillRect(0, 0, W, H);
	}
	const placed = placedLayers(item, v, slots);
	const set = new Map<Layer, SetText>();
	const inner: Rect[] = [];
	for (const { layer: l, box } of placed) {
		const b = px(box);
		if (l.type === 'text') {
			const t = setText(ctx, item, l, slots[l.slot]!, b);
			set.set(l, t);
			const h = t.lines.length * t.size * t.lh;
			if (!l.fixed) inner.push({ x: b.x, y: b.y + (b.h - h) / 2, w: b.w, h });
		} else if (l.type === 'logo') inner.push(b);
	}
	for (const { layer: l, box } of placed) {
		const b = px(box);
		if (l.type === 'art') {
			ctx.save();
			ctx.beginPath();
			ctx.rect(l.bleed ? 0 : b.x, l.bleed ? 0 : b.y, l.bleed ? W : b.w, l.bleed ? H : b.h);
			ctx.clip();
			ctx.translate(b.x, b.y);
			/* A room's back wall holds the logo and the words, so no line runs behind them. */
			const pad = 0.35 * PX_PER_IN;
			const x = Math.min(...inner.map((r) => r.x)) - pad;
			const y = Math.min(...inner.map((r) => r.y)) - pad;
			const wall = l.bleed && inner.length ? { x: x - b.x, y: y - b.y, w: Math.max(...inner.map((r) => r.x + r.w)) + pad - x, h: Math.max(...inner.map((r) => r.y + r.h)) + pad - y } : undefined;
			drawSubject(ctx, { subject: l.subject, width: b.w, height: b.h, theme: v.theme, shape: l.shape, transparent: true, wall, seed: req.seed });
			ctx.restore();
			report('art', 'art', b, l.bleed ? { bleeds: true } : {});
			if (l.bleed) backs.push('art');
		} else if (l.type === 'rule') {
			ctx.fillStyle = v.one ? c.ink : c.line;
			ctx.fillRect(b.x, b.y, b.w, Math.max(2, b.h));
			report('rule', 'art', b);
		} else if (l.type === 'repeat') {
			/* The lockup along a strip (a lanyard), whole each time, centered in the strip. */
			const ratio = lockupRatio(l.part);
			const h = b.h * 0.6;
			const step = h * ratio + l.gap * PX_PER_IN;
			const n = Math.max(1, Math.floor((b.w + l.gap * PX_PER_IN) / step));
			const x0 = b.x + (b.w - (n * step - l.gap * PX_PER_IN)) / 2;
			for (let i = 0; i < n; i++) drawLockup(ctx, x0 + i * step, b.y + (b.h - h) / 2, h, c.ink, l.part);
			report('logo', 'logo', { x: x0, y: b.y + (b.h - h) / 2, w: h * ratio, h }, { logo: { clear: 0, min: 0.2 * PX_PER_IN } });
		} else if (l.type === 'logo') {
			const ratio = lockupRatio(l.part);
			const h = Math.min(b.h, b.w / ratio);
			const r = { x: b.x + (b.w - h * ratio) / 2, y: b.y + (b.h - h) / 2, w: h * ratio, h };
			drawLockup(ctx, r.x, r.y, h, c.ink, l.part);
			report('logo', 'logo', r, { logo: { clear: h * 0.2, min: 0.2 * PX_PER_IN } });
		} else {
			const t = set.get(l)!;
			const fill = l.muted && !v.one ? c.muted : c.ink;
			const ink = paintText(ctx, l, t, b, fill, c.hi);
			const x = Math.min(...ink.map((r) => r.x));
			const y = Math.min(...ink.map((r) => r.y));
			report(l.slot, 'text', { x, y, w: Math.max(...ink.map((r) => r.x + r.w)) - x, h: Math.max(...ink.map((r) => r.y + r.h)) - y }, { ink, text: { asked: slots[l.slot]!.replace(/\s+/g, ' ').trim(), drawn: bare(t.lines.join('')) === bare(plain(t.text)) ? slots[l.slot]!.replace(/\s+/g, ' ').trim() : t.lines.join(' '), ...(l.slot === 'url' && !req.slots?.url ? { own: true } : {}), size: t.size, color: fill, ground: [v.one ? (v.one === 'off-white' ? color('off-black') : color('off-white')) : ground] } });
		}
	}
	return { variant, width: W, height: H, layers };
}

function cutPath(item: MerchItem): string {
	const o = item.bleed * PX_PER_IN;
	const shapes: { x: number; y: number; w: number; h: number; r: number }[] = [];
	if (item.cut) shapes.push({ x: o, y: o, w: item.size[0] * PX_PER_IN, h: item.size[1] * PX_PER_IN, r: item.cut.radius * PX_PER_IN });
	for (const c of item.cuts ?? []) shapes.push({ x: c.box[0] * PX_PER_IN + o, y: c.box[1] * PX_PER_IN + o, w: c.box[2] * PX_PER_IN, h: c.box[3] * PX_PER_IN, r: c.radius * PX_PER_IN });
	if (!shapes.length) return '';
	const d = shapes.map(({ x, y, w, h, r }) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`).join('');
	// The die line is a spot color the cutter reads by name, not ink: magenta by convention, never printed.
	return `<g id="CutContour"><path d="${d}" fill="none" stroke="#FF00FF" stroke-width="3"/></g>`;
}

export type MerchRender = { png?: Buffer; svg?: string; pdf?: Buffer; layers: DrawnLayer[]; variant: string; width: number; height: number; widthIn: number; heightIn: number; dpi: number };

/** The trim (solid) and the safe area (dashed) on a transparent ground: a separate file to lay over the print file in a
 * proof, never part of what is printed. */
export function renderGuides(item: MerchItem, dpi = PX_PER_IN): { png: Buffer; svg: string } {
	const widthIn = item.size[0] + 2 * item.bleed;
	const heightIn = item.size[1] + 2 * item.bleed;
	const W = Math.round(widthIn * PX_PER_IN);
	const H = Math.round(heightIn * PX_PER_IN);
	const o = item.bleed * PX_PER_IN;
	const draw = (ctx: Ctx) => {
		ctx.strokeStyle = color(imageDoc().accent);
		ctx.lineWidth = 3;
		if (item.bleed) ctx.strokeRect(o, o, item.size[0] * PX_PER_IN, item.size[1] * PX_PER_IN);
		const s = item.safe * PX_PER_IN;
		ctx.setLineDash([18, 12]);
		ctx.strokeRect(o + s, o + s, item.size[0] * PX_PER_IN - 2 * s, item.size[1] * PX_PER_IN - 2 * s);
	};
	const p = surface(W, H, { scale: dpi / PX_PER_IN });
	draw(p.ctx);
	const v = surface(W, H, { svg: true });
	draw(v.ctx);
	return { png: toPng(p, { dpi }), svg: toSvg(v, { widthIn, heightIn }) };
}

export function renderItem(item: MerchItem, req: MerchRequest & { png?: boolean; svg?: boolean; pdf?: boolean; dpi?: number } = {}): MerchRender {
	const widthIn = item.size[0] + 2 * item.bleed;
	const heightIn = item.size[1] + 2 * item.bleed;
	const W = Math.round(widthIn * PX_PER_IN);
	const H = Math.round(heightIn * PX_PER_IN);
	const dpi = req.dpi ?? PX_PER_IN;
	const out: MerchRender = { variant: '', layers: [], width: Math.round(widthIn * dpi), height: Math.round(heightIn * dpi), widthIn, heightIn, dpi };
	if (req.png !== false || req.pdf) {
		const s = surface(W, H, { scale: dpi / PX_PER_IN });
		const d = drawItem(s.ctx, item, req);
		out.variant = d.variant;
		out.layers = d.layers;
		if (req.png !== false) out.png = toPng(s, { dpi });
		if (req.pdf) {
			if (!merchDoc().variants[d.variant]!.ground) throw new Error(`The ${d.variant} variant of ${item.id} is printed on a transparent ground, which a PDF here cannot hold. Use png or svg.`);
			out.pdf = imagesToPdf([rgbOf(s)], widthIn * 72);
		}
	}
	if (req.svg) {
		const s = surface(W, H, { svg: true });
		const d = drawItem(s.ctx, item, req);
		out.variant = d.variant;
		out.layers = d.layers;
		out.svg = toSvg(s, { widthIn, heightIn }).replace(/<\/svg>\s*$/, `${cutPath(item)}</svg>\n`);
	}
	return out;
}
