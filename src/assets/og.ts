import type { Canvas, Image } from '@napi-rs/canvas';
import type { DrawnLayer, LayerEdit, Rect } from '../design/types.js';
import { artImage, logoDoc, markPath, wordmarkPath } from './art.js';
import { blend, color, contrast, font, scratch, surface, toPng, toSvg, rgbOf, type Ctx } from './canvas.js';
import { CopyError, roleFor, type FaceRole } from './glyphs.js';
import { BADGES, customSize, imageDoc, largeType, LAYOUTS, logoFloor, sizeIds, sizeOf, sizesFor, smallFloor, specFor, unitOf, type Align, type BadgeStyle, type Layout, type Size, type Spec } from './layouts.js';
import { duration, mix, progress, settle } from './motion.js';
import { drawPanel, PANEL_H, PANEL_W } from './panel.js';
import { asTyped, plain, readBack, setLines, type Line } from './words.js';

// The share images, ported from the agd-playground posts tool (draw.ts and app.ts): a ground, the perspective room,
// the wordmark tile, the hollow wordmark, hatching, guides, a border, the product window, the words with their badge,
// the lockup, a footer and stacks of documents. A design is planned first (every box, so nothing overlaps, nothing is
// cut and every word is set whole), then painted from the plan; the layers it reports are what the painting drew.

export { BADGES, imageDoc, LAYOUTS, sizeIds, sizeOf, sizesFor, unitOf, customSize };
export type { BadgeStyle, Layout, Size };
export type Pic = { img: Image | Canvas; w: number; h: number };
export const APP_W = PANEL_W;
export const APP_H = PANEL_H;

export type Design = {
	template: Layout;
	size: Size;
	w: number;
	h: number;
	theme: string;
	highlight: string;
	badge: BadgeStyle;
	badgeText: string;
	headline: string;
	/** The headline as it was passed (without the stop the brand ends it on). */
	headlineAsked: string;
	body: string;
	credit: string;
	note: string;
	page: string;
	partner: string;
	address: string;
	items: string[];
	sample: boolean;
	seed: number;
	layers: Record<string, LayerEdit>;
	spec: Spec;
};

export type Compose = {
	template: Layout; size?: Size; w?: number; h?: number; theme?: string; headline?: string; body?: string; badge?: BadgeStyle; badgeText?: string; highlight?: string;
	partner?: string; credit?: string; note?: string; page?: string; items?: string[]; sample?: boolean; seed?: number; layers?: Record<string, LayerEdit>; spec?: Partial<Spec>;
	/** Deck slides set their own rules on what a layout must be given. */
	lenient?: boolean;
};

const clean = (s: string | undefined) => (s ?? '').replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).join('\n').trim();

/** The slots a layout can draw. */
export function slotsOf(t: Layout): string[] {
	if (t === 'avatar') return [];
	const logo = t === 'hero' || t === 'brief' || t === 'card' || t === 'announce' || t === 'partner';
	return ['headline', 'body', 'badge', 'credit', 'note', 'page', ...(logo ? ['partner'] : [])];
}

/** A design: the layout at the size with only the copy it was given (its sample copy when `sample`). */
export function compose(o: Compose): Design {
	const D = imageDoc();
	const t = D.templates[o.template]!;
	const size = o.size ?? sizeOf(`${o.w}x${o.h}`)!;
	const ok = sizesFor(o.template);
	if ((sizeIds().includes(size.id) || o.template === 'avatar') && !ok.includes(size.id)) throw new Error(`${o.template} does not draw at ${size.id}. ${o.template === 'avatar' ? 'It is the profile picture: use --size avatar.' : `At ${size.id}, use ${LAYOUTS.filter((l) => sizesFor(l).includes(size.id)).join(', ')}.`}`);
	const s = o.sample ? t.sample : {};
	const theme = o.theme ?? t.theme;
	const given = { headline: o.headline, body: o.body, badge: o.badgeText, credit: o.credit, note: o.note, page: o.page, partner: o.partner };
	const slots = slotsOf(o.template);
	for (const [k, v] of Object.entries(given)) {
		if (v === undefined || !clean(v) || slots.includes(k)) continue;
		throw new Error(`${o.template} does not draw ${k === 'badge' ? 'a badge' : k === 'headline' || k === 'body' ? `a ${k}` : `--${k}`}.${slots.length ? ` It draws ${slots.join(', ')}.` : ' It is the mark alone.'}`);
	}
	const pickSlot = (k: 'headline' | 'body' | 'badge' | 'partner' | 'note') => clean(given[k] ?? s[k]);
	const headline = pickSlot('headline');
	const partner = pickSlot('partner');
	if (o.template !== 'avatar' && !headline && !(o.template === 'partner' && partner) && !o.lenient) throw new CopyError(`${o.template} needs a headline (--headline "..."), or --sample for its sample copy.`);
	const badgeText = pickSlot('badge');
	const frame = size.frame;
	const spec: Spec = { ...specFor(o.template, frame.w, frame.h), ...o.spec };
	const d: Design = {
		template: o.template, size, w: size.w, h: size.h, theme, highlight: o.highlight ?? D.themes[theme]?.onAccent?.highlight ?? 'red',
		badge: o.badge ?? (t.badge === 'none' ? 'label' : t.badge), badgeText, headline: headline ? emphasise(headline) : '', headlineAsked: headline, body: pickSlot('body'), credit: clean(o.credit),
		note: pickSlot('note'), page: clean(o.page), partner, address: D.address, items: (o.items ?? []).map(clean).filter(Boolean), sample: o.sample === true, seed: o.seed ?? 0, layers: o.layers ?? {}, spec,
	};
	if (d.note || d.page) spec.foot = true;
	applyEdits(d);
	return d;
}

/* The site's headlines end on a full stop, drawn in the highlight color. */
export function emphasise(s: string) {
	const t = s.replace(/\s+$/, '');
	if (/[\p{L}\p{N})”’"'*]$/u.test(t) && !/[.!?…:]["'”’)*]*$/u.test(t)) return `${t}.`;
	return t;
}

/* ------------------------------------------------------- layer edits */

const CAN: Record<string, DrawnLayer['can']> = {
	logo: { move: true, scale: [0.6, 2.4], anchors: ['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right'] },
	headline: { move: true, scale: [0.5, 2], align: true, anchors: ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'] },
	body: { move: true, scale: [0.6, 1.8], hide: true },
	badge: { move: true, scale: [0.6, 2], hide: true },
	credit: { move: true, scale: [0.8, 2], hide: true },
	items: { scale: [0.7, 1.4] },
	partner: {},
	note: { hide: true },
	page: { hide: true },
	address: { hide: true },
	rule: { hide: true },
	window: { move: true, scale: [0.5, 1.2], hide: true },
	picture: { move: true, scale: [0.5, 1.2] },
	art: { move: true, scale: [0.4, 1.8], hide: true },
	room: { hide: true },
	guides: { hide: true },
	border: { hide: true },
	panel: { hide: true },
	pattern: { hide: true },
	wordmark: { hide: true },
	floor: { hide: true },
};

const AVATAR_CAN: DrawnLayer['can'] = { scale: [0.6, 1.4] };
/** Layouts whose words may be placed anywhere; in the others the window, the panel or the floor says where they go. */
const FREE_WORDS = new Set<Layout>(['hero', 'brief', 'room', 'announce', 'card', 'partner']);
function canOf(t: Layout, id: string): DrawnLayer['can'] {
	if (t === 'avatar') return AVATAR_CAN;
	const c = CAN[id] ?? {};
	return id === 'headline' && !FREE_WORDS.has(t) ? { move: c.move, scale: c.scale, align: c.align } : c;
}

/** The layers a layout can draw and what each can do (the drawn ones depend on the copy and the size). */
export function layersOf(t: Layout): { id: string; can: DrawnLayer['can'] }[] {
	const s = specFor(t, 1200, t === 'avatar' ? 1200 : 630);
	const ids = t === 'avatar' ? ['logo'] : [
		...(s.logo ? ['logo'] : []), 'headline', 'body', 'badge', 'credit', ...(slotsOf(t).includes('partner') ? ['partner'] : []), 'note', 'page', 'address', 'rule',
		...(s.window ? ['window', 'picture'] : []), ...(s.stacks ? ['art'] : []), ...(s.room ? ['room'] : []), ...(s.guides !== null ? ['guides'] : []), ...(s.border ? ['border'] : []),
		...(s.pattern ? ['pattern'] : []), ...(s.pattern === 'panel' ? ['panel'] : []), ...(s.wordmark ? ['wordmark'] : []), ...(s.floor !== null ? ['floor'] : []),
	];
	return ids.map((id) => ({ id, can: canOf(t, id) }));
}

/* Checks each edit against what its layer can do, and turns the ones that change the layout (alignment, anchors). */
function applyEdits(d: Design) {
	const known = layersOf(d.template);
	for (const [id, e] of Object.entries(d.layers)) {
		const l = known.find((k) => k.id === id) ?? (id === 'items' && d.items.length ? { id, can: CAN.items! } : undefined);
		if (!l) throw new Error(`${d.template} has no "${id}" layer. It has ${known.map((k) => k.id).join(', ')}.`);
		const can = l.can;
		if ((e.dx || e.dy) && !can.move) throw new Error(`The ${id} of ${d.template} stays where the layout puts it.`);
		if (e.scale !== undefined && e.scale !== 1) {
			if (!can.scale) throw new Error(`The ${id} of ${d.template} does not take a scale.`);
			if (e.scale < can.scale[0] || e.scale > can.scale[1]) throw new Error(`The ${id} scales from ${can.scale[0]} to ${can.scale[1]}, not ${e.scale}.`);
		}
		if (e.align && !can.align) throw new Error(`The ${id} of ${d.template} has no alignment of its own.`);
		if (e.hidden && !can.hide) throw new Error(`The ${id} cannot be hidden${id === 'logo' ? ': an image without the logo is not the brand\'s' : ''}.`);
		if (e.anchor && !can.anchors?.includes(e.anchor)) throw new Error(`The ${id} of ${d.template} does not take an anchor${can.anchors ? ` of ${e.anchor}; it takes ${can.anchors.join(', ')}` : ''}.`);
	}
	const h = d.layers.headline;
	if (h?.anchor) {
		d.spec.align = h.anchor.includes('left') ? 'left' : h.anchor.includes('right') ? 'right' : 'center';
		d.spec.valign = h.anchor.startsWith('top') ? 'top' : h.anchor.startsWith('bottom') ? 'bottom' : 'middle';
	}
	if (h?.align) d.spec.align = h.align;
	if (d.layers.logo?.anchor && d.spec.logo) d.spec.logo = { ...d.spec.logo, at: d.layers.logo.anchor };
}

const scaleOf = (d: Design, id: string) => d.layers[id]?.scale ?? 1;
const hidden = (d: Design, id: string) => d.layers[id]?.hidden === true;
const offset = (d: Design, id: string) => ({ x: (d.layers[id]?.dx ?? 0) * d.w, y: (d.layers[id]?.dy ?? 0) * d.h });

/* ----------------------------------------------------------- motion */

/** A frame of the animated version: `t` seconds in, `u` the frame's unit (settle distances grow with it). */
export type Motion = { t: number; u: number };

/* When each part comes in, in seconds: the hero's order (the label, the headline letters, the line, then the
   window and the rest), its 60ms settle stagger and the windows' later arrival. */
const T = { logo: 0, badge: 0.06, head: 0.18, body: 0.42, window: 0.5, stickers: 0.62, foot: 0.74 };

/** When the last headline letter has settled, given each line's length in letters. */
function revealEnd(lineLengths: number[]): number {
	let end = 0;
	lineLengths.forEach((n, li) => {
		end = Math.max(end, T.head + 0.1 * li + 0.04 * Math.max(0, n - 1) + duration('enter') + duration('reveal'));
	});
	return end;
}

async function settled(ctx: Ctx, mo: Motion | undefined, delay: number, draw: () => void | Promise<void>) {
	if (!mo) return draw();
	const st = settle(mo.t, delay);
	ctx.save();
	ctx.globalAlpha *= st.alpha;
	ctx.translate(0, st.dy * mo.u);
	await draw();
	ctx.restore();
}

/* ----------------------------------------------------------- colors */

export function colorsOf(d: Pick<Design, 'theme' | 'highlight'>) {
	const D = imageDoc();
	const t = D.themes[d.theme]!;
	const bg = color(t.bg);
	let hiName = D.highlights[d.highlight] ?? '';
	if (hiName && contrast(color(hiName), bg) < 3) {
		/* A highlight the ground hides: the nearest brand color that reads, or a refusal. */
		const alt = D.highlightAlt[d.highlight];
		if (alt && contrast(color(alt), bg) >= 3) hiName = alt;
		else throw new Error(`The ${d.highlight} highlight does not read on the ${d.theme} theme. Use ${Object.keys(D.highlights).filter((k) => !D.highlights[k] || contrast(color(D.highlights[k]!), bg) >= 3 || (D.highlightAlt[k] && contrast(color(D.highlightAlt[k]!), bg) >= 3)).join(', ')}.`);
	}
	return { bg, ink: color(t.ink), muted: color(t.muted), line: color(t.line), tile: color(t.tile), border: color(t.border), hi: hiName ? color(hiName) : color(t.ink), room: color(t.room), dark: t.dark, tileAlpha: t.tileAlpha };
}
const tone = (name: string) => color(imageDoc().tones[name] ?? imageDoc().tones.light!);
const accent = () => color(imageDoc().accent);

/** The smallest type in a color on a ground at a size: the legible floor, and large type where the pair is under 4.5. */
function floorFor(d: Design, ink: string, ground: string) {
	const small = smallFloor(d.w, d.size.shown);
	return contrast(ink, ground) >= 4.5 ? small : Math.max(small, largeType(d.w));
}

/* A chip's colors at a type size: the accent under large type, the deeper red under small (off-white on it passes 4.5). */
function chipColors(d: Design, fs: number) {
	const D = imageDoc();
	const on = D.themes[d.theme]?.onAccent;
	const C = colorsOf(d);
	const large = fs >= largeType(d.w);
	const red = color(large ? D.accent : D.accentSmall);
	if (d.badge === 'solid') return { fill: on?.badgeFill ? color(on.badgeFill) : C.ink, ink: on?.badgeInk ? red : C.bg };
	if (d.badge === 'label') return on?.badgeFill ? { fill: color(on.badgeFill), ink: red } : { fill: red, ink: tone('white') };
	if (d.badge === 'pill') return { fill: blend(color(C.dark ? 'off-white/0.14' : 'off-black/0.04'), C.bg), ink: C.ink };
	return { fill: '', ink: C.ink };
}

/* --------------------------------------------------------- geometry */

const inset = (r: Rect, n: number): Rect => ({ x: r.x + n, y: r.y + n, w: r.w - 2 * n, h: r.h - 2 * n });
const grow = (r: Rect, n: number): Rect => inset(r, -n);
const right = (r: Rect) => r.x + r.w;
const bottom = (r: Rect) => r.y + r.h;
const meet = (a: Rect, b: Rect) => a.x < right(b) && right(a) > b.x && a.y < bottom(b) && bottom(a) > b.y;
const intersect = (a: Rect, b: Rect): Rect => {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	return { x, y, w: Math.max(0, Math.min(right(a), right(b)) - x), h: Math.max(0, Math.min(bottom(a), bottom(b)) - y) };
};
const union = (list: Rect[]): Rect => {
	const x = Math.min(...list.map((r) => r.x));
	const y = Math.min(...list.map((r) => r.y));
	return { x, y, w: Math.max(...list.map(right)) - x, h: Math.max(...list.map(bottom)) - y };
};

/* ------------------------------------------------------------ words */

type BadgeBox = { w: number; h: number; fs: number; role: FaceRole; text: string };
type Block = {
	size: number; w: number; h: number;
	logo?: { y: number };
	badge?: BadgeBox & { y: number };
	head?: { y: number; lines: Line[]; role: FaceRole };
	body?: { y: number; lines: Line[]; fs: number; role: FaceRole };
	items?: { y: number; fs: number; role: FaceRole; rows: { y: number; lines: Line[] }[]; lead: number };
	credit?: { y: number; lines: Line[]; fs: number; role: FaceRole };
};

function badgeBox(ctx: Ctx, d: Design, fs: number): BadgeBox | null {
	const t = d.badgeText.trim();
	if (d.badge === 'none' || !t || hidden(d, 'badge')) return null;
	const text = d.badge === 'label' || d.badge === 'dot' ? t.toUpperCase() : t;
	const role = roleFor(d.spec.badgeFont, text, 'badge');
	const track = (d.spec.badgeTracking / 1000) * fs;
	ctx.font = font(role, d.spec.badgeWeight, fs);
	ctx.letterSpacing = `${track}px`;
	const tw = ctx.measureText(text).width - (track > 0 ? track : 0);
	ctx.letterSpacing = '0px';
	if (d.badge === 'solid') return { w: tw + fs * 2.16, h: fs * 2.46, fs, role, text };
	if (d.badge === 'pill') return { w: tw + fs * 2.4, h: fs * 1.9, fs, role, text };
	if (d.badge === 'dot') return { w: fs * 1.15 + tw, h: fs * 1.2857, fs, role, text };
	return { w: tw + fs * 1.24, h: fs * 1.75, fs, role, text };
}

/* A layer's type size: its own, never under its floor, times the edit (an edit under the floor is an error). */
function edited(d: Design, id: string, base: number, floor: number): number {
	const k = scaleOf(d, id);
	const size = Math.max(base, floor) * k;
	if (size < floor - 0.01) throw new CopyError(`The ${id} at scale ${k} does not fit ${d.size.id}: it would be ${Math.round(size)} px, and reads from ${Math.ceil(floor)} px up.`);
	return size;
}

/* The badge at its size, or smaller down to its floor to stay inside `max`; too long for that is an error. */
function fitBadge(ctx: Ctx, d: Design, base: number, max: number): BadgeBox | null {
	if (!badgeBox(ctx, d, 10)) return null;
	const C = chipColors(d, base);
	const floor = floorFor(d, C.ink, C.fill || colorsOf(d).bg);
	const k = scaleOf(d, 'badge');
	let size = edited(d, 'badge', base, floor);
	for (;;) {
		const b = badgeBox(ctx, d, size)!;
		if (b.w <= max) return b;
		if (size <= floor || k > 1) {
			const n = Math.max(1, Math.floor((d.badgeText.length * max) / b.w) - 1);
			throw new CopyError(k > 1 ? `The badge at scale ${k} does not fit ${d.template} at ${d.size.id}.` : `The badge "${d.badgeText}" does not fit ${d.template} at ${d.size.id}. Shorten it to about ${n} characters.`);
		}
		size = Math.max(floor, size * 0.96);
	}
}

const headFont = (ctx: Ctx, d: Design, role: FaceRole, size: number) => {
	ctx.font = font(role, 400, size);
	ctx.letterSpacing = `${(d.spec.tracking / 1000) * size}px`;
};

/* The words at a headline size, in lines, stacked from 0. */
function setBlock(ctx: Ctx, d: Design, size: number, width: number, maxW: number, o: { breakLong: boolean; balance: boolean; logoH: number }): Block {
	const s = d.spec;
	const C = colorsOf(d);
	const b: Block = { size, w: 0, h: 0 };
	let y = 0;
	const wide = (w: number) => (b.w = Math.max(b.w, w));
	if (o.logoH > 0) {
		b.logo = { y: 0 };
		y += o.logoH + Math.max(size * 0.5, o.logoH * 0.55);
	}
	if (s.badgeAt === 'words') {
		const bb = fitBadge(ctx, d, size * s.badgeRatio, maxW);
		if (bb) {
			b.badge = { ...bb, y };
			wide(bb.w);
			y += bb.h + size * (s.badgeGap / 100);
		}
	}
	if (d.headline) {
		const role = roleFor('display', plain(d.headline), 'headline');
		headFont(ctx, d, role, size);
		const lines = setLines(ctx, d.headline, width, { breakLong: o.breakLong, balance: o.balance });
		ctx.letterSpacing = '0px';
		b.head = { y, lines, role };
		for (const l of lines) wide(l.w);
		y += lines.length * size * s.leading;
	}
	const bodyMax = s.bodyWidth > 0 ? Math.min(maxW, s.bodyWidth * d.size.frame.w) : Math.min(maxW, Math.max(width, maxW * 0.6));
	if (d.body && !hidden(d, 'body')) {
		const role = roleFor('text', d.body.replaceAll('*', ''), 'body');
		const fs = edited(d, 'body', size * s.bodyRatio, floorFor(d, C.muted, C.bg));
		y += size * (s.bodyGap / 100);
		ctx.font = font(role, 400, fs);
		const lines = setLines(ctx, d.body, bodyMax, { breakLong: true, balance: o.balance });
		b.body = { y, lines, fs, role };
		for (const l of lines) wide(l.w);
		y += lines.length * fs * s.bodyLeading;
	}
	if (d.items.length) {
		const role = roleFor('text', d.items.join(' '), 'points');
		const fs = edited(d, 'items', size * 0.42, floorFor(d, C.ink, C.bg));
		const lead = fs * 1.1;
		y += size * 0.56;
		ctx.font = font(role, 400, fs);
		const rows = d.items.map((it) => {
			const lines = setLines(ctx, it, maxW * 0.92 - lead, { breakLong: true, balance: false });
			const row = { y, lines };
			for (const l of lines) wide(l.w + lead);
			y += lines.length * fs * 1.36 + fs * 0.6;
			return row;
		});
		y -= fs * 0.6;
		b.items = { y: rows[0]!.y, fs, role, rows, lead };
	}
	if (d.credit && !hidden(d, 'credit')) {
		const role = roleFor('text', d.credit, 'credit');
		const fs = edited(d, 'credit', size * 0.2, floorFor(d, C.muted, C.bg));
		y += size * (b.body ? 0.22 : 0.3);
		ctx.font = font(role, 500, fs);
		const lines = setLines(ctx, d.credit, maxW, { breakLong: true });
		b.credit = { y, lines, fs, role };
		for (const l of lines) wide(l.w);
		y += lines.length * fs * 1.2;
	}
	b.h = y;
	return b;
}

const headFloor = (d: Design) => Math.max(largeType(d.w), smallFloor(d.w, d.size.shown) * 1.5);

/* The largest setting of the words that fits a box: at the layout's width, then (a long headline) the whole box. */
function fitWords(ctx: Ctx, d: Design, box: { w: number; h: number }, logoH: number): Block {
	const s = d.spec;
	const floor = headFloor(d);
	const nominal = Math.max(s.size, floor);
	const narrow = Math.min(box.w, s.width * d.size.frame.w);
	const fits = (b: Block, w: number) => b.h <= box.h + 0.5 && (b.head?.lines.every((l) => l.w <= w + 0.5) ?? true) && b.w <= box.w + 0.5;
	const search = (w: number): Block | null => {
		for (let size = nominal; ; size = Math.max(floor, size * 0.97)) {
			const last = size <= floor;
			const b = setBlock(ctx, d, size, w, box.w, { breakLong: last, balance: false, logoH });
			if (fits(b, w)) return b;
			if (last) return null;
		}
	};
	let b = search(narrow);
	let w = narrow;
	if ((!b || b.size < nominal * 0.75) && narrow < box.w - 1) {
		const wider = search(box.w);
		if (wider && (!b || wider.size > b.size)) {
			b = wider;
			w = box.w;
		}
	}
	if (!b) throw tooLong(ctx, d, box, logoH);
	const k = scaleOf(d, 'headline');
	let size = b.size;
	if (k !== 1) {
		size = b.size * k;
		if (size < floor - 0.01) throw new CopyError(`The headline at scale ${k} does not fit ${d.size.id}: it would be ${Math.round(size)} px, and reads from ${Math.ceil(floor)} px up (scale ${r2(floor / b.size)}).`);
		if (k > 1) {
			const tryAt = (n: number): [Block, number] | null => {
				for (const ww of w < box.w - 1 ? [w, box.w] : [w]) {
					const t = setBlock(ctx, d, n, ww, box.w, { breakLong: false, balance: false, logoH });
					if (fits(t, ww)) return [t, ww];
				}
				return null;
			};
			const hit = tryAt(size);
			if (!hit) {
				let max = 1;
				for (let n = k - 0.02; n > 1; n -= 0.02) if (tryAt(b.size * n)) { max = n; break; }
				throw new CopyError(`The headline at scale ${k} does not fit ${d.template} at ${d.size.id}. The largest that does is ${r2(max)}${max <= 1 ? ' (it already fills its place; shorten the words to make them bigger)' : ''}.`);
			}
			w = hit[1];
		}
	}
	const set = setBlock(ctx, d, size, w, box.w, { breakLong: size <= floor + 0.01, balance: true, logoH });
	return fits(set, box.w) ? set : setBlock(ctx, d, size, w, box.w, { breakLong: size <= floor + 0.01, balance: false, logoH });
}

const r2 = (n: number) => Math.floor(n * 100) / 100;

/* What to shorten, and to about how many words, worked out by setting shorter copy in the same box. */
function tooLong(ctx: Ctx, d: Design, box: { w: number; h: number }, logoH: number): CopyError {
	const at = `${d.template} at ${d.size.id}`;
	const fitsWith = (copy: Partial<Design>) => {
		const t = { ...d, ...copy };
		const b = setBlock(ctx, t, headFloor(d), box.w, box.w, { breakLong: true, balance: false, logoH });
		return b.h <= box.h && b.w <= box.w + 0.5;
	};
	const cut = (key: 'headline' | 'body') => {
		const words = plain(d[key]).split(' ');
		for (let n = words.length - 1; n > 0; n--) if (fitsWith({ [key]: words.slice(0, n).join(' ') })) return n;
		return 0;
	};
	if (d.items.length && !fitsWith({ items: d.items.slice(0, 1) })) return new CopyError(`The points do not fit ${at}. Shorten them.`);
	if (d.items.length) {
		for (let n = d.items.length - 1; n > 0; n--) if (fitsWith({ items: d.items.slice(0, n) })) return new CopyError(`The points do not fit ${at}: about ${n} of them do. Shorten or split them.`);
	}
	if (d.body) {
		const n = cut('body');
		if (n) return new CopyError(`The copy does not fit ${at}. Shorten the body to about ${n} words, or the headline.`);
	}
	const h = cut('headline');
	if (h) return new CopyError(`The copy does not fit ${at}. Shorten the headline to about ${h} words${d.body ? ', or drop the body' : ''}.`);
	return new CopyError(`The copy does not fit ${at}. ${d.body ? 'Drop the body' : 'Shorten it'}${d.badgeText ? ' or the badge' : ''}, or use a taller size.`);
}

function baselineIn(ctx: Ctx, lineTop: number, size: number, lh: number) {
	const m = ctx.measureText('Hg');
	const asc = m.fontBoundingBoxAscent || size * 0.9;
	const desc = m.fontBoundingBoxDescent || size * 0.22;
	return lineTop + (size * lh - (asc + desc)) / 2 + asc;
}

/* ------------------------------------------------------------- plan */

type Placed = { rect: Rect };
type LogoPlan = Placed & { k: number; word: boolean; lockup: Rect; partner?: { rect: Rect; fs: number; role: FaceRole; text: string; times: Rect } };
type FootPlan = { y: number; fs: number; rule: Rect | null; parts: { id: 'note' | 'page' | 'address'; text: string; x: number; w: number; align: 'left' | 'right'; role: FaceRole }[] };
type StackPlan = { src: 'stack-tall' | 'stack-wide'; rect: Rect; flip: boolean; pair: number };
export type Plan = {
	content: Rect; block: Block; at: { x: number; y: number }; words: Rect;
	logo: LogoPlan | null; corner: (BadgeBox & Placed) | null; foot: FootPlan | null; window: Rect | null; pic: Pic | null; stacks: StackPlan[];
	wall: Rect | null; panel: Rect | null; wordmark: { rects: Rect[]; k: number } | null; floorY: number | null; border: number;
};

function logoSizes(ctx: Ctx, d: Design, h: number): { w: number; h: number; k: number; lw: number; partner?: { fs: number; role: FaceRole; w: number; gap: number; times: number } } {
	const L = logoDoc();
	const k = h / L.lockup.h;
	const word = d.spec.logo!.word;
	const lw = word ? L.lockup.w * k : L.mark.w * k;
	const p = d.partner;
	if (!p || !word) return { w: lw, h, k, lw };
	const fs = h * 0.72;
	const role = roleFor('display', p, 'partner');
	ctx.font = font(role, 600, fs);
	ctx.letterSpacing = '0px';
	const pw = ctx.measureText(p).width;
	const gap = 26 * k;
	const times = 24 * k;
	return { w: lw + gap * 2 + times + pw, h, k, lw, partner: { fs, role, w: pw, gap, times } };
}

/* The logo's height at a size (never under its legible height), shrunk only so a partner's name fits beside it. */
function logoHeight(ctx: Ctx, d: Design, max: number): number {
	const s = d.spec.logo!;
	const floor = logoFloor(d.w, d.size.shown) * (s.word ? 1 : 1.2);
	const C = colorsOf(d);
	/* A partner's name is set with the logo, so the pair is tall enough for the name to read. */
	const least = d.partner && s.word ? Math.max(floor, floorFor(d, C.ink, C.bg) / 0.72) : floor;
	let h = Math.max(s.h, least) * (d.layers.logo?.scale ?? 1);
	if (h < least - 0.01) throw new CopyError(`The logo at scale ${d.layers.logo!.scale} does not fit ${d.size.id}: it would be ${Math.round(h)} px tall, and reads from ${Math.ceil(least)} px.`);
	while (logoSizes(ctx, d, h).w > max) {
		if (h <= least || (d.layers.logo?.scale ?? 1) > 1) throw new CopyError(d.partner ? `"${d.partner}" does not fit beside the logo in ${d.template} at ${d.size.id}. Shorten the partner's name.` : `The logo${(d.layers.logo?.scale ?? 1) > 1 ? ` at scale ${d.layers.logo!.scale}` : ''} does not fit ${d.template} at ${d.size.id}.`);
		h = Math.max(least, h * 0.96);
	}
	return h;
}

function logoAt(ctx: Ctx, d: Design, h: number, x: number, y: number): LogoPlan {
	const z = logoSizes(ctx, d, h);
	const lockup = { x, y, w: z.lw, h };
	const p = z.partner;
	return {
		rect: { x, y, w: z.w, h }, k: z.k, word: d.spec.logo!.word, lockup,
		partner: p ? { rect: { x: x + z.lw + p.gap * 2 + p.times, y, w: p.w, h }, fs: p.fs, role: p.role, text: d.partner, times: { x: x + z.lw + p.gap, y: y + h / 2 - p.times / 2, w: p.times, h: p.times } } : undefined,
	};
}

/* A box at an anchor of a region, pushed off what the platform covers. */
function anchored(d: Design, at: string, w: number, h: number, region: Rect, gap: number): Rect {
	const x = at.includes('left') ? region.x : at.includes('right') ? right(region) - w : region.x + (region.w - w) / 2;
	const y = at.startsWith('top') ? region.y : at.startsWith('bottom') ? bottom(region) - h : region.y + (region.h - h) / 2;
	const box = { x, y, w, h };
	for (const a of d.size.avoid) {
		if (!meet(box, grow(a, gap / 2))) continue;
		const over = right(a) + gap / 2;
		const up = a.y - gap / 2 - h;
		if (a.x <= region.x && over + w <= right(region)) box.x = over;
		else if (up >= region.y) box.y = up;
		else box.x = a.x - gap / 2 - w;
	}
	return box;
}

/** Every box of a design, worked out before anything is drawn. `own` is whether the picture is the person's (not the stand-in). */
export function planDesign(ctx: Ctx, d: Design, pic: Pic | null, own = Boolean(pic)): Plan {
	const s = d.spec;
	const { w: W, h: H } = d;
	const F = d.size.frame;
	const u = unitOf(F.w, F.h);
	const canvas: Rect = { x: 0, y: 0, w: W, h: H };
	const borderPx = s.border && !hidden(d, 'border') ? s.border.px : 0;
	let content = inset(F, s.margin);
	if (borderPx) content = intersect(content, inset(canvas, borderPx + s.margin * (s.border!.kind === 'solid' ? 0.8 : 0.5)));
	const gap = Math.max(22 * u, smallFloor(W, d.size.shown));
	const plan: Plan = { content, block: { size: 0, w: 0, h: 0 }, at: { x: 0, y: 0 }, words: { x: 0, y: 0, w: 0, h: 0 }, logo: null, corner: null, foot: null, window: null, pic, stacks: [], wall: null, panel: null, wordmark: null, floorY: null, border: borderPx };

	if (d.template === 'avatar') {
		const L = logoDoc();
		const h = s.logo!.h * scaleOf(d, 'logo');
		const w = (L.mark.w * h) / L.mark.h;
		if (Math.hypot(w, h) > Math.min(W, H) * 0.86) throw new CopyError('The mark at that scale would leave the circle a profile picture is cropped to.');
		plan.logo = { rect: { x: (W - w) / 2, y: (H - h) / 2, w, h }, k: h / L.mark.h, word: false, lockup: { x: (W - w) / 2, y: (H - h) / 2, w, h } };
		return plan;
	}

	let zone = { ...content };
	const bandTop = (y: number) => {
		const b = bottom(zone);
		zone.y = Math.max(zone.y, y);
		zone.h = b - zone.y;
	};
	const bandBottom = (y: number) => (zone.h = Math.min(zone.h, y - zone.y));

	/* The footer: a hairline, a note or page number left, the address right. */
	if (s.foot) plan.foot = planFoot(ctx, d, content);
	if (plan.foot) bandBottom((plan.foot.rule?.y ?? plan.foot.y - plan.foot.fs) - gap * 0.8);

	/* The logo where it is anchored (a logo over the words is set with them). */
	const above = s.logo?.at === 'above';
	if (s.logo && !above) {
		const edited = Boolean(d.layers.logo?.anchor);
		const region = edited ? inset(intersect(d.size.safe, borderPx ? inset(canvas, borderPx + 4) : canvas), s.margin) : content;
		const h = logoHeight(ctx, d, region.w * (s.logo.at === 'left' || s.logo.at === 'right' ? 0.45 : 1));
		const z = logoSizes(ctx, d, h);
		const footTop = plan.foot ? (plan.foot.rule?.y ?? plan.foot.y - plan.foot.fs) - gap * 0.7 : bottom(region);
		const r = anchored(d, s.logo.at, z.w, h, s.logo.at.startsWith('top') ? region : { ...region, h: Math.min(bottom(region), footTop) - region.y }, gap);
		const o = offset(d, 'logo');
		const inFrame = meet(r, grow(zone, 2)) || meet(r, content);
		plan.logo = logoAt(ctx, d, h, r.x + o.x, r.y + o.y);
		if (inFrame) {
			if (s.logo.at === 'left') {
				const x = right(r) + Math.max(gap * 1.4, h * 0.3);
				zone = { ...zone, x, w: right(zone) - x };
			} else if (s.logo.at === 'right') zone.w = r.x - Math.max(gap * 1.4, h * 0.3) - zone.x;
			else if (s.logo.at.startsWith('top')) bandTop(bottom(r) + gap * 1.25);
			else if (s.logo.at.startsWith('bottom')) bandBottom(r.y - gap);
		}
	}

	/* A badge in the corner, on the logo's row, opposite it. */
	if (s.badgeAt === 'corner' && d.badgeText && !hidden(d, 'badge') && d.badge !== 'none') {
		const L = plan.logo?.rect;
		const topLogo = L && s.logo && s.logo.at.toString().startsWith('top') ? L : null;
		const onLeft = Boolean(topLogo && s.logo!.at === 'top-right');
		const room = topLogo ? (onLeft ? topLogo.x - content.x : s.logo!.at === 'top' ? right(content) - right(topLogo) : right(content) - right(topLogo)) - gap : content.w;
		const b = fitBadge(ctx, d, s.size * s.badgeRatio, Math.max(gap * 3, room));
		if (b) {
			const rowH = Math.max(topLogo?.h ?? 0, b.h);
			const cy = topLogo ? topLogo.y + topLogo.h / 2 : content.y + rowH / 2;
			const o = offset(d, 'badge');
			const r = { x: (onLeft ? content.x : right(content) - b.w) + o.x, y: Math.max(content.y, cy - b.h / 2) + o.y, w: b.w, h: b.h };
			plan.corner = { ...b, rect: r };
			bandTop(Math.max(bottom(r), topLogo ? bottom(topLogo) : 0) + gap);
		}
	}

	/* What the platform lays over the far corner (a running time): nothing that must be read goes behind it. */
	for (const a of d.size.avoid) if (a.x > W / 2 && meet(zone, a)) bandBottom(a.y - gap * 0.5);

	const aboveH = above && s.logo ? logoHeight(ctx, d, zone.w) : 0;
	const mirror = d.seed > 0 && d.seed % 2 === 1;

	if (s.wordmark && !hidden(d, 'wordmark')) {
		/* As wide as the words, whole, and lower when the words need the height. */
		const L = logoDoc().wordmark;
		const ratio = L.w / L.h;
		const full = { ...zone };
		for (const share of [0.36, 0.24, 0.16]) {
			let n = 1;
			let bh = 0;
			for (; n < 5; n++) {
				bh = content.w / (n * ratio + (n - 1) * 0.5);
				if (bh <= F.h * share) break;
			}
			const bw = bh * ratio;
			const top = bottom(full) - bh;
			plan.wordmark = { rects: Array.from({ length: n }, (_, i) => ({ x: content.x + i * (bw + bh * 0.5), y: top, w: bw, h: bh })), k: bh / L.h };
			zone = { ...full, h: top - gap - full.y };
			try {
				fitWords(ctx, d, zone, aboveH);
				break;
			} catch (e) {
				if (!(e instanceof CopyError) || share === 0.16) throw e;
			}
		}
	}

	if (s.floor !== null && !hidden(d, 'floor')) {
		plan.floorY = bottom(F) - s.floor - (plan.foot ? plan.foot.fs * 3 : 0);
		bandBottom(plan.floorY - gap * 0.7);
	}

	let wordsZone = { ...zone };
	if (s.pattern === 'panel' && !hidden(d, 'panel')) {
		/* The tiled panel and the words share the frame: side by side, or the panel under the words on a tall one. */
		const stacked = F.w / F.h < 1.4;
		if (stacked) {
			let panelTop = 0;
			for (const share of [0.5, 0.56, 0.62, 0.68]) {
				panelTop = content.y + content.h * share;
				wordsZone = { ...zone, h: panelTop - gap - zone.y };
				try {
					fitWords(ctx, d, wordsZone, aboveH);
					break;
				} catch (e) {
					if (!(e instanceof CopyError) || share === 0.68) throw e;
				}
			}
			const top = plan.logo && s.logo?.at.toString().startsWith('bottom') ? plan.logo.rect.y : bottom(zone);
			plan.panel = { x: content.x, y: panelTop, w: content.w, h: Math.min(bottom(zone), top) - panelTop };
		} else {
			const leftBar = d.size.avoid.some((a) => a.x === 0) && F.x > 0;
			const pw = Math.min(content.w * 0.46, (2 * 40 * u * 9) * 1.1);
			const py = plan.foot ? { y: content.y, h: zone.y + zone.h - content.y } : { y: content.y, h: content.h };
			if (leftBar) {
				const x = Math.min(20, F.x) + s.margin * 0.5;
				plan.panel = { x, ...py, w: content.x + pw * 0.86 - x };
				wordsZone = { ...zone, x: right(plan.panel) + gap * 1.6, w: right(zone) - right(plan.panel) - gap * 1.6 };
				if (plan.logo && !d.layers.logo?.anchor) plan.logo = logoAt(ctx, d, plan.logo.rect.h, wordsZone.x, plan.logo.rect.y);
			} else if (mirror) {
				plan.panel = { x: content.x, ...py, w: pw };
				wordsZone = { ...zone, x: content.x + pw + gap * 1.6, w: zone.w - pw - gap * 1.6 };
				if (plan.logo && !d.layers.logo?.anchor) plan.logo = logoAt(ctx, d, plan.logo.rect.h, wordsZone.x, plan.logo.rect.y);
			} else {
				plan.panel = { x: right(content) - pw, ...py, w: pw };
				wordsZone = { ...zone, w: zone.w - pw - gap * 1.6 };
			}
		}
	}

	if (s.floor !== null && F.w / F.h >= 1 && !hidden(d, 'art')) {
		/* Words on one side, the stack on the other. */
		const w = Math.max(zone.w * 0.6, Math.min(zone.w, s.width * F.w));
		if (d.spec.align === 'right') wordsZone = { ...zone, x: right(zone) - w, w };
		else if (d.spec.align === 'left') wordsZone = { ...zone, w };
		if (plan.logo && plan.logo.rect.w + gap * 2 < zone.w - w && s.logo?.at === 'top-left' && d.spec.align === 'right') wordsZone = { ...wordsZone, y: content.y, h: bottom(zone) - content.y };
	}

	const win = s.window && !(hidden(d, 'window') && !own) ? s.window : null;
	const ratio = win ? (pic ? pic.h / Math.max(1, pic.w) : win === 'app' ? PANEL_H / PANEL_W : 719 / 1600) : 0;
	const winId = own ? 'picture' : 'window';
	const winScale = scaleOf(d, winId);
	const tooBig = (max: number) => new CopyError(`The ${winId} at scale ${winScale} does not fit ${d.template} at ${d.size.id}. The largest that does is ${r2(max)}.`);
	if (win && s.split) {
		/* Beside the words: the window whole, as tall as the frame lets it be. */
		const winBox = { w: zone.w * 0.52, h: zone.h };
		let ww = Math.min(winBox.w, winBox.h / ratio);
		ww *= winScale;
		if (ww > zone.w * 0.64 || ww * ratio > zone.h * 1.001) throw tooBig(Math.min((zone.w * 0.64) / ww, zone.h / (ww * ratio)) * winScale);
		const wh = ww * ratio;
		const onLeft = mirror;
		plan.window = { x: onLeft ? zone.x : right(zone) - ww, y: zone.y + (zone.h - wh) / 2, w: ww, h: wh };
		wordsZone = { ...zone, x: onLeft ? right(plan.window) + gap * 1.8 : zone.x, w: zone.w - ww - gap * 1.8 };
		d.spec.width = 1;
		plan.block = fitWords(ctx, d, wordsZone, aboveH);
	} else if (win) {
		/* Under the words: the words in their share, the window whole in what is left. */
		const g = (F.h / F.w > 1.15 ? 56 : 30) * u;
		let block: Block | null = null;
		let last: unknown;
		for (const share of [s.limit, s.limit + 0.08, s.limit + 0.16]) {
			try {
				block = fitWords(ctx, d, { w: zone.w, h: zone.h * share }, aboveH);
				break;
			} catch (e) {
				if (!(e instanceof CopyError)) throw e;
				last = e;
			}
		}
		if (!block) throw last;
		plan.block = block;
		const room = zone.h - block.h - g;
		const full = Math.min(zone.w, (F.h / F.w > 1.15 ? 0.96 : win === 'app' ? 0.8 : 0.9) * F.w, room / ratio);
		const ww = full * winScale;
		if (ww * ratio > room + 0.5 || ww > zone.w + 0.5) throw tooBig(Math.min(room / ratio, zone.w) / full);
		const wh = ww * ratio;
		const total = block.h + g + wh;
		const top = zone.y + Math.max(0, (zone.h - total) / 2);
		wordsZone = { x: zone.x, y: top, w: zone.w, h: block.h };
		plan.window = { x: F.x + (F.w - ww) / 2, y: top + block.h + g, w: ww, h: wh };
	} else plan.block = fitWords(ctx, d, { w: wordsZone.w, h: wordsZone.h * (s.limit || 1) }, aboveH);

	/* The words in their zone. */
	const b = plan.block;
	const wx = s.align === 'left' ? wordsZone.x : s.align === 'right' ? right(wordsZone) - b.w : wordsZone.x + (wordsZone.w - b.w) / 2;
	const wy = s.valign === 'top' ? wordsZone.y : s.valign === 'bottom' ? bottom(wordsZone) - b.h : wordsZone.y + (wordsZone.h - b.h) / 2;
	const ho = offset(d, 'headline');
	plan.at = { x: wx + ho.x, y: wy + ho.y };
	plan.words = { x: plan.at.x, y: plan.at.y, w: b.w, h: b.h };
	if (plan.window) {
		const o = offset(d, winId);
		plan.window = { ...plan.window, x: plan.window.x + o.x, y: plan.window.y + o.y };
	}
	if (b.logo && s.logo) {
		const z = logoSizes(ctx, d, aboveH);
		const x = s.align === 'left' ? plan.at.x : s.align === 'right' ? plan.at.x + b.w - z.w : plan.at.x + (b.w - z.w) / 2;
		const o = offset(d, 'logo');
		plan.logo = logoAt(ctx, d, aboveH, x + o.x, plan.at.y + o.y);
	}

	if (s.stacks && !hidden(d, 'art')) plan.stacks = planStacks(d, plan, u, mirror);
	if (plan.stacks.some((k) => k.rect.x < -0.5 || k.rect.y < -0.5 || right(k.rect) > W + 0.5 || bottom(k.rect) > H + 0.5)) throw new CopyError(`The art does not fit ${d.template} at ${d.size.id} there: a stack would be cut off at the edge. Move it less or make it smaller.`);

	if (s.room && !hidden(d, 'room')) {
		/* The back wall holds the words and the window, so no line of the room runs behind them. */
		const inner = [plan.words, ...(plan.window ? [plan.window] : []), ...(plan.logo ? [plan.logo.rect] : []), ...(plan.foot ? [{ x: content.x, y: plan.foot.y - plan.foot.fs, w: content.w, h: plan.foot.fs * 2 }] : [])];
		const pad = 0.05 * Math.min(F.w, F.h);
		const c = { x: F.x + F.w / 2, y: F.y + F.h / 2 };
		const min = { x: c.x - (F.w * s.room.min) / 2, y: c.y - (F.h * s.room.min) / 2, w: F.w * s.room.min, h: F.h * s.room.min };
		plan.wall = intersect(union([min, ...inner.map((r) => grow(r, pad))]), inset(canvas, Math.min(W, H) * 0.02));
	}
	return plan;
}

function planFoot(ctx: Ctx, d: Design, content: Rect): FootPlan | null {
	const C = colorsOf(d);
	const fs = Math.max(d.spec.footSize, floorFor(d, C.ink, C.bg));
	const parts: FootPlan['parts'] = [];
	const y = bottom(content) - fs * 0.6;
	const width = (text: string, role: FaceRole) => {
		ctx.font = font(role, 400, fs);
		ctx.letterSpacing = `${0.02 * fs}px`;
		const w = ctx.measureText(text).width - 0.02 * fs;
		ctx.letterSpacing = '0px';
		return w;
	};
	let rightEdge = right(content);
	for (const a of d.size.avoid) if (meet({ x: rightEdge - 200, y: y - fs, w: 200, h: fs * 2 }, a) && a.x > content.x + content.w / 2) rightEdge = a.x - fs;
	const left = !hidden(d, 'note') && d.note ? d.note : '';
	if (left) {
		const role = roleFor('mono', left, 'note');
		parts.push({ id: 'note', text: left, x: content.x, w: width(left, role), align: 'left', role });
	}
	if (!hidden(d, 'address')) {
		const role = roleFor('mono', d.address, 'address');
		const w = width(d.address, role);
		parts.push({ id: 'address', text: d.address, x: rightEdge - w, w, align: 'right', role });
	}
	if (!hidden(d, 'page') && d.page) {
		const role = roleFor('mono', d.page, 'page number');
		const w = width(d.page, role);
		/* Alone at the left; in the middle beside a note. */
		parts.push({ id: 'page', text: d.page, x: left ? content.x + (content.w - w) / 2 : content.x, w, align: 'left', role });
	}
	if (!parts.length) return null;
	const sorted = [...parts].sort((a, b) => a.x - b.x);
	for (let i = 1; i < sorted.length; i++) if (sorted[i - 1]!.x + sorted[i - 1]!.w + fs > sorted[i]!.x) throw new CopyError(`The note "${d.note}" does not fit the foot of ${d.template} at ${d.size.id}. Shorten it${parts.some((p) => p.id === 'address') ? ', or hide the address' : ''}.`);
	if (sorted[0]!.x < content.x - 0.5 || right({ ...sorted[sorted.length - 1]!, y: 0, h: 0 }) > right(content) + 0.5) throw new CopyError(`The note "${d.note}" does not fit the foot of ${d.template} at ${d.size.id}. Shorten it.`);
	const rule = d.spec.footRule && !hidden(d, 'rule') ? { x: content.x, y: y - fs * 1.7, w: rightEdge - content.x, h: Math.max(1, unitOf(d.size.frame.w, d.size.frame.h)) } : null;
	return { y, fs, rule, parts };
}

const STACK_RATIO = { 'stack-tall': 498 / 412, 'stack-wide': 336 / 626 } as const;

/** Stacks round the edges of a room, squared up, two a side, mirrored (shares of a frame, widths of its short side). */
export function roomStacks(W: number, H: number, k = 1, lower = false): { src: 'stack-tall' | 'stack-wide'; x: number; y: number; size: number; flip: boolean }[] {
	const tall = H / W > 1.15;
	if (W / H > 3) return lower ? [] : [{ src: 'stack-tall', x: 0.06, y: 0.5, size: 0.5 * k, flip: false }, { src: 'stack-tall', x: 0.94, y: 0.5, size: 0.5 * k, flip: true }];
	const list = tall
		? [['stack-wide', 0.2, 0.09, 0.3, false], ['stack-wide', 0.8, 0.09, 0.3, true], ['stack-tall', 0.16, 0.88, 0.24, false], ['stack-tall', 0.84, 0.88, 0.24, true]] as const
		: [['stack-tall', 0.075, 0.3, 0.22, false], ['stack-tall', 0.925, 0.3, 0.22, true], ['stack-wide', 0.09, 0.8, 0.26, false], ['stack-wide', 0.91, 0.8, 0.26, true]] as const;
	return list.filter((s) => !lower || s[2] > 0.4).map(([src, x, y, size, flip]) => ({ src, x, y, size: size * k, flip }));
}

function planStacks(d: Design, plan: Plan, u: number, mirror: boolean): StackPlan[] {
	const s = d.spec;
	const F = d.size.frame;
	const S = Math.min(F.w, F.h);
	const scale = scaleOf(d, 'art');
	const o = offset(d, 'art');
	const keep = [plan.words, ...(plan.window ? [plan.window] : []), ...(plan.logo ? [plan.logo.rect] : []), ...(plan.corner ? [plan.corner.rect] : []), ...(plan.foot ? [{ x: plan.content.x, y: plan.foot.y - plan.foot.fs * 1.8, w: plan.content.w, h: plan.foot.fs * 3 }] : [])];
	const pad = 0.028 * S;
	const bounds = inset(F, 0.012 * S);
	const boxOf = (src: StackPlan['src'], cx: number, cy: number, w: number): Rect => ({ x: cx - w / 2, y: cy - (w * STACK_RATIO[src]) / 2, w, h: w * STACK_RATIO[src] });
	const clear = (r: Rect) => !keep.some((k) => meet(grow(r, pad), k)) && !d.size.avoid.some((a) => meet(grow(r, pad / 2), a));
	const inside = (r: Rect, b: Rect) => r.x >= b.x && r.y >= b.y && right(r) <= right(b) && bottom(r) <= bottom(b);
	const out: StackPlan[] = [];
	const finish = (src: StackPlan['src'], r: Rect, flip: boolean, pair: number) => {
		const w = r.w * scale;
		out.push({ src, rect: { ...boxOf(src, r.x + r.w / 2 + o.x, r.y + r.h / 2 + o.y, w) }, flip, pair });
	};
	if (s.stacks === 'panel' && plan.panel) {
		const p = plan.panel;
		const vis = intersect(p, { x: F.x, y: 0, w: F.w, h: d.h });
		const w = Math.min(vis.w * 0.72, (vis.h * 0.8) / STACK_RATIO['stack-tall']);
		finish('stack-tall', boxOf('stack-tall', vis.x + vis.w / 2, vis.y + vis.h / 2, w), mirror, 0);
		return out;
	}
	if (s.stacks === 'floor' && plan.floorY !== null) {
		const onRight = s.align === 'left';
		for (let w = (F.h / F.w > 1.15 ? 420 : 260) * u; w > 110 * u; w *= 0.93) {
			const cx = onRight ? right(plan.content) - w / 2 : plan.content.x + w / 2;
			const r = boxOf('stack-wide', cx, plan.floorY - w * 0.04, w);
			if (clear(r) && inside(r, inset(F, 2))) {
				finish('stack-wide', r, onRight, 0);
				break;
			}
		}
		return out;
	}
	if (s.stacks === 'side') {
		/* A banner: one stack at the end of the line, opposite the words. */
		for (let h = F.h * 0.62; h > F.h * 0.3; h *= 0.94) {
			const w = h / STACK_RATIO['stack-tall'];
			const left = s.align === 'right';
			const r = boxOf('stack-tall', left ? plan.content.x + w / 2 : right(plan.content) - w / 2 - 0.04 * F.h, F.y + F.h / 2, w);
			if (clear(r)) {
				finish('stack-tall', r, !left, 0);
				break;
			}
		}
		return out;
	}
	/* Corners: each mirrored pair the same size, smaller if the words need the room, left out where they cannot stand clear. */
	const list = roomStacks(F.w, F.h, s.stackScale, s.stacks === 'lower');
	const alt = d.seed > 0;
	for (let i = 0; i < list.length; i += 2) {
		const pair = [list[i]!, list[i + 1]!].map((p) => (alt ? { ...p, src: (p.src === 'stack-tall') !== (d.seed % 4 > 1) ? 'stack-tall' as const : 'stack-wide' as const } : p));
		for (let k = 1; k > 0.5; k *= 0.94) {
			const rects = pair.map((p) => boxOf(p.src, F.x + p.x * F.w, F.y + p.y * F.h, p.size * S * k));
			/* Pull a box that leaves the frame back in before judging it. */
			const pulled = rects.map((r) => ({ ...r, x: Math.min(Math.max(r.x, bounds.x), right(bounds) - r.w), y: Math.min(Math.max(r.y, bounds.y), bottom(bounds) - r.h) }));
			if (pulled.every(clear)) {
				pulled.forEach((r, j) => finish(pair[j]!.src, r, pair[j]!.flip, i / 2));
				break;
			}
		}
	}
	return out;
}

/* ---------------------------------------------------------- drawing */

export function hatchLines(ctx: Ctx, r: Rect, gap: number, angle = 45) {
	ctx.save();
	ctx.beginPath();
	ctx.rect(r.x, r.y, r.w, r.h);
	ctx.clip();
	const L = Math.hypot(r.w, r.h) + gap * 2;
	const sp = Math.max(1, gap / Math.SQRT2);
	ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
	ctx.rotate((-angle * Math.PI) / 180);
	ctx.beginPath();
	for (let y = -L / 2; y <= L / 2; y += sp) {
		ctx.moveTo(-L / 2, y);
		ctx.lineTo(L / 2, y);
	}
	ctx.stroke();
	ctx.restore();
}

/** The wordmark as a staggered tile filling a region with whole words only, leaving out those that touch `keep`. */
export function tileWords(ctx: Ctx, r: Rect, tile: number, stagger: boolean, keep: Rect[] = []) {
	const L = logoDoc().wordmark;
	const ratio = L.w / L.h;
	const gapK = 18.43 / 51.61;
	const rowK = 10 / 51.61;
	const n = Math.max(1, Math.round((r.w + tile * gapK) / (tile * (ratio + gapK))));
	const th = r.w / (n * ratio + (n - 1) * gapK);
	const tw = th * ratio;
	const gx = th * gapK;
	const gy = th * rowK;
	const rows = Math.max(0, Math.floor((r.h + gy) / (th + gy)));
	const y0 = r.y + (r.h - rows * th - (rows - 1) * gy) / 2;
	const path = wordmarkPath();
	const k = th / L.h;
	for (let row = 0; row < rows; row++) {
		const odd = stagger && n > 1 && row % 2 === 1;
		for (let i = 0; i < (odd ? n - 1 : n); i++) {
			const x = r.x + i * (tw + gx) + (odd ? (tw + gx) / 2 : 0);
			const y = y0 + row * (th + gy);
			if (keep.some((b) => meet(b, { x, y, w: tw, h: th }))) continue;
			ctx.save();
			ctx.translate(x, y);
			ctx.scale(k, k);
			ctx.fill(path);
			ctx.restore();
		}
	}
}

/* The room: a back wall, rings stepping out faster as they near the edge, and lines from the wall's edges out past the
   frame. The wall is the region left empty (the words stand on it). */
export function drawRoom(ctx: Ctx, W: number, H: number, u: number, wall: Rect, rings: number, stroke: string) {
	const outer = { x: -W * 0.03, y: -H * 0.03, w: W * 1.06, h: H * 1.06 };
	const at = (t: number): Rect => ({ x: wall.x + (outer.x - wall.x) * t, y: wall.y + (outer.y - wall.y) * t, w: wall.w + (outer.w - wall.w) * t, h: wall.h + (outer.h - wall.h) * t });
	ctx.save();
	ctx.strokeStyle = stroke;
	ctx.lineWidth = Math.max(0.5, 1.1 * u);
	/* Fewer rings where the wall leaves little depth. */
	const depth = Math.min(1, Math.max((W - wall.w) / W, (H - wall.h) / H) / 0.5);
	const n = Math.max(1, Math.round(rings * depth));
	for (let i = 0; i <= n; i++) {
		const r = at(i === 0 ? 0 : Math.pow(i / (n + 1), 1.7));
		ctx.strokeRect(r.x, r.y, r.w, r.h);
	}
	const line = (fx: number, fy: number) => {
		ctx.moveTo(wall.x + wall.w * fx, wall.y + wall.h * fy);
		ctx.lineTo(outer.x + outer.w * fx, outer.y + outer.h * fy);
	};
	ctx.beginPath();
	const m = 4;
	for (let i = 0; i <= m; i++) {
		line(i / m, 0);
		line(i / m, 1);
		if (i > 0 && i < m) {
			line(0, i / m);
			line(1, i / m);
		}
	}
	ctx.stroke();
	ctx.restore();
}

/** A room's wall centered at a share of the frame (illustrations). */
export const wallOf = (W: number, H: number, share: number): Rect => ({ x: (W * (1 - share)) / 2, y: (H * (1 - share)) / 2, w: W * share, h: H * share });

async function drawStackArt(ctx: Ctx, src: StackPlan['src'], r: Rect, flip: boolean) {
	const im = await artImage(imageDoc().art[src]!);
	if (r.w < 1) return;
	ctx.save();
	ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
	if (flip) ctx.scale(-1, 1);
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(im, -r.w / 2, -r.h / 2, r.w, r.h);
	ctx.restore();
}

function paintLogo(ctx: Ctx, d: Design, p: LogoPlan, ink: string) {
	const L = logoDoc();
	ctx.fillStyle = ink;
	const { x, y, h } = p.lockup;
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(p.k, p.k);
	ctx.fill(markPath(), 'evenodd');
	ctx.restore();
	if (p.word) {
		ctx.save();
		ctx.translate(x + L.wordmark.x * p.k, y + L.wordmark.y * p.k);
		ctx.scale(p.k, p.k);
		ctx.fill(wordmarkPath());
		ctx.restore();
	}
	if (p.partner) {
		const t = p.partner.times;
		const a0 = ctx.globalAlpha;
		ctx.strokeStyle = ink;
		ctx.globalAlpha = a0 * 0.7;
		ctx.lineWidth = 4 * p.k;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(t.x, t.y);
		ctx.lineTo(t.x + t.w, t.y + t.h);
		ctx.moveTo(t.x + t.w, t.y);
		ctx.lineTo(t.x, t.y + t.h);
		ctx.stroke();
		ctx.globalAlpha = a0;
		ctx.fillStyle = ink;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'left';
		ctx.letterSpacing = '0px';
		ctx.font = font(p.partner.role, 600, p.partner.fs);
		ctx.fillText(p.partner.text, p.partner.rect.x, y + h / 2 + h * 0.03);
	}
}

function paintBadge(ctx: Ctx, d: Design, b: BadgeBox, x: number, y: number) {
	const C = colorsOf(d);
	const { fs } = b;
	const c = chipColors(d, fs);
	const track = (d.spec.badgeTracking / 1000) * fs;
	const words = (wx: number, wy: number) => {
		ctx.font = font(b.role, d.spec.badgeWeight, fs);
		ctx.letterSpacing = `${track}px`;
		ctx.fillStyle = c.ink;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'left';
		ctx.fillText(b.text, wx, wy + fs * 0.04);
		ctx.letterSpacing = '0px';
	};
	const round = (own: number) => (d.spec.badgeRound < 0 ? own : (d.spec.badgeRound / 100) * (b.h / 2));
	const box = (fill: string, r: number) => {
		ctx.fillStyle = fill;
		ctx.beginPath();
		ctx.roundRect(x, y, b.w, b.h, r);
		ctx.fill();
	};
	if (d.badge === 'solid') {
		box(c.fill, round(b.h / 2));
		words(x + fs * 1.08, y + b.h / 2);
	} else if (d.badge === 'pill') {
		box(c.fill, round(b.h / 2));
		ctx.strokeStyle = C.dark ? color('off-white/0.28') : color('off-black/0.16');
		ctx.lineWidth = Math.max(1, fs * 0.06);
		ctx.stroke();
		ctx.fillStyle = C.hi;
		ctx.beginPath();
		ctx.arc(x + fs * 0.97, y + b.h / 2, fs * 0.24, 0, Math.PI * 2);
		ctx.fill();
		words(x + fs * 1.65, y + b.h / 2);
	} else if (d.badge === 'dot') {
		/* A line marked with a small red square, not a dot. */
		ctx.fillStyle = C.hi;
		ctx.fillRect(x, y + b.h / 2 - fs * 0.27, fs * 0.54, fs * 0.54);
		words(x + fs * 1.15, y + b.h / 2);
	} else {
		/* The label chip: a red block with the words in capitals, squared off. */
		box(c.fill, round(b.h * 0.08));
		words(x + fs * 0.62, y + b.h / 2);
	}
}

/* A window's frame and what is in it: the agent panel, the stand-in scene, or a picture shown whole at its own shape. */
function paintWindow(ctx: Ctx, d: Design, r: Rect, u: number, pic: Pic | null, line: string) {
	const app = d.spec.window === 'app';
	const round = (app ? 4 : 0) * u;
	const ground = color(app && !pic ? imageDoc().panel.colors.bg! : imageDoc().window.bg);
	if (app) {
		ctx.save();
		ctx.shadowColor = color(`${imageDoc().window.shadow}/0.19`);
		ctx.shadowBlur = 48 * u;
		ctx.shadowOffsetY = 16 * u;
		ctx.fillStyle = ground;
		ctx.beginPath();
		ctx.roundRect(r.x, r.y, r.w, r.h, round);
		ctx.fill();
		ctx.restore();
	}
	ctx.save();
	ctx.beginPath();
	ctx.roundRect(r.x, r.y, r.w, r.h, round);
	ctx.clip();
	ctx.fillStyle = ground;
	ctx.fillRect(r.x, r.y, r.w, r.h);
	if (pic) {
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(pic.img, r.x, r.y, r.w, r.h);
	} else {
		ctx.translate(r.x, r.y);
		ctx.scale(r.w / PANEL_W, r.h / PANEL_H);
		drawPanel(ctx, d.sample);
	}
	ctx.restore();
	if (!app) {
		ctx.strokeStyle = line;
		ctx.lineWidth = Math.max(0.5, u);
		ctx.strokeRect(r.x + ctx.lineWidth / 2, r.y + ctx.lineWidth / 2, r.w - ctx.lineWidth, r.h - ctx.lineWidth);
	}
}

/* The stand-in product scene for the feature window: the brand's own red room, stacks and the agent panel, at the
   playground scenes' 1600 by 719. Used when no --image is passed. */
const sceneCache = new Map<boolean, Promise<Pic>>();
function standInScene(sample: boolean): Promise<Pic> {
	let p = sceneCache.get(sample);
	if (!p) {
		p = (async () => {
			const W = 1600;
			const H = 719;
			const { canvas, ctx } = scratch(W, H);
			ctx.fillStyle = color(imageDoc().themes.red!.bg);
			ctx.fillRect(0, 0, W, H);
			drawRoom(ctx, W, H, 1.2, wallOf(W, H, 0.3), 4, color(imageDoc().themes.red!.room));
			for (const s of [['stack-tall', 0.1, 0.28, 0.32, false], ['stack-tall', 0.9, 0.28, 0.32, true], ['stack-wide', 0.1, 0.78, 0.34, false], ['stack-wide', 0.9, 0.78, 0.34, true]] as const) {
				const w = s[3] * H;
				const h = w * STACK_RATIO[s[0]];
				await drawStackArt(ctx, s[0], { x: s[1] * W - w / 2, y: s[2] * H - h / 2, w, h }, s[4]);
			}
			const pw = 0.86 * H * (PANEL_W / PANEL_H);
			const k = pw / PANEL_W;
			const px = (W - pw) / 2;
			const py = (H - PANEL_H * k) / 2;
			ctx.save();
			ctx.shadowColor = color(`${imageDoc().window.shadow}/0.19`);
			ctx.shadowBlur = 40;
			ctx.shadowOffsetY = 14;
			ctx.fillStyle = color(imageDoc().panel.colors.bg!);
			ctx.fillRect(px, py, pw, PANEL_H * k);
			ctx.restore();
			ctx.save();
			ctx.translate(px, py);
			ctx.scale(k, k);
			drawPanel(ctx, sample);
			ctx.restore();
			return { img: canvas, w: W, h: H };
		})();
		sceneCache.set(sample, p);
	}
	return p;
}

export type Drawn = { layers: DrawnLayer[]; plan: Plan };

/** Draws a design onto a context sized to the design's own frame. */
export async function drawDesign(ctx: Ctx, d: Design, picture: Pic | null, mo?: Motion): Promise<Drawn> {
	const { w: W, h: H } = d;
	const F = d.size.frame;
	const u = unitOf(F.w, F.h);
	const uc = unitOf(W, H);
	const C = colorsOf(d);
	if (picture && !d.spec.window) throw new Error(`${d.template} has no picture window. --image goes in the app and feature layouts.`);
	const scene = d.spec.window === 'picture' && !picture && !hidden(d, 'window') ? await standInScene(d.sample) : null;
	const plan = planDesign(ctx, d, picture ?? scene, Boolean(picture));
	const layers: DrawnLayer[] = [];
	const clear = plan.logo ? plan.logo.lockup.h * 0.2 : 0;
	const full: Rect = { x: 0, y: 0, w: W, h: H };
	const backs: { id: string; box: Rect }[] = [];
	const report = (id: string, kind: DrawnLayer['kind'], box: Rect, extra: Partial<DrawnLayer> = {}) => {
		const over = backs.filter((b) => (extra.ink ?? [box]).some((r) => meet(r, b.box))).map((b) => b.id);
		layers.push({ id, kind, box, can: canOf(d.template, id), ...(over.length ? { over } : {}), ...extra });
	};
	/** A ground the rest may sit on. */
	const back = (id: string, kind: DrawnLayer['kind'], box: Rect, extra: Partial<DrawnLayer> = {}) => {
		report(id, kind, box, extra);
		backs.push({ id, box });
	};
	if (mo) mo = { ...mo, u };

	ctx.globalAlpha = 1;
	ctx.letterSpacing = '0px';
	ctx.fillStyle = C.bg;
	ctx.fillRect(0, 0, W, H);

	if (plan.wall) {
		drawRoom(ctx, W, H, uc, plan.wall, d.spec.room!.rings, C.room);
		back('room', 'art', full, { bleeds: true });
	}
	const obstacles = [plan.words, ...(plan.logo ? [plan.logo.rect] : []), ...(plan.corner ? [plan.corner.rect] : []), ...(plan.foot ? plan.foot.parts.map((p) => ({ x: p.x, y: plan.foot!.y - plan.foot!.fs, w: p.w, h: plan.foot!.fs * 2 })) : []), ...(plan.foot?.rule ? [plan.foot.rule] : [])];
	if (d.spec.border && plan.border) {
		const fw = plan.border;
		const t = tone(d.spec.border.tone);
		if (d.spec.border.kind === 'solid') {
			ctx.fillStyle = t;
			ctx.fillRect(0, 0, W, fw);
			ctx.fillRect(0, H - fw, W, fw);
			ctx.fillRect(0, fw, fw, H - 2 * fw);
			ctx.fillRect(W - fw, fw, fw, H - 2 * fw);
		} else {
			ctx.strokeStyle = t;
			ctx.lineWidth = Math.max(0.5, u);
			ctx.strokeRect(fw, fw, W - fw * 2, H - fw * 2);
		}
		const px = d.spec.border.kind === 'solid' ? fw : u;
		const off = d.spec.border.kind === 'solid' ? 0 : fw;
		report('border', 'art', full, { bleeds: true, ink: [{ x: off, y: off, w: W - 2 * off, h: px }, { x: off, y: H - off - px, w: W - 2 * off, h: px }, { x: off, y: off, w: px, h: H - 2 * off }, { x: W - off - px, y: off, w: px, h: H - 2 * off }] });
	}
	if (d.spec.pattern === 'full' && !hidden(d, 'pattern')) {
		const region = inset(full, plan.border + 14 * u);
		ctx.fillStyle = C.tile;
		ctx.globalAlpha = Math.min(1, C.tileAlpha * (d.spec.patternStrength / 100));
		tileWords(ctx, region, d.spec.patternTile * (uc / u), true, obstacles.map((r) => grow(r, 16 * u)));
		ctx.globalAlpha = 1;
		back('pattern', 'art', region);
	}
	if (plan.panel) {
		const r = plan.panel;
		ctx.strokeStyle = C.border;
		ctx.lineWidth = Math.max(1, u);
		ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
		back('panel', 'panel', r);
		if (!hidden(d, 'pattern')) {
			const pad = 16 * u;
			ctx.fillStyle = C.tile;
			ctx.globalAlpha = Math.min(1, C.tileAlpha * (d.spec.patternStrength / 100));
			tileWords(ctx, inset(r, pad), d.spec.patternTile, true);
			ctx.globalAlpha = 1;
			back('pattern', 'art', inset(r, pad));
		}
	}
	if (plan.wordmark) {
		const L = logoDoc().wordmark;
		for (const r of plan.wordmark.rects) {
			ctx.save();
			ctx.translate(r.x, r.y);
			ctx.scale(plan.wordmark.k, plan.wordmark.k);
			ctx.strokeStyle = C.line;
			ctx.lineWidth = (1.2 * u) / plan.wordmark.k;
			ctx.stroke(wordmarkPath());
			ctx.restore();
		}
		void L;
		report('wordmark', 'art', union(plan.wordmark.rects));
	}
	if (plan.floorY !== null) {
		const lw = Math.max(0.5, u);
		ctx.strokeStyle = C.line;
		ctx.lineWidth = lw;
		const r = { x: 0, y: plan.floorY, w: W, h: H - plan.floorY };
		if (plan.foot) {
			/* The footer stands on a clear strip under the hatching. */
			r.h = (plan.foot.rule?.y ?? plan.foot.y - plan.foot.fs) - 8 * u - plan.floorY;
		}
		hatchLines(ctx, r, 12 * u, 45);
		ctx.fillStyle = C.line;
		ctx.fillRect(0, r.y, W, lw);
		if (plan.foot) ctx.fillRect(0, r.y + r.h, W, lw);
		back('floor', 'art', r, { bleeds: true });
	}
	if (d.spec.guides !== null && !hidden(d, 'guides')) {
		const gi = d.spec.guides;
		const gw = Math.max(0.5, u);
		ctx.fillStyle = C.line;
		ctx.fillRect(gi, 0, gw, H);
		ctx.fillRect(W - gi - gw, 0, gw, H);
		report('guides', 'art', full, { bleeds: true, ink: [{ x: gi, y: 0, w: gw, h: H }, { x: W - gi - gw, y: 0, w: gw, h: H }] });
	}

	for (const [i, s] of plan.stacks.entries()) await settled(ctx, mo, T.stickers + i * 0.06, () => drawStackArt(ctx, s.src, s.rect, s.flip));
	if (plan.stacks.length) {
		/* The box is one stack (they all scale and move alike); the ink has every one, all inside the canvas. */
		report('art', 'art', plan.stacks[0]!.rect, { ink: plan.stacks.map((s) => s.rect) });
	}

	if (plan.window) {
		const r = plan.window;
		/* A window arrives on the windows' long ease-out (viz-card). */
		const p = mo ? progress(mo.t, T.window, duration('viz-card'), 'viz') : 1;
		ctx.save();
		ctx.globalAlpha = p;
		ctx.translate(0, (1 - p) * 40 * u);
		paintWindow(ctx, d, r, u, picture ?? scene, C.line);
		ctx.restore();
		report(picture ? 'picture' : 'window', 'key', r);
	}

	if (d.template !== 'avatar') await paintWords(ctx, d, plan, C, report, mo, clear);

	if (plan.logo) {
		const p = plan.logo;
		await settled(ctx, mo, T.logo, () => paintLogo(ctx, d, p, C.ink));
		report('logo', 'logo', p.lockup, { logo: { clear: d.template === 'avatar' ? 0 : clear, min: logoFloor(W, d.size.shown) } });
		if (p.partner) report('partner', 'text', p.partner.rect, { text: { asked: d.partner, drawn: p.partner.text, size: p.partner.fs, color: C.ink, ground: [C.bg], ...(d.sample ? { sample: true } : {}) } });
	}
	if (plan.corner) {
		const b = plan.corner;
		await settled(ctx, mo, T.badge, () => paintBadge(ctx, d, b, b.rect.x, b.rect.y));
		report('badge', 'text', b.rect, { text: badgeText(d, b, C.bg) });
	}
	if (plan.foot) {
		const f = plan.foot;
		await settled(ctx, mo, T.foot, () => {
			ctx.save();
			const a0 = ctx.globalAlpha;
			if (f.rule) {
				ctx.fillStyle = C.ink;
				ctx.globalAlpha = a0 * 0.16;
				ctx.fillRect(f.rule.x, f.rule.y, f.rule.w, f.rule.h);
				ctx.globalAlpha = a0;
			}
			ctx.fillStyle = C.ink;
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'left';
			for (const p of f.parts) {
				ctx.font = font(p.role, 400, f.fs);
				ctx.letterSpacing = `${0.02 * f.fs}px`;
				ctx.fillText(p.text, p.x, f.y);
			}
			ctx.restore();
			ctx.letterSpacing = '0px';
		});
		if (f.rule) report('rule', 'art', f.rule);
		for (const p of f.parts) report(p.id, 'text', { x: p.x, y: f.y - f.fs * 0.6, w: p.w, h: f.fs * 1.2 }, { text: { asked: p.text, drawn: p.text, size: f.fs, color: C.ink, ground: [C.bg], ...(p.id === 'note' ? {} : { own: true }) } });
	}
	return { layers, plan };
}

const badgeText = (d: Design, b: BadgeBox, bg: string): NonNullable<DrawnLayer['text']> => {
	const c = chipColors(d, b.fs);
	return { asked: d.badgeText, drawn: b.text, size: b.fs, color: c.ink, ground: [c.fill || bg], ...(d.sample ? { sample: true } : {}) };
};

async function paintWords(ctx: Ctx, d: Design, plan: Plan, C: ReturnType<typeof colorsOf>, report: (id: string, kind: DrawnLayer['kind'], box: Rect, extra?: Partial<DrawnLayer>) => void, mo: Motion | undefined, _clear: number) {
	const s = d.spec;
	const b = plan.block;
	const { x: x0, y: y0 } = plan.at;
	const xFor = (w: number) => (s.align === 'left' ? x0 : s.align === 'right' ? x0 + b.w - w : x0 + (b.w - w) / 2);
	if (b.badge) {
		const bb = b.badge;
		const o = offset(d, 'badge');
		const r = { x: xFor(bb.w) + o.x, y: y0 + bb.y + o.y, w: bb.w, h: bb.h };
		await settled(ctx, mo, T.badge, () => paintBadge(ctx, d, bb, r.x, r.y));
		report('badge', 'text', r, { text: badgeText(d, bb, C.bg) });
	}
	if (b.head) {
		const { lines, role } = b.head;
		const size = b.size;
		const lh = s.leading;
		const ink: Rect[] = [];
		let y = y0 + b.head.y;
		headFont(ctx, d, role, size);
		ctx.textAlign = 'left';
		ctx.textBaseline = 'alphabetic';
		const revealing = mo && mo.t < revealEnd(lines.map((l) => l.text.length));
		const revealFrom = C.dark ? C.ink : accent();
		const space = ctx.measureText(' ').width;
		for (const [li, line] of lines.entries()) {
			headFont(ctx, d, role, size);
			let x = xFor(line.w);
			const base = baselineIn(ctx, y, size, lh);
			const m = ctx.measureText(line.text);
			ink.push({ x, y: base - m.actualBoundingBoxAscent, w: line.w, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent });
			const mid = (line.text.length - 1) / 2;
			let ci = 0;
			line.words.forEach((wd, wi) => {
				const glued = (wd as { glued?: boolean }).glued;
				if (wi && !glued) {
					x += space;
					ci += 1;
				}
				const stop = !wd.hi && li === lines.length - 1 && wi === line.words.length - 1 && /(^|[^.])\.$/.test(wd.text);
				if (revealing) {
					/* The headline reveal (HighlightText): each letter waits faint and red, fades up, then settles to its ink;
					   lines 100ms apart, letters 40ms apart from the center (or from the start on left-set words). */
					for (let k = 0; k < wd.text.length; k++, ci++) {
						const target = wd.hi || (stop && k === wd.text.length - 1) ? C.hi : C.ink;
						const step = s.align === 'left' ? ci : Math.abs(ci - mid);
						const delay = T.head + 0.1 * li + 0.04 * step;
						ctx.globalAlpha = 0.2 + 0.8 * progress(mo!.t, delay, duration('enter'), 'reveal-fade');
						ctx.fillStyle = mix(revealFrom, target, progress(mo!.t, delay + duration('enter'), duration('reveal'), 'reveal-ink'));
						ctx.fillText(wd.text[k]!, x + ctx.measureText(wd.text.slice(0, k)).width, base);
					}
					ctx.globalAlpha = 1;
				} else {
					ctx.fillStyle = wd.hi ? C.hi : C.ink;
					if (stop) {
						const head = wd.text.slice(0, -1);
						ctx.fillText(head, x, base);
						ctx.fillStyle = C.hi;
						ctx.fillText('.', x + ctx.measureText(head).width, base);
					} else ctx.fillText(wd.text, x, base);
				}
				x += ctx.measureText(wd.text).width;
			});
			y += size * lh;
		}
		ctx.letterSpacing = '0px';
		report('headline', 'text', union(ink), { ink, text: { asked: asTyped(d.headlineAsked), drawn: readBack(asTyped(d.headlineAsked), lines, d.headline !== d.headlineAsked), size, color: C.ink, ground: [C.bg], ...(d.sample ? { sample: true } : {}) } });
	}
	const para = (id: 'body' | 'credit', p: { y: number; lines: Line[]; fs: number; role: FaceRole }, weight: number, leading: number, fill: string, asked: string) => {
		const o = offset(d, id);
		const st = mo ? settle(mo.t, T.body) : { alpha: 1, dy: 0 };
		ctx.font = font(p.role, weight, p.fs);
		ctx.letterSpacing = '0px';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = fill;
		ctx.globalAlpha = st.alpha;
		let y = y0 + p.y + o.y;
		const ink: Rect[] = [];
		for (const l of p.lines) {
			const base = baselineIn(ctx, y, p.fs, leading);
			const m = ctx.measureText(l.text);
			const x = xFor(l.w) + o.x;
			ink.push({ x, y: base - m.actualBoundingBoxAscent, w: l.w, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent });
			ctx.fillText(l.text, x, base + (mo ? st.dy * mo.u : 0));
			y += p.fs * leading;
		}
		ctx.globalAlpha = 1;
		report(id, 'text', union(ink), { ink, text: { asked: asTyped(asked), drawn: readBack(asTyped(asked), p.lines), size: p.fs, color: fill, ground: [C.bg], ...(d.sample ? { sample: true } : {}), ...(asked === d.address ? { own: true } : {}) } });
	};
	if (b.body) para('body', b.body, 400, s.bodyLeading, C.muted, d.body);
	if (b.items) {
		const it = b.items;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'alphabetic';
		const ink: Rect[] = [];
		ctx.globalAlpha = mo ? settle(mo.t, T.body).alpha : 1;
		for (const row of it.rows) {
			ctx.font = font(it.role, 400, it.fs);
			const y = y0 + row.y;
			const mark = it.fs * 0.35;
			ctx.fillStyle = C.hi;
			ctx.fillRect(x0, y + (it.fs * 1.36 - mark) / 2, mark, mark);
			ctx.fillStyle = C.ink;
			row.lines.forEach((l, i) => {
				const base = baselineIn(ctx, y + i * it.fs * 1.36, it.fs, 1.36);
				const m = ctx.measureText(l.text);
				ink.push({ x: x0 + it.lead, y: base - m.actualBoundingBoxAscent, w: l.w, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent });
				ctx.fillText(l.text, x0 + it.lead, base);
			});
		}
		ctx.globalAlpha = 1;
		report('items', 'text', union([...ink, { x: x0, y: ink[0]!.y, w: 1, h: 1 }]), { ink, text: { asked: asTyped(d.items.join(' ')), drawn: readBack(asTyped(d.items.join(' ')), it.rows.flatMap((r) => r.lines)), size: it.fs, color: C.ink, ground: [C.bg] } });
	}
	if (b.credit) para('credit', b.credit, 500, 1.2, C.muted, d.credit);
}

/* ------------------------------------------------------------ files */

export type OgRender = { png?: Buffer; svg?: string; rgb?: Buffer; jpg?: Buffer; webp?: Buffer; width: number; height: number; layers: DrawnLayer[] };
export type RenderOpts = { png?: boolean; svg?: boolean; rgb?: boolean; jpg?: boolean; webp?: boolean; scale?: number };

/** One design as PNG and, when asked, JPEG, WebP and SVG (the same drawing through Skia's SVG backend). */
export async function renderDesign(d: Design, picture: Pic | null, opts: RenderOpts = { png: true }): Promise<OgRender> {
	const out: OgRender = { width: d.w, height: d.h, layers: [] };
	const scale = opts.scale ?? 1;
	if (opts.png !== false || opts.rgb || opts.jpg || opts.webp) {
		const s = surface(d.w, d.h, { scale });
		out.layers = (await drawDesign(s.ctx, d, picture)).layers;
		if (opts.png !== false) out.png = toPng(s, { opaque: true });
		if (opts.rgb) out.rgb = rgbOf(s).rgb;
		if (opts.jpg) out.jpg = (s.canvas as Canvas).toBuffer('image/jpeg', 92);
		if (opts.webp) out.webp = (s.canvas as Canvas).toBuffer('image/webp', 92);
	}
	if (opts.svg) {
		const s = surface(d.w, d.h, { svg: true });
		out.layers = (await drawDesign(s.ctx, d, picture)).layers;
		out.svg = toSvg(s);
	}
	return out;
}

/** How long the animated version runs: until the last part has settled, then a 1.5 second hold. */
export function motionLength(d: Design): number {
	const { ctx } = scratch(4, 4);
	const plan = planDesign(ctx, d, null);
	const head = revealEnd((plan.block.head?.lines ?? []).map((l) => l.text.length));
	const rest = Math.max(T.foot + duration('entrance'), plan.window ? T.window + duration('viz-card') : 0, T.stickers + plan.stacks.length * 0.06 + duration('entrance'));
	return Math.round((Math.max(head, rest) + 1.5) * 10) / 10;
}
