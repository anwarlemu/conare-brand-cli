import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DrawnLayer, LayerEdit, Rect } from '../design/types.js';
import { brand, packageRoot } from '../lib/brand.js';
import { contrast } from '../assets/canvas.js';
import { CopyError, roleFor } from '../assets/glyphs.js';
import { largeType, logoFloor, smallFloor, unitOf } from '../assets/layouts.js';
import type { Face, Faces } from './fonts.js';
import { faces } from './fonts.js';
import { paperTheme, theme, type GroundId, type SizeSpec, type TemplateId, type Theme } from './spec.js';
import { mostWords } from '../assets/words.js';
import { blockHeight, capHeight, descent, fit, measure, normalize, withStop } from './text.js';

// Layouts follow the site: the heading face with a red full stop, the red tag for an eyebrow, the text face
// for the line under it, a hairline and the mark. The frame template uses the site's double rule. Each drawing reports
// the layers it painted; copy that does not fit whole is an error naming what to shorten.

export type ImageCopy = {
	template: TemplateId;
	ground: GroundId;
	title: string;
	text?: string;
	eyebrow?: string;
	by?: string;
	image?: { mime: string; data: Buffer; w: number; h: number };
	layers?: Record<string, LayerEdit>;
};

type Box = { height: number; draw: (x: number, y: number) => string; report?: (x: number, y: number) => void };
type Out = { body: string; layers: DrawnLayer[] };

/** What each layer of a card can do. */
export const CARD_LAYERS: Record<string, DrawnLayer['can']> = {
	logo: { scale: [0.8, 2], anchors: ['bottom-left', 'bottom-right', 'top-left', 'top-right'] },
	headline: { move: true, scale: [0.5, 1.6] },
	body: { move: true, scale: [0.7, 1.6], hide: true },
	badge: { move: true, scale: [0.7, 2], hide: true },
	by: { move: true, scale: [0.8, 1.8], hide: true },
	address: { hide: true },
	rule: { hide: true },
	picture: { hide: false },
	window: { hide: true },
};

/** The layers a card template can draw. */
export function cardLayers(t: TemplateId): { id: string; can: DrawnLayer['can'] }[] {
	const ids = ['logo', 'headline', ...(t === 'headline' || t === 'quote' ? [] : ['body']), 'badge', ...(t === 'quote' ? ['by'] : []), 'address', 'rule', ...(t === 'frame' ? ['picture', 'window'] : [])];
	return ids.map((id) => ({ id, can: CARD_LAYERS[id]! }));
}

function checkEdits(copy: ImageCopy) {
	const known = cardLayers(copy.template);
	for (const [id, e] of Object.entries(copy.layers ?? {})) {
		const l = known.find((k) => k.id === id);
		if (!l) throw new Error(`${copy.template} has no "${id}" layer. It has ${known.map((k) => k.id).join(', ')}.`);
		const can = l.can;
		if ((e.dx || e.dy) && !can.move) throw new Error(`The ${id} of ${copy.template} stays where the layout puts it.`);
		if (e.scale !== undefined && e.scale !== 1) {
			if (!can.scale) throw new Error(`The ${id} of ${copy.template} does not take a scale.`);
			if (e.scale < can.scale[0] || e.scale > can.scale[1]) throw new Error(`The ${id} scales from ${can.scale[0]} to ${can.scale[1]}, not ${e.scale}.`);
		}
		if (e.align) throw new Error(`${copy.template} sets its words left; the ${id} takes no alignment.`);
		if (e.hidden && !can.hide) throw new Error(`The ${id} of ${copy.template} cannot be hidden.`);
		if (e.anchor && !can.anchors?.includes(e.anchor)) throw new Error(`The ${id} of ${copy.template} does not take an anchor${can.anchors ? ` of ${e.anchor}; it takes ${can.anchors.join(', ')}` : ''}.`);
	}
}

export async function drawCard(copy: ImageCopy, size: SizeSpec): Promise<{ svg: string; layers: DrawnLayer[] }> {
	checkEdits(copy);
	const loaded = await faces();
	const palette = theme(copy.ground);
	/* The cards do not place round what a platform covers, so they keep to the frame clear of all of it. */
	const out = new Card(copy, size.clear ? { ...size, frame: size.clear } : size, loaded, palette).draw();
	return { svg: document(size, palette, loaded, out.body), layers: out.layers };
}

export async function draw(copy: ImageCopy, size: SizeSpec): Promise<string> {
	return (await drawCard(copy, size)).svg;
}

/** One card: its frame (where everything seen stays), its rhythm, and the layers it reports as it draws. */
class Card {
	layers: DrawnLayer[] = [];
	r: Rhythm;
	fw: number;
	fh: number;
	small: number;
	constructor(
		private copy: ImageCopy,
		private size: SizeSpec,
		private loaded: Faces,
		private palette: Theme,
	) {
		this.fw = size.frame.w;
		this.fh = size.frame.h;
		this.small = Math.ceil(smallFloor(size.w, size.shown));
		this.r = rhythm(size, this.small);
	}

	private edit(id: string): LayerEdit {
		return this.copy.layers?.[id] ?? {};
	}
	private scale(id: string) {
		return this.edit(id).scale ?? 1;
	}
	private hidden(id: string) {
		return this.edit(id).hidden === true;
	}
	private off(id: string) {
		return { x: (this.edit(id).dx ?? 0) * this.size.w, y: (this.edit(id).dy ?? 0) * this.size.h };
	}
	private at(r: Rect): Rect {
		return { ...r, x: r.x + this.size.frame.x, y: r.y + this.size.frame.y };
	}
	private report(id: string, kind: DrawnLayer['kind'], box: Rect, extra: Partial<DrawnLayer> = {}) {
		this.layers.push({ id, kind, box: this.at(box), can: CARD_LAYERS[id] ?? {}, ...extra, ...(extra.ink ? { ink: extra.ink.map((i) => this.at(i)) } : {}) });
	}

	private display(text: string): Face {
		return roleFor('display', text, 'headline') === 'display' ? this.loaded.heading : this.loaded.text;
	}
	private face(text: string, what: string): Face {
		roleFor('ui', text, what);
		return this.loaded.text;
	}
	private medium(text: string, what: string): Face {
		roleFor('ui', text, what);
		return this.loaded.medium;
	}

	/* A layer's type size: its own, never under the legible floor, times the edit (an edit under the floor is an error). */
	private edited(id: string, base: number): number {
		const k = this.scale(id);
		const s = Math.max(this.small, base) * k;
		if (s < this.small - 0.5) throw new CopyError(`The ${id} at scale ${k} does not fit ${this.size.id}: it would be ${Math.round(s)} px, and reads from ${this.small} px up.`);
		return Math.max(this.small, Math.round(s));
	}

	private headFloor() {
		return Math.max(largeType(this.size.w), this.small * 1.4);
	}

	private tooLong(what: 'headline' | 'body' | 'badge' | 'name', text: string, ok: (t: string) => boolean): CopyError {
		const words = text.split(/\s+/);
		const n = mostWords(words.length, (k) => ok(words.slice(0, k).join(' ')));
		const at = `${this.copy.template} at ${this.size.id}`;
		return new CopyError(n > 0 ? `The ${what} does not fit ${at}. Shorten it to about ${n} word${n === 1 ? '' : 's'}.` : `The ${what} does not fit ${at}. Shorten it.`);
	}

	draw(): Out {
		const body = this.copy.template === 'frame' ? this.frame() : this.poster();
		const { x, y } = this.size.frame;
		return { body: x || y ? `<g transform="translate(${fmt(x)} ${fmt(y)})">${body}</g>` : body, layers: this.layers };
	}

	/* The mark's row and the address, and the box left for the rest. */
	private chrome(): { svg: string; top: number; bottom: number; right: number } {
		const { r, size, palette, fw, fh } = this;
		const ultra = fw / fh >= 3.9;
		const anchor = this.edit('logo').anchor ?? 'bottom-left';
		const floor = logoFloor(size.w, size.shown);
		const base = Math.max(r.mark, floor) * this.scale('logo');
		if (base < floor - 0.01) throw new CopyError(`The logo at scale ${this.scale('logo')} does not fit ${size.id}: it would be ${Math.round(base)} px tall, and reads from ${Math.ceil(floor)} px.`);
		const mh = base;
		const mw = mh * (149 / 134);
		const host = siteHost(brand().site);
		const parts: string[] = [];
		let top = r.padTop;
		let bottom = fh - r.padBottom;
		let right = fw - r.padX;
		const logo = (x: number, y: number) => {
			parts.push(markAt(palette.fg, x, y, mh));
			this.report('logo', 'logo', { x, y, w: mw, h: mh }, { logo: { clear: mh * 0.2, min: floor } });
		};
		const address = (x: number, mid: number, urlSize: number, alignRight: boolean) => {
			if (this.hidden('address')) return;
			const face = this.loaded.text;
			const w = measure(face, host, urlSize, 0);
			const cap = capHeight(face, urlSize);
			const drop = descent(face, urlSize);
			const bx = alignRight ? x - w : x;
			const baseline = mid - (cap + drop) / 2 + cap;
			parts.push(textAt(face, host, bx, baseline, urlSize, 0, palette.fgMuted));
			this.report('address', 'text', { x: bx, y: baseline - cap, w, h: cap + drop }, { text: { asked: host, drawn: host, size: urlSize, color: palette.fgMuted, ground: [palette.bg], own: true } });
		};
		if (ultra) {
			/* A strip: the mark at the end, centered; no foot. */
			const onLeft = anchor.endsWith('left') && Boolean(this.edit('logo').anchor);
			const x = onLeft ? r.padX : fw - r.padX - mw;
			logo(x, (fh - mh) / 2);
			right = onLeft ? right : x - r.padX * 0.8;
			return { svg: parts.join(''), top, bottom, right };
		}
		const topRow = anchor.startsWith('top');
		const atRight = anchor.endsWith('right');
		const url = Math.max(r.url, this.small);
		let edge = fw - r.padX;
		for (const a of size.avoid) if (a.x > size.frame.x + fw / 2 && a.y < size.frame.y + fh - r.padBottom) edge = Math.min(edge, a.x - size.frame.x - 16);
		if (topRow) {
			logo(atRight ? fw - r.padX - mw : r.padX, r.padTop);
			top = r.padTop + mh + r.gapTag;
		}
		const rowH = topRow ? url * 1.2 : Math.max(mh, url * 1.2);
		const rowY = fh - r.padBottom - rowH;
		const showRow = !topRow || !this.hidden('address');
		if (showRow) {
			const ruleY = rowY - r.footerGap;
			if (!this.hidden('rule')) {
				parts.push(rect(r.padX, ruleY, edge - r.padX, 1, palette.edge));
				this.report('rule', 'art', { x: r.padX, y: ruleY, w: edge - r.padX, h: 1 });
			}
			if (!topRow) logo(atRight ? edge - mw : r.padX, rowY + (rowH - mh) / 2);
			if (!topRow && !atRight) address(edge, rowY + rowH / 2, url, true);
			else address(topRow && atRight ? edge : r.padX, rowY + rowH / 2, url, topRow && atRight);
			bottom = ruleY - r.ruleGap;
		}
		return { svg: parts.join(''), top, bottom, right };
	}

	private headlineBox(text: string, size: number, lines: string[], face: Face, leading: number): Box {
		const p = this.palette;
		const height = blockHeight(face, lines, size, leading);
		const o = this.off('headline');
		return {
			height,
			draw: (x, y) => linesBox(face, lines, size, leading, p.trackingDisplay, p.fg, p.accentText).draw(x + o.x, y + o.y),
			report: (x, y) => this.reportLines('headline', face, lines, size, leading, p.trackingDisplay, x + o.x, y + o.y, p.fg, text),
		};
	}

	private reportLines(id: string, face: Face, lines: string[], size: number, leading: number, tracking: number, x: number, y: number, fill: string, asked: string) {
		const cap = capHeight(face, size);
		const drop = descent(face, size);
		const ink = lines.map((l, i) => ({ x, y: y + i * size * leading, w: measure(face, l, size, tracking), h: cap + drop }));
		const box = { x, y, w: Math.max(...ink.map((r) => r.w)), h: blockHeight(face, lines, size, leading) };
		this.report(id, 'text', box, { ink, text: { asked: oneLine(asked), drawn: readBack(oneLine(asked), lines), size, color: fill, ground: [this.palette.bg] } });
	}

	private tag(column: number, size: number): Box | undefined {
		const label = (this.copy.eyebrow ?? '').trim();
		if (!label || this.hidden('badge')) return undefined;
		const face = this.medium(label, 'badge');
		const p = this.palette;
		const text = label.toUpperCase();
		const padXFor = (n: number) => Math.round(n * 0.48);
		const width = (n: number, t = text) => measure(face, t, n, p.trackingTag) + padXFor(n) * 2;
		let s = this.edited('badge', size);
		while (width(s) > column && s > this.small && this.scale('badge') <= 1) s -= 1;
		if (width(s) > column) throw this.tooLong('badge', label, (t) => width(s, t.toUpperCase()) <= column);
		const cap = capHeight(face, s);
		const padX = padXFor(s);
		const padY = Math.round(s * 0.36);
		const height = Math.ceil(cap + padY * 2);
		const boxW = Math.min(column, Math.ceil(width(s)));
		const fill = contrast(p.onAccent, p.accent) >= 4.5 || s >= largeType(this.size.w) ? p.accent : p.accentSmall;
		const o = this.off('badge');
		return {
			height,
			draw: (x, y) => `${rect(x + o.x, y + o.y, boxW, height, fill)}${textAt(face, text, x + o.x + padX, y + o.y + padY + cap, s, p.trackingTag, p.onAccent)}`,
			report: (x, y) => this.report('badge', 'text', { x: x + o.x, y: y + o.y, w: boxW, h: height }, { text: { asked: label, drawn: text, size: s, color: p.onAccent, ground: [fill] } }),
		};
	}

	private byline(column: number, size: number): Box | undefined {
		const name = this.copy.template === 'quote' ? (this.copy.by ?? '').trim() : '';
		if (!name || this.hidden('by')) return undefined;
		const face = this.medium(name, 'name');
		const p = this.palette;
		let s = this.edited('by', size);
		const square = (n: number) => Math.max(7, Math.round(n * 0.42));
		const lead = (n: number) => square(n) + Math.round(square(n) * 1.15);
		while (s > this.small && measure(face, name, s, 0) + lead(s) > column) s -= 1;
		if (measure(face, name, s, 0) + lead(s) > column) throw this.tooLong('name', name, (t) => measure(face, t, s, 0) + lead(s) <= column);
		const cap = capHeight(face, s);
		const drop = descent(face, s);
		const o = this.off('by');
		return {
			height: cap + drop,
			draw: (x, y) => `${rect(x + o.x, y + o.y + (cap - square(s)) / 2, square(s), square(s), p.accentText)}${textAt(face, name, x + o.x + lead(s), y + o.y + cap, s, 0, p.fg)}`,
			report: (x, y) => this.report('by', 'text', { x: x + o.x, y: y + o.y, w: lead(s) + measure(face, name, s, 0), h: cap + drop }, { text: { asked: name, drawn: name, size: s, color: p.fg, ground: [p.bg] } }),
		};
	}

	/* The headline and the line under it at the largest sizes that fit whole: the layout's lines first, then more lines. */
	private words(opts: { column: number; bodyColumn: number; budget: number; max: number; lines: number; leading: number; fixed: number; sub: string; bodyMax: number; bodyLines: number }): { head: { size: number; lines: string[]; face: Face }; sub?: { size: number; lines: string[]; face: Face } } {
		const { r, palette } = this;
		const title = withStop(this.copy.title);
		const face = this.display(title);
		const subFace = opts.sub ? this.face(opts.sub, 'body') : this.loaded.text;
		const floor = Math.ceil(this.headFloor());
		const bodyFloor = this.small;
		const setAt = (t: string, b: string, size: number, lines: number, bodyLines: number) => {
			const head = fit(face, t, opts.column, { maxSize: size, minSize: size, maxLines: lines, leading: opts.leading, tracking: palette.trackingDisplay, maxHeight: opts.budget - opts.fixed, breakWords: size <= floor });
			if (!head) return undefined;
			const headH = blockHeight(face, head.lines, head.size, opts.leading);
			if (!b) return headH + opts.fixed <= opts.budget + 0.5 ? { head: { ...head, face } } : undefined;
			const bodyMax = this.edited('body', opts.bodyMax);
			const sub = fit(subFace, b, opts.bodyColumn, { maxSize: bodyMax, minSize: this.scale('body') > 1 ? bodyMax : bodyFloor, maxLines: bodyLines, leading: r.bodyLeading, tracking: 0, maxHeight: opts.budget - opts.fixed - headH, breakWords: true });
			return sub ? { head: { ...head, face }, sub: { ...sub, face: subFace } } : undefined;
		};
		const search = (t: string, b: string, max: number, min: number) => {
			for (const [lines, bodyLines] of [[opts.lines, opts.bodyLines], [opts.lines + 2, opts.bodyLines + 3], [99, 99]] as const) {
				for (let size = Math.floor(max); size >= min; size -= 1) {
					const hit = setAt(t, b, size, lines, bodyLines);
					if (hit) return hit;
				}
			}
			return undefined;
		};
		const max = Math.max(opts.max, floor);
		const hit = search(title, opts.sub, max, floor);
		if (!hit) {
			if (opts.sub && search(title, '', max, floor)) throw this.tooLong('body', opts.sub, (t) => Boolean(search(title, t, floor, floor)));
			throw this.tooLong('headline', normalize(this.copy.title).replace(/\n/g, ' '), (t) => Boolean(search(withStop(t), '', floor, floor)));
		}
		const k = this.scale('headline');
		if (k === 1) return hit;
		const want = hit.head.size * k;
		if (want < floor - 0.5) throw new CopyError(`The headline at scale ${k} does not fit ${this.size.id}: it would be ${Math.round(want)} px, and reads from ${floor} px up.`);
		const scaled = search(title, opts.sub, Math.round(want), Math.round(want));
		if (scaled) return scaled;
		let best = hit.head.size;
		for (let n = Math.floor(want); n > hit.head.size; n--) if (search(title, opts.sub, n, n)) { best = n; break; }
		throw new CopyError(`The headline at scale ${k} does not fit ${this.copy.template} at ${this.size.id}. The largest that does is ${Math.floor((best / hit.head.size) * 100) / 100}.`);
	}

	private bodyBox(sub: { size: number; lines: string[]; face: Face }, asked: string): Box {
		const p = this.palette;
		const o = this.off('body');
		return {
			height: blockHeight(sub.face, sub.lines, sub.size, this.r.bodyLeading),
			draw: (x, y) => linesBox(sub.face, sub.lines, sub.size, this.r.bodyLeading, 0, p.fgMuted, p.fgMuted).draw(x + o.x, y + o.y),
			report: (x, y) => this.reportLines('body', sub.face, sub.lines, sub.size, this.r.bodyLeading, 0, x + o.x, y + o.y, p.fgMuted, asked),
		};
	}

	private poster(): string {
		const { r, palette, copy } = this;
		const chrome = this.chrome();
		const column = chrome.right - r.padX;
		const budget = chrome.bottom - chrome.top;
		const quote = copy.template === 'quote';
		const announce = copy.template === 'announcement';
		const sub = quote || copy.template === 'headline' || this.hidden('body') ? '' : normalize(copy.text ?? '');
		const tag = this.tag(column, r.eyebrow);
		const by = this.byline(column, Math.round(r.body * 0.92));
		const byGap = by ? Math.round(r.gapBody * 0.9) : 0;
		const ruleBefore = announce && sub ? Math.round(r.body * 0.85) : 0;
		const ruleAfter = announce && sub ? Math.round(r.body * 0.95) : 0;
		const subGap = sub ? (announce ? ruleBefore + 1 + ruleAfter : r.gapBody) : 0;
		const fixed = (tag ? tag.height + r.gapTag : 0) + subGap + (by ? byGap + by.height : 0);
		const leading = quote ? 1.14 : 1.1;
		const w = this.words({ column, bodyColumn: Math.min(column, Math.max(Math.round(this.fw * 0.66), Math.round(column * 0.8))), budget, max: quote ? Math.round(r.headline * 0.86) : r.headline, lines: quote ? r.headlineLines + 2 : r.headlineLines, leading, fixed, sub, bodyMax: r.body, bodyLines: announce ? 2 : r.bodyLines });
		const boxes: Box[] = [];
		if (tag) boxes.push(tag, gap(r.gapTag));
		boxes.push(this.headlineBox(copy.title, w.head.size, w.head.lines, w.head.face, leading));
		if (w.sub) {
			if (announce) {
				const ruleW = Math.max(48, ...w.head.lines.map((line) => measure(w.head.face, line.endsWith('.') ? line.slice(0, -1) : line, w.head.size, palette.trackingDisplay)));
				boxes.push(gap(ruleBefore), { height: 1, draw: (x, y) => rect(x, y, ruleW, 1, palette.edge) }, gap(ruleAfter));
			} else boxes.push(gap(r.gapBody));
			boxes.push(this.bodyBox(w.sub, sub));
		}
		if (by) boxes.push(gap(byGap), by);
		const slack = budget - boxes.reduce((sum, b) => sum + b.height, 0);
		const ultra = this.fw / this.fh >= 3.9;
		const top = chrome.top + Math.max(0, Math.round(slack * (ultra ? 0.5 : quote ? 0.4 : 0.38)));
		return `${paint(boxes, r.padX, top)}${chrome.svg}`;
	}

	private frame(): string {
		const { r, palette, copy } = this;
		const chrome = this.chrome();
		const sub = this.hidden('body') ? '' : normalize(copy.text ?? '');
		const wide = this.fw / this.fh > 1.35;
		const contentH = chrome.bottom - chrome.top;
		const innerW = chrome.right - r.padX;
		const gutter = Math.round(r.padX * 0.7);
		const show = Boolean(copy.image) || !this.hidden('window');
		const ratio = copy.image ? copy.image.h / copy.image.w : 0;
		const inset = Math.max(8, Math.round(this.fw * 0.011));
		const textW = wide && show ? Math.round(innerW * 0.4) : innerW;
		const tag = this.tag(textW, Math.round(r.eyebrow * 0.92));
		const tagH = tag ? tag.height + Math.round(r.gapTag * 0.75) : 0;
		const subGap = sub ? Math.round(r.gapBody * 0.8) : 0;
		const budget = wide || !show ? contentH : Math.max(contentH * 0.42, contentH - innerW * 0.8 - r.gapBody * 1.1);
		const headMax = wide ? Math.min(r.headline, Math.round(textW * 0.16)) : Math.round(r.headline * 0.62);
		const w = this.words({ column: textW, bodyColumn: textW, budget, max: headMax, lines: wide ? 4 : 3, leading: 1.08, fixed: tagH + subGap, sub, bodyMax: wide ? Math.round(r.body * 0.95) : r.body, bodyLines: wide ? 4 : 2 });
		const boxes: Box[] = [];
		if (tag) boxes.push(tag, gap(Math.round(r.gapTag * 0.75)));
		boxes.push(this.headlineBox(copy.title, w.head.size, w.head.lines, w.head.face, 1.08));
		if (w.sub) boxes.push(gap(subGap), this.bodyBox(w.sub, sub));
		const textH = boxes.reduce((s, b) => s + b.height, 0);
		const gapY = Math.round(r.gapBody * 1.1);
		const region: Rect = wide ? { x: r.padX + textW + gutter, y: chrome.top, w: innerW - textW - gutter, h: contentH } : { x: r.padX, y: chrome.top + textH + gapY, w: innerW, h: contentH - textH - gapY };
		let shot = '';
		if (show) {
			/* The picture whole, at its own shape, inside the double rule. */
			let box = region;
			if (copy.image) {
				const iw = Math.min(region.w - 2 * inset - 2, (region.h - 2 * inset - 2) / ratio);
				const bw = iw + 2 * inset + 2;
				const bh = iw * ratio + 2 * inset + 2;
				box = { x: wide ? region.x + region.w - bw : region.x + (region.w - bw) / 2, y: region.y + (region.h - bh) / 2, w: bw, h: bh };
			}
			shot = copy.image ? imageFill(copy.image, box, inset, palette) : miniature(box.x, box.y, box.w, box.h, palette);
			this.report(copy.image ? 'picture' : 'window', 'key', box);
		}
		const textY = wide ? chrome.top + Math.max(0, Math.round((contentH - textH) * 0.46)) : chrome.top;
		return `${shot}${paint(boxes, r.padX, textY)}${chrome.svg}`;
	}
}

const oneLine = (s: string) => normalize(s).replace(/\n/g, ' ');

/** What the lines read as: the copy itself when every letter is there (a long word may be broken), else what was drawn. */
function readBack(asked: string, lines: string[]): string {
	const bare = (t: string) => t.replace(/\s+/g, '');
	const drawn = lines.join(' ');
	return bare(drawn) === bare(asked) || bare(drawn) === `${bare(asked)}.` ? asked : drawn;
}

function imageFill(image: { mime: string; data: Buffer }, b: Rect, inset: number, palette: Theme): string {
	const ix = b.x + inset;
	const iy = b.y + inset;
	const iw = b.w - inset * 2;
	const ih = b.h - inset * 2;
	const href = `data:${image.mime};base64,${image.data.toString('base64')}`;
	return [
		rect(b.x, b.y, b.w, b.h, 'none', palette.edgeStrong),
		rect(ix, iy, iw, ih, 'none', palette.edgeStrong),
		`<image href="${href}" x="${fmt(ix + 1)}" y="${fmt(iy + 1)}" width="${fmt(iw - 2)}" height="${fmt(ih - 2)}" preserveAspectRatio="xMidYMid meet"/>`,
	].join('');
}

function miniature(x: number, y: number, w: number, h: number, palette: Theme): string {
	const inset = Math.max(8, Math.round(w * 0.018));
	const ix = x + inset + 1;
	const iy = y + inset + 1;
	const iw = w - inset * 2 - 2;
	const ih = h - inset * 2 - 2;
	const light = paperTheme();
	const rail = Math.round(iw * 0.3);
	const parts = [rect(x, y, w, h, 'none', palette.edgeStrong), rect(ix - 1, iy - 1, iw + 2, ih + 2, 'none', palette.edgeStrong), rect(ix, iy, iw, ih, light.bg), rect(ix, iy, rail, ih, light.bgSubtle), rect(ix + rail, iy, 1, ih, light.edge)];
	const markH = Math.max(16, Math.round(ih * 0.07));
	const markX = ix + Math.round(rail * 0.14);
	const markY = iy + Math.round(ih * 0.055);
	parts.push(markAt(light.fg, markX, markY, markH));
	const rows = 6;
	const rowTop = markY + markH + Math.round(ih * 0.06);
	const rowSpan = ih - (rowTop - iy) - Math.round(ih * 0.06);
	const rowH = rowSpan / rows;
	for (let i = 0; i < rows; i++) {
		const ry = rowTop + i * rowH;
		const active = i === 1;
		const barH = Math.max(4, Math.round(rowH * 0.16));
		// The console's active page: a 2px accent at the sidebar's edge, most of the row tall (SidebarLink).
		if (active) {
			const tickH = Math.max(8, rowH * 0.58);
			parts.push(rect(ix, ry + (rowH - tickH) / 2, 2, tickH, light.edgeAccent));
		}
		const barW = (rail - (markX - ix)) * (active ? 0.62 : 0.4 + (i % 3) * 0.08);
		parts.push(rect(markX, ry + (rowH - barH) / 2, barW, barH, active ? light.fg : light.edgeStrong));
	}
	const mx = ix + rail + Math.round(iw * 0.055);
	const mw = iw - (mx - ix) - Math.round(iw * 0.055);
	const fracs = [0.46, 0.94, 0.88, 0.8, 0.5, 0.92, 0.84, 0.62];
	const blockTop = iy + ih * 0.09;
	const step = (ih * 0.78) / fracs.length;
	fracs.forEach((frac, i) => {
		const barH = Math.max(5, i === 0 ? ih * 0.028 : ih * 0.014);
		parts.push(rect(mx, blockTop + i * step, mw * frac, barH, i === 0 ? light.fg : light.edge));
	});
	return parts.join('');
}

type Rhythm = {
	padX: number;
	padTop: number;
	padBottom: number;
	mark: number;
	url: number;
	footerGap: number;
	ruleGap: number;
	headline: number;
	headlineLines: number;
	body: number;
	bodyLines: number;
	bodyLeading: number;
	eyebrow: number;
	gapTag: number;
	gapBody: number;
};

function rhythm(size: SizeSpec, small: number): Rhythm {
	// Tuned per canvas. The headline leading matches the site headline's 1.1 line-height.
	const floor = (r: Rhythm): Rhythm => ({ ...r, body: Math.max(r.body, Math.round(small * 1.15)), eyebrow: Math.max(r.eyebrow, small), url: Math.max(r.url, small) });
	if (size.id === 'square') return floor({ padX: 76, padTop: 76, padBottom: 44, mark: 34, url: 18, footerGap: 22, ruleGap: 36, headline: 108, headlineLines: 4, body: 26, bodyLines: 4, bodyLeading: 1.4, eyebrow: 16, gapTag: 30, gapBody: 22 });
	if (size.id === 'portrait') return floor({ padX: 80, padTop: 88, padBottom: 52, mark: 38, url: 20, footerGap: 24, ruleGap: 40, headline: 112, headlineLines: 5, body: 28, bodyLines: 4, bodyLeading: 1.4, eyebrow: 17, gapTag: 34, gapBody: 24 });
	if (size.id === 'landscape') return floor({ padX: 64, padTop: 52, padBottom: 34, mark: 28, url: 16, footerGap: 18, ruleGap: 26, headline: 64, headlineLines: 3, body: 22, bodyLines: 2, bodyLeading: 1.35, eyebrow: 14, gapTag: 20, gapBody: 16 });
	if (size.id === 'og') return floor({ padX: 64, padTop: 54, padBottom: 34, mark: 28, url: 16, footerGap: 18, ruleGap: 28, headline: 72, headlineLines: 3, body: 22, bodyLines: 3, bodyLeading: 1.4, eyebrow: 15, gapTag: 24, gapBody: 18 });
	const { w, h } = size.frame;
	const ratio = w / h;
	const u = unitOf(w, h);
	const ultra = ratio >= 3.9;
	const tall = h / w > 1.15;
	const k = ratio >= 2.4 ? Math.min(1, h / (500 * u)) : 1;
	const n = (v: number) => Math.round(v * u * k);
	const pad = ultra ? Math.round(h * 0.14) : n(54);
	return floor({ padX: Math.round((ratio >= 2.4 ? 44 : 64) * u), padTop: pad, padBottom: ultra ? pad : n(34), mark: n(28), url: n(16), footerGap: n(18), ruleGap: n(ratio >= 2.4 ? 18 : 28), headline: n(tall ? 92 : ratio >= 2.4 ? 62 : 72), headlineLines: tall ? 6 : 3, body: n(tall ? 23 : 22), bodyLines: tall ? 4 : 3, bodyLeading: 1.4, eyebrow: n(15), gapTag: n(ratio >= 2.4 ? 16 : 24), gapBody: n(ratio >= 2.4 ? 12 : 18) });
}

function linesBox(face: Face, lines: string[], size: number, leading: number, tracking: number, fill: string, stop: string): Box {
	const height = blockHeight(face, lines, size, leading);
	return {
		height,
		draw: (x, y) => {
			let baseline = y + capHeight(face, size);
			return lines
				.map((line, i) => {
					const painted = paintLine(face, line, x, baseline, size, tracking, fill, i === lines.length - 1 ? stop : fill);
					baseline += size * leading;
					return painted;
				})
				.join('');
		},
	};
}

function paintLine(face: Face, line: string, x: number, baseline: number, size: number, tracking: number, fill: string, stop: string): string {
	// The stop stays in the same run, so its side bearing matches the heading on the site. A closing quote can follow it.
	const parts = stop === fill ? undefined : splitStop(line);
	if (parts) {
		const ls = tracking ? ` letter-spacing="${fmt(tracking * size)}"` : '';
		return `<text x="${fmt(x)}" y="${fmt(baseline)}" fill="${fill}" ${familyAttr(face)} font-size="${fmt(size)}" font-weight="${face.weight}"${ls}>${esc(parts.body)}<tspan fill="${stop}">.</tspan>${esc(parts.tail)}</text>`;
	}
	return textAt(face, line, x, baseline, size, tracking, fill);
}

/** A final full stop, not an ellipsis, with any closing quotes after it. */
function splitStop(line: string): { body: string; tail: string } | undefined {
	const m = /^(.*)\.((?:['"”’])*)$/.exec(line);
	if (!m || m[1].endsWith('.')) return undefined;
	return { body: m[1], tail: m[2] };
}

function gap(height: number): Box {
	return { height, draw: () => '' };
}

function paint(boxes: Box[], x: number, top: number): string {
	let y = top;
	return boxes
		.map((b) => {
			const svg = b.draw(x, y);
			b.report?.(x, y);
			y += b.height;
			return svg;
		})
		.join('');
}

let markCache: { viewBox: string; body: string; vw: number; vh: number } | undefined;

function markAt(fill: string, x: number, y: number, height: number): string {
	markCache ??= readMark();
	const width = height * (markCache.vw / markCache.vh);
	const body = markCache.body.replaceAll('__FILL__', fill);
	return `<svg x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" viewBox="${markCache.viewBox}">${body}</svg>`;
}

function readMark(): { viewBox: string; body: string; vw: number; vh: number } {
	const raw = readFileSync(join(packageRoot, 'brand', 'logo', 'svg', 'mark.svg'), 'utf8');
	const viewBox = /viewBox="([^"]+)"/.exec(raw)?.[1] ?? '0 0 149 134';
	const parts = viewBox.split(/[\s,]+/).map(Number);
	const body = raw
		.replace(/<\?xml[\s\S]*?\?>/g, '')
		.replace(/<svg[^>]*>/, '')
		.replace(/<\/svg>\s*$/, '')
		.replace(/fill="#[0-9A-Fa-f]{3,8}"/g, 'fill="__FILL__"');
	return { viewBox, body, vw: parts[2] || 149, vh: parts[3] || 134 };
}

function document(size: SizeSpec, palette: Theme, loaded: Faces, body: string): string {
	const css = [loaded.heading, loaded.text, loaded.medium]
		.filter((face, i, all) => all.findIndex((f) => f.family === face.family && f.weight === face.weight) === i)
		.map((face) => `@font-face{font-family:"${face.family}";font-weight:${face.weight};font-style:normal;src:url("data:font/woff2;base64,${face.woff2.toString('base64')}") format("woff2");}`)
		.join('');
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size.w}" height="${size.h}" viewBox="0 0 ${size.w} ${size.h}">
<defs><style type="text/css"><![CDATA[${css}]]></style></defs>
${rect(0, 0, size.w, size.h, palette.bg)}
${body}
</svg>
`;
}

function familyAttr(face: Face): string {
	// Quoted, so a family with a space (the heading face) is one name. Unquoted, a browser reads it as two families and skips the embedded face.
	return `font-family="'${esc(face.family)}'"`;
}

function textAt(face: Face, text: string, x: number, y: number, size: number, tracking: number, fill: string): string {
	const ls = tracking ? ` letter-spacing="${fmt(tracking * size)}"` : '';
	return `<text x="${fmt(x)}" y="${fmt(y)}" fill="${fill}" ${familyAttr(face)} font-size="${fmt(size)}" font-weight="${face.weight}"${ls}>${esc(text)}</text>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string, stroke?: string): string {
	const s = stroke ? ` fill="${fill}" stroke="${stroke}" stroke-width="1"` : ` fill="${fill}"`;
	return `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}"${s} shape-rendering="crispEdges"/>`;
}

function siteHost(site: string): string {
	try {
		return new URL(site).host.replace(/^www\./, '');
	} catch {
		return site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
	}
}

function fmt(n: number): string {
	const r = Math.round(n * 100) / 100;
	return Object.is(r, -0) ? '0' : String(r);
}

function esc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
