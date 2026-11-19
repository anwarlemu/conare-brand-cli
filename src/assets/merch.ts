import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { drawLockup, lockupRatio } from './art.js';
import { color, font, surface, toPng, toSvg, type Ctx } from './canvas.js';
import { pick } from './io.js';
import { emphasise, imageDoc } from './og.js';
import { drawSubject } from '../illustrate/draw.js';

// Merch print files (brand/assets/merch.json): each item's trim, bleed and safe area in inches, and a layout of logo,
// words and illustration in inches from the trim. A file is the item at 300 pixels per inch with the bleed around it:
// SVG at physical size (inches on the root, the die line as a CutContour spot path) and PNG at the asked dpi.

export const PX_PER_IN = 300;
type B = [number, number, number, number];
type Layer =
	| { type: 'logo'; part: 'primary' | 'mark'; box: B }
	| { type: 'text'; slot: string; box: B; size: number; face: 'display' | 'mono' }
	| { type: 'art'; subject: string; shape?: 'tall' | 'wide'; box: B; bleed?: boolean };
export type MerchItem = { id: string; name: string; size: [number, number]; bleed: number; safe: number; method: string; source: string; cut?: { radius: number }; variants: string[]; layers: Layer[] };
type Variant = { theme?: string; one?: string; ground: boolean };
type MerchDoc = { dpi: number; slots: Record<string, string>; variants: Record<string, Variant>; items: MerchItem[] };

let doc: MerchDoc | undefined;
export const merchDoc = (): MerchDoc => (doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'merch.json'), 'utf8')) as MerchDoc);
export const merchItems = () => merchDoc().items;
export const findItem = (id: string): MerchItem => merchItems().find((i) => i.id === pick('item', id, merchItems().map((x) => x.id)))!;

export function merchCatalog() {
	return {
		items: merchItems().map((i) => ({
			id: i.id, name: i.name, trim: { width: i.size[0], height: i.size[1], unit: 'in' }, bleed: i.bleed, safe: i.safe, method: i.method, variants: i.variants,
			pixels: { width: Math.round((i.size[0] + 2 * i.bleed) * PX_PER_IN), height: Math.round((i.size[1] + 2 * i.bleed) * PX_PER_IN), dpi: PX_PER_IN },
			dieCut: Boolean(i.cut), slots: [...new Set(i.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : [])))], lockups: [...new Set(i.layers.flatMap((l) => (l.type === 'logo' ? [l.part] : [])))], source: i.source,
		})),
		variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ...v })),
		note: 'Trim, bleed and safe areas are common vendor conventions, not a vendor spec. Confirm against the print vendor\'s template for the exact blank before ordering.',
	};
}

export type MerchRequest = { variant?: string; slots?: Record<string, string>; guides?: boolean };

function inks(v: Variant) {
	if (v.one) return { ink: color(v.one), hi: color(v.one), bg: '' };
	const t = imageDoc().themes[v.theme!]!;
	const hiName = t.onAccent?.highlight === 'ink' ? t.ink : imageDoc().accent;
	return { ink: color(t.ink), hi: color(hiName), bg: color(t.bg) };
}

/* Words fitted to a box: wrapped at its width, shrunk until they fit its height. A headline keeps its red stop. */
function drawText(ctx: Ctx, l: Extract<Layer, { type: 'text' }>, value: string, b: { x: number; y: number; w: number; h: number }, ink: string, hi: string) {
	const display = l.face === 'display';
	const text = display ? emphasise(value) : value;
	let size = l.size * PX_PER_IN;
	let lines: string[] = [];
	const lh = display ? 1.08 : 1.2;
	for (let guard = 0; guard < 60; guard++) {
		ctx.font = font(display ? 'display' : 'mono', 400, size);
		ctx.letterSpacing = `${(display ? -0.02 : 0.02) * size}px`;
		lines = [];
		let cur = '';
		for (const w of text.split(/\s+/)) {
			const next = cur ? `${cur} ${w}` : w;
			if (cur && ctx.measureText(next).width > b.w) {
				lines.push(cur);
				cur = w;
			} else cur = next;
		}
		if (cur) lines.push(cur);
		const widest = Math.max(...lines.map((x) => ctx.measureText(x).width));
		if (lines.length * size * lh <= b.h && widest <= b.w) break;
		size *= 0.94;
	}
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	const top = b.y + (b.h - lines.length * size * lh) / 2;
	lines.forEach((line, i) => {
		const w = ctx.measureText(line).width;
		const x = b.x + (b.w - w) / 2;
		const y = top + size * lh * i + size * 0.86;
		const stop = display && i === lines.length - 1 && /[^.]\.$/.test(line);
		ctx.fillStyle = ink;
		if (stop) {
			const head = line.slice(0, -1);
			ctx.fillText(head, x, y);
			ctx.fillStyle = hi;
			ctx.fillText('.', x + ctx.measureText(head).width, y);
		} else ctx.fillText(line, x, y);
	});
	ctx.letterSpacing = '0px';
}

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
	const slots = { ...merchDoc().slots, ...req.slots };
	if (v.ground) {
		ctx.fillStyle = c.bg;
		ctx.fillRect(0, 0, W, H);
	}
	for (const l of item.layers) {
		const b = px(l.box);
		if (l.type === 'art') {
			if (v.one) continue;
			ctx.save();
			ctx.beginPath();
			ctx.rect(l.bleed ? 0 : b.x, l.bleed ? 0 : b.y, l.bleed ? W : b.w, l.bleed ? H : b.h);
			ctx.clip();
			ctx.translate(b.x, b.y);
			drawSubject(ctx, { subject: l.subject, width: b.w, height: b.h, theme: v.theme, shape: l.shape, transparent: true });
			ctx.restore();
		} else if (l.type === 'logo') {
			const ratio = lockupRatio(l.part);
			const h = Math.min(b.h, b.w / ratio);
			drawLockup(ctx, b.x + (b.w - h * ratio) / 2, b.y + (b.h - h) / 2, h, c.ink, l.part);
		} else {
			const value = slots[l.slot] ?? '';
			if (value.trim()) drawText(ctx, l, value, b, c.ink, c.hi);
		}
	}
	if (req.guides) {
		ctx.save();
		ctx.strokeStyle = color(imageDoc().accent);
		ctx.lineWidth = 3;
		if (item.bleed) ctx.strokeRect(o, o, item.size[0] * PX_PER_IN, item.size[1] * PX_PER_IN);
		const s = item.safe * PX_PER_IN;
		ctx.setLineDash([18, 12]);
		ctx.strokeRect(o + s, o + s, item.size[0] * PX_PER_IN - 2 * s, item.size[1] * PX_PER_IN - 2 * s);
		ctx.restore();
	}
	return { variant, width: W, height: H };
}

function cutPath(item: MerchItem): string {
	if (!item.cut) return '';
	const o = item.bleed * PX_PER_IN;
	const w = item.size[0] * PX_PER_IN;
	const h = item.size[1] * PX_PER_IN;
	const r = item.cut.radius * PX_PER_IN;
	const d = `M${o + r} ${o}H${o + w - r}A${r} ${r} 0 0 1 ${o + w} ${o + r}V${o + h - r}A${r} ${r} 0 0 1 ${o + w - r} ${o + h}H${o + r}A${r} ${r} 0 0 1 ${o} ${o + h - r}V${o + r}A${r} ${r} 0 0 1 ${o + r} ${o}Z`;
	// The die line is a spot color the cutter reads by name, not ink: magenta by convention, never printed.
	return `<g id="CutContour"><path d="${d}" fill="none" stroke="#FF00FF" stroke-width="3"/></g>`;
}

export type MerchRender = { png?: Buffer; svg?: string; variant: string; width: number; height: number; widthIn: number; heightIn: number; dpi: number };

export function renderItem(item: MerchItem, req: MerchRequest & { png?: boolean; svg?: boolean; dpi?: number } = {}): MerchRender {
	const widthIn = item.size[0] + 2 * item.bleed;
	const heightIn = item.size[1] + 2 * item.bleed;
	const W = Math.round(widthIn * PX_PER_IN);
	const H = Math.round(heightIn * PX_PER_IN);
	const dpi = req.dpi ?? PX_PER_IN;
	const out: MerchRender = { variant: '', width: Math.round(widthIn * dpi), height: Math.round(heightIn * dpi), widthIn, heightIn, dpi };
	if (req.png !== false) {
		const s = surface(W, H, { scale: dpi / PX_PER_IN });
		out.variant = drawItem(s.ctx, item, req).variant;
		out.png = toPng(s, { dpi });
	}
	if (req.svg) {
		const s = surface(W, H, { svg: true });
		out.variant = drawItem(s.ctx, item, req).variant;
		out.svg = toSvg(s, { widthIn, heightIn }).replace(/<\/svg>\s*$/, `${cutPath(item)}</svg>\n`);
	}
	return out;
}
