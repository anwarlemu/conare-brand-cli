import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { color, font, rgbOf, surface, toPng, toSvg, type Ctx } from './canvas.js';
import { pick } from './io.js';
import { colorsOf, compose, drawDesign, imageDoc, type Design, type Layout, type Pic } from './og.js';

// Deck slides at 1920 by 1080 (brand/assets/deck.json), each drawn on one of the share-image layouts at slide size.

export type SlideType = 'cover' | 'section' | 'statement' | 'bullets' | 'stat' | 'quote' | 'image' | 'end';
type DeckDoc = { width: number; height: number; slides: Record<SlideType, { name: string; layout: Layout; description: string; slots: Record<string, string> }> };

let doc: DeckDoc | undefined;
export const deckDoc = (): DeckDoc => (doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'deck.json'), 'utf8')) as DeckDoc);
export const slideTypes = () => Object.keys(deckDoc().slides) as SlideType[];

export type Slide = { type: string; theme?: string; picture?: Pic | null } & Record<string, unknown>;

export function deckCatalog() {
	const d = deckDoc();
	return {
		size: { width: d.width, height: d.height },
		slides: slideTypes().map((id) => ({ id, name: d.slides[id].name, layout: d.slides[id].layout, theme: imageDoc().templates[d.slides[id].layout]!.theme, description: d.slides[id].description, slots: d.slides[id].slots })),
		themes: Object.keys(imageDoc().themes),
	};
}

/** The slots a slide takes, filled with its opening copy where it was given none. Unknown slots throw. */
export function slotsFor(type: SlideType, given: Record<string, unknown>): Record<string, string> {
	const def = deckDoc().slides[type].slots;
	const out: Record<string, string> = { ...def };
	for (const [k, v] of Object.entries(given)) {
		if (['type', 'theme', 'picture'].includes(k)) continue;
		if (!(k in def)) throw new Error(`A ${type} slide does not take "${k}". It takes ${Object.keys(def).map((s) => `"${s}"`).join(', ')}.`);
		if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out[k] = v.join(' | ');
		else if (typeof v === 'string') out[k] = v;
		else throw new Error(`A ${type} slide's "${k}" takes text.`);
	}
	return out;
}

const W = 1920;
const H = 1080;

function designFor(type: SlideType, s: Record<string, string>, theme: string | undefined): Design {
	const layout = deckDoc().slides[type].layout;
	const base = { template: layout, w: W, h: H, theme };
	switch (type) {
		case 'cover':
			return compose({ ...base, headline: s.title, body: s.body, badgeText: s.eyebrow, badge: s.eyebrow ? 'label' : 'none' });
		case 'section':
			return compose({ ...base, headline: s.title, body: '', badge: s.number ? 'label' : 'none', badgeText: s.number, extra: { badgeScale: 72 } });
		case 'statement':
			return compose({ ...base, headline: s.title, body: '', badge: s.eyebrow ? 'dot' : 'none', badgeText: s.eyebrow });
		case 'bullets':
			return compose({ ...base, headline: s.title, body: '', badge: 'none', extra: { textMiddle: false, textY: 0.2, textFit: 0, textWidth: 0.8 } });
		case 'stat':
			return compose({ ...base, headline: s.stat, body: s.title, badge: 'none', extra: { textFit: 0.62, bodyScale: 62, bodyWidth: 0.46, bodyAlpha: 86 } });
		case 'quote':
			return compose({ ...base, headline: s.quote, body: '', badge: s.attribution ? 'dot' : 'none', badgeText: s.attribution, extra: { badgeFont: 'mono', badgeWeight: 400, badgeTracking: 80, badgeScale: 74, textY: 0.2, badgeGap: 34 } });
		case 'image':
			return compose({ ...base, headline: s.title, body: s.body, badge: s.eyebrow ? 'label' : 'none', badgeText: s.eyebrow });
		case 'end':
			return compose({ ...base, headline: s.title, body: s.url, badge: 'none', extra: { logoWord: true, logoSize: 64, logoY: 0.24, bodyAlpha: 100 } });
	}
}

/* The points under a bullets title: the brand's small red square, then the words in the text face. */
function drawPoints(ctx: Ctx, d: Design, top: number, items: string[]) {
	const C = colorsOf(d);
	const x = d.textX * W;
	const size = 40;
	const lh = size * 1.4;
	const maxW = W * 0.72;
	let y = top;
	for (const item of items) {
		ctx.font = font('text', 400, size);
		ctx.letterSpacing = '0px';
		const words = item.split(/\s+/);
		const lines: string[] = [];
		let cur = '';
		for (const w of words) {
			const next = cur ? `${cur} ${w}` : w;
			if (cur && ctx.measureText(next).width > maxW) {
				lines.push(cur);
				cur = w;
			} else cur = next;
		}
		if (cur) lines.push(cur);
		ctx.fillStyle = C.hi || color(imageDoc().accent);
		ctx.fillRect(x, y + lh / 2 - 7, 14, 14);
		ctx.fillStyle = C.ink;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'left';
		lines.forEach((l, i) => ctx.fillText(l, x + 44, y + lh / 2 + i * lh));
		y += lines.length * lh + 26;
	}
}

async function drawSlide(ctx: Ctx, type: SlideType, s: Record<string, string>, theme: string | undefined, pic: Pic | null) {
	const d = designFor(type, s, theme);
	const r = await drawDesign(ctx, d, pic);
	if (type === 'bullets') drawPoints(ctx, d, r.text.y + r.text.h + 64, (s.items ?? '').split('|').map((x) => x.trim()).filter(Boolean));
}

export type SlideRender = { png?: Buffer; svg?: string; rgb?: Buffer; width: number; height: number };

export async function renderSlide(slide: Slide, opts: { png?: boolean; svg?: boolean } = { png: true }): Promise<SlideRender> {
	const type = pick('slide type', slide.type, slideTypes()) as SlideType;
	const s = slotsFor(type, slide);
	if (type === 'bullets') {
		const n = (s.items ?? '').split('|').filter((x) => x.trim()).length;
		if (n > 6) throw new Error(`A bullets slide holds up to 6 points; it was given ${n}. Split it.`);
	}
	const theme = slide.theme ? pick('theme', slide.theme, Object.keys(imageDoc().themes)) : undefined;
	const out: SlideRender = { width: W, height: H };
	if (opts.png !== false) {
		const sf = surface(W, H);
		await drawSlide(sf.ctx, type, s, theme, slide.picture ?? null);
		out.png = toPng(sf, { opaque: true });
		out.rgb = rgbOf(sf).rgb;
	}
	if (opts.svg) {
		const sf = surface(W, H, { svg: true });
		await drawSlide(sf.ctx, type, s, theme, slide.picture ?? null);
		out.svg = toSvg(sf);
	}
	return out;
}
