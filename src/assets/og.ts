import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Canvas, Image } from '@napi-rs/canvas';
import { packageRoot } from '../lib/brand.js';
import { artImage, logoDoc, markPath, wordmarkPath } from './art.js';
import { color, font, scratch, surface, toPng, toSvg, rgbOf, type Ctx, type FaceRole } from './canvas.js';
import { duration, mix, progress, settle } from './motion.js';

// The share images, ported from the agd-playground posts tool (draw.ts and app.ts): a ground, the perspective room,
// the wordmark tile, the outline band, hatching, guides, a border, the product window, the words with their badge, the
// lockup, a footer and stacks of documents. Every position is a share of the image and every size a unit that grows
// with its area, so one template redraws at any size. The brand's part (themes, copy, art, sizes) is
// brand/assets/image.json; these are the layout rules.

type Rect = { x: number; y: number; w: number; h: number };
export type Pic = { img: Image | Canvas; w: number; h: number };

type ThemeDoc = { label: string; bg: string; ink: string; muted: string; line: string; tile: string; tileAlpha: number; border: string; room: string; dark: boolean; onAccent?: { highlight?: string; badgeFill?: string; badgeInk?: string } };
type TemplateDoc = { label: string; description: string; theme: string; badge: BadgeStyle; badgeText: string; headline: string; body: string; partner?: string };
type SizeDoc = { w: number; h: number; label: string; aliases?: string[] };
export type ImageDoc = {
	themes: Record<string, ThemeDoc>;
	tones: Record<string, string>;
	highlights: Record<string, string>;
	accent: string;
	foot: { left: string; right: string };
	art: Record<string, string>;
	window: { bg: string; placeholder: string; shadow: string };
	panel: { colors: Record<string, string>; content: Record<string, string> };
	templates: Record<string, TemplateDoc>;
	sizes: Record<string, SizeDoc>;
	notes: string[];
};

let doc: ImageDoc | undefined;
export const imageDoc = (): ImageDoc => (doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'image.json'), 'utf8')) as ImageDoc);

export const LAYOUTS = ['hero', 'brief', 'tile', 'app', 'outline', 'hatch', 'room', 'feature', 'partner', 'funding', 'announce', 'card'] as const;
export type Layout = (typeof LAYOUTS)[number];
export type BadgeStyle = 'label' | 'pill' | 'solid' | 'dot' | 'none';
export const BADGES: BadgeStyle[] = ['label', 'pill', 'solid', 'dot', 'none'];
type Align = 'left' | 'center' | 'right';

export type Sticker = { src: 'stack-tall' | 'stack-wide' | 'pixels'; x: number; y: number; size: number; flip?: boolean; behind?: boolean };

export type Design = {
	template: Layout;
	w: number;
	h: number;
	theme: string;
	highlight: string;
	badge: BadgeStyle;
	badgeText: string;
	badgeScale: number;
	headline: string;
	body: string;
	credit: string;
	align: Align;
	textX: number;
	textY: number;
	textSize: number;
	textWidth: number;
	tracking: number;
	leading: number;
	bodyScale: number;
	textFit: number;
	textMiddle: boolean;
	badgeAt: 'words' | 'corner';
	badgeX: number;
	badgeY: number;
	foot: boolean;
	footLeft: string;
	footRight: string;
	logo: boolean;
	logoX: number;
	logoY: number;
	logoSize: number;
	logoAnchor: Align;
	logoMark: boolean;
	logoWord: boolean;
	partnerName: string;
	pattern: 'none' | 'panel' | 'full';
	panelSide: 'right' | 'left' | 'bottom';
	panelCols: number;
	panelTop: number;
	tileSize: number;
	tileStrength: number;
	tileStagger: boolean;
	panelBorder: boolean;
	outline: boolean;
	outlineSize: number;
	outlineY: number;
	outlineStroke: number;
	hatch: 'none' | 'floor';
	hatchY: number;
	hatchGap: number;
	hatchAngle: number;
	guides: boolean;
	guideInset: number;
	room: boolean;
	roomScale: number;
	roomFade: number;
	frame: 'none' | 'line' | 'solid';
	frameWidth: number;
	frameTone: string;
	window: 'none' | 'app' | 'picture';
	winX: number;
	winY: number;
	winW: number;
	winRatio: number;
	winRadius: number;
	winFollow: boolean;
	winGap: number;
	winBg: string;
	winShadow: number;
	winBorder: number;
	stickers: Sticker[];
	badgeGap: number;
	badgeWeight: number;
	badgeFill: string;
	badgeInk: string;
	badgeRound: number;
	badgeFont: FaceRole;
	badgeTracking: number;
	bodyAlpha: number;
	bodyLeading: number;
	bodyGap: number;
	bodyWidth: number;
	footSize: number;
	footInset: number;
	footTracking: number;
	footRule: boolean;
};

/* One unit: a pixel of the 1200 x 630 link preview, grown with the area. */
export const unitOf = (W: number, H: number) => Math.sqrt((W * H) / (1200 * 630));
const LOCK_H = 30;

function panelWidth(cols: number, tile: number, u: number) {
	const L = logoDoc().wordmark;
	const tw = (tile * L.w) / L.h;
	const gx = tile * (18.43 / 51.61);
	return (24 + cols * tw + (cols - 1) * gx + 2) * u;
}

const stack = (src: Sticker['src'], x: number, y: number, size: number, extra: Partial<Sticker> = {}): Sticker => ({ src, x, y, size, ...extra });

/* Stacks round the edges of a room, as on the brand's own share image: squared up, two a side, mirrored. */
export function roomStacks(S: number, W: number, H: number, k = 1, behind = true, clearTop = false): Sticker[] {
	const sz = (n: number) => (n * k * Math.min(W, H)) / S;
	const tall = H / W > 1.15;
	if (W / H > 3) return [];
	const list: Sticker[] = tall
		? [stack('stack-wide', 0.22, 0.08, sz(0.3), { behind }), stack('stack-wide', 0.78, 0.08, sz(0.3), { behind, flip: true }), stack('stack-tall', 0.14, 0.9, sz(0.24), { behind }), stack('stack-tall', 0.86, 0.9, sz(0.24), { behind, flip: true })]
		: [stack('stack-tall', 0.075, 0.3, sz(0.22), { behind }), stack('stack-tall', 0.925, 0.3, sz(0.22), { behind, flip: true }), stack('stack-wide', 0.09, 0.8, sz(0.26), { behind }), stack('stack-wide', 0.91, 0.8, sz(0.26), { behind, flip: true })];
	return clearTop ? list.filter((s) => s.y > 0.3) : list;
}

export const APP_W = 1040;
export const APP_H = 640;

/* Where a template puts everything at a size (layoutFor in the playground). */
export function layoutFor(t: Layout, W: number, H: number): Partial<Design> {
	const u = unitOf(W, H);
	const S = Math.min(W, H);
	const wide = W / H >= 1.4;
	const banner = W / H >= 2.4;
	const ultra = W / H > 4;
	const tall = H / W > 1.15;
	const squareish = !wide && !tall;
	const m = (banner ? 48 : 44) * u;
	const hk = banner ? Math.min(1, H / (500 * u)) : 1;
	const fx = (px: number) => px / W;
	const fy = (px: number) => px / H;
	const lockH = LOCK_H * hk;
	const lockTL = { logo: true, logoX: fx(m), logoY: fy(m), logoAnchor: 'left' as const, logoSize: lockH };
	const base: Partial<Design> = {
		pattern: 'none', outline: false, hatch: 'none', guides: false, room: false, frame: 'none', window: 'none', logo: false,
		tracking: -20, leading: 1.08, badgeScale: 58, bodyScale: 100, textFit: 0, winFollow: false, winGap: 40, textMiddle: false,
		badgeAt: 'words', foot: false, badgeFont: 'text', badgeTracking: 60, badgeWeight: 500, bodyAlpha: 64, bodyLeading: 1.45,
		bodyGap: 34, bodyWidth: 0, logoMark: true, logoWord: true, winBorder: 1, winBg: imageDoc().window.bg, footRule: false, footTracking: 20,
	};
	switch (t) {
		case 'hero':
			return {
				...base, align: 'center', textX: 0.5, textY: banner ? 0.52 : 0.5, textMiddle: true,
				textSize: (tall ? 78 : banner ? 52 : wide ? 62 : 70) * hk, textWidth: banner ? 0.5 : tall ? 0.82 : wide ? 0.66 : 0.76,
				textFit: banner ? 0.56 : tall ? 0.5 : 0.52, badge: 'label', badgeScale: 50, bodyScale: 88,
				bodyWidth: banner ? 0 : tall ? 0.78 : wide ? 0.56 : 0.7, guides: !banner, guideInset: (banner ? 120 : 48) * hk,
				...lockTL, logoX: banner ? fx(m * 2.5) : 0.5, logoAnchor: banner ? 'left' : 'center',
				foot: !banner, footRule: true, footSize: (banner ? 13 : 15) * hk, footInset: (banner ? 48 : 44) * hk + (banner ? 0 : 48 * hk), stickers: [],
			};
		case 'brief': {
			const mm = (banner ? 44 : 56) * u;
			return {
				...base, align: 'left', textX: fx(mm), textY: banner ? 0.54 : tall ? 0.46 : 0.5, textMiddle: true,
				textSize: (tall ? 76 : banner ? 50 : wide ? 60 : 68) * hk, textWidth: banner ? 0.55 : tall ? 0.84 : wide ? 0.66 : 0.8,
				textFit: 0.5, bodyScale: 86, bodyWidth: banner ? 0 : tall ? 0.8 : wide ? 0.56 : 0.74,
				badge: 'dot', badgeAt: 'corner', badgeFont: 'mono', badgeWeight: 400, badgeTracking: 80, badgeScale: (100 * 14 * hk) / 19,
				badgeX: fx(W - mm), badgeY: fy(mm + (lockH * u) / 2), logo: true, logoX: fx(mm), logoY: fy(mm), logoAnchor: 'left', logoSize: lockH,
				foot: true, footRule: true, footSize: 14 * hk, footInset: mm / u, stickers: [],
			};
		}
		case 'room':
			return {
				...base, align: 'center', textX: 0.5, textY: banner ? 0.58 : tall ? 0.54 : 0.58, textMiddle: true,
				textSize: (tall ? 84 : banner ? 56 : wide ? 70 : 76) * hk, textWidth: banner ? 0.5 : tall ? 0.76 : 0.64,
				textFit: banner ? 0.5 : tall ? 0.34 : 0.42, tracking: -16, badge: 'none', room: true, roomScale: 34, roomFade: 4,
				logo: true, logoWord: false, logoSize: (tall ? 62 : banner ? 40 : 48) * hk, logoX: 0.5, logoY: banner ? 0.12 : tall ? 0.3 : 0.22,
				logoAnchor: 'center', stickers: roomStacks(S, W, H, banner ? 0.8 : 0.9),
			};
		case 'app':
			return {
				...base, align: 'center', textX: 0.5, textY: fy(m + (tall ? 60 : 0) * u), textSize: (tall ? 72 : banner ? 46 : wide ? 52 : 60) * hk,
				textWidth: banner ? 0.6 : 0.84, textFit: banner ? 0.4 : tall ? 0.3 : 0.34, badge: 'none', room: true, roomScale: 30,
				window: 'app', winFollow: true, winGap: (tall ? 56 : banner ? 16 : 30) * hk, winX: 0.5, winY: 0.45,
				winW: tall ? 0.9 : banner ? 0.5 : wide ? 0.66 : 0.84, winRatio: APP_H / APP_W, winRadius: 4, winBg: color(imageDoc().panel.colors.bg!),
				winShadow: 120, winBorder: 0, stickers: roomStacks(S, W, H, 0.85, true, true),
			};
		case 'feature':
			return {
				...base, align: 'center', textX: 0.5, textY: fy(m * (banner ? 0.6 : 1) + (tall ? 80 : 6) * u), textSize: (tall ? 76 : banner ? 46 : wide ? 52 : 62) * hk,
				textWidth: banner ? 0.6 : 0.84, textFit: banner ? 0.5 : tall ? 0.34 : 0.38, badge: 'label', badgeScale: 60, bodyScale: 90,
				window: 'picture', winFollow: true, winGap: (tall ? 60 : banner ? 16 : 28) * hk, winX: 0.5, winY: 0.5,
				winW: tall ? 0.96 : banner ? 0.5 : wide ? 0.86 : 0.92, winRatio: 719 / 1600, winRadius: 0, winShadow: 0, winBorder: 1,
				guides: !banner, guideInset: 24, stickers: [],
			};
		case 'card': {
			const mm = Math.min(71 * u, 0.09 * S);
			const q = mm / 98;
			const px = (n: number) => (n * q) / u;
			const logoH = 46 * q;
			const footH = 28 * q;
			const top = mm + logoH + 40 * q;
			const bottom = H - mm - footH - 40 * q;
			return {
				...base, align: 'left', textX: fx(mm), textY: fy((top + bottom) / 2), textMiddle: true, textSize: px(108), textWidth: (W - 2 * mm) / W,
				textFit: Math.max(0.2, (bottom - top) / H), tracking: -22, leading: 1.06, bodyScale: 108, bodyLeading: 1.45, bodyGap: 38, bodyAlpha: 64,
				bodyWidth: banner ? 0 : (0.86 * (W - 2 * mm)) / W, badge: 'solid', badgeAt: 'corner', badgeX: fx(W - mm), badgeY: fy(mm + logoH / 2),
				badgeScale: (100 * 22 * q) / (19 * u), badgeFont: 'mono', badgeWeight: 500, badgeTracking: 90, badgeRound: 8,
				logo: true, logoX: fx(mm), logoY: fy(mm), logoAnchor: 'left', logoSize: px(46), foot: true, footRule: true, footSize: px(24), footInset: px(98), stickers: [],
			};
		}
		case 'outline': {
			const size = 150 * hk;
			const bottom = H + 4 * u * hk;
			return {
				...base, align: ultra ? 'left' : 'center', textX: ultra ? fx(m * 2) : 0.5, textY: fy((banner ? 40 : 80) * u * hk), textSize: (banner ? 60 : 68) * hk,
				textWidth: ultra ? 0.6 : banner ? 0.6 : 0.84, textFit: ultra ? 0.62 : fy(bottom - size * u - 30 * u), badge: 'label',
				outline: true, outlineSize: size, outlineY: fy(bottom), outlineStroke: 1.2, ...lockTL, logo: false, stickers: [],
			};
		}
		case 'tile': {
			const side = tall || squareish ? 'bottom' : 'right';
			const cols = banner ? 3 : 2;
			const pw = panelWidth(cols, 40, u);
			const panelTop = tall ? 0.56 : squareish ? 0.54 : 0;
			return {
				...base, align: 'left', textX: fx(m), textY: fy(m + (banner ? 0 : lockH * u + 44 * u)), textSize: (banner ? 54 : 64) * hk,
				textWidth: side === 'bottom' ? 0.84 : Math.min(0.52, (W - pw - m * 3) / W), textFit: side === 'bottom' ? panelTop - 0.05 : 0.92, badge: 'label',
				pattern: 'panel', panelSide: side, panelCols: cols, panelTop, tileSize: 40, tileStrength: 100, tileStagger: true, panelBorder: true,
				...lockTL, logo: !banner,
				stickers: [side === 'bottom' ? stack('stack-tall', 0.66, (panelTop + 1) / 2 + 0.02, tall ? 0.4 : 0.32) : stack('stack-tall', fx(W - m - pw / 2), 0.52, Math.min(0.7 * pw, 0.7 * H) / S)],
			};
		}
		case 'hatch': {
			const floor = H - 150 * u * hk;
			return {
				...base, align: 'right', textX: fx(W - m), textY: fy(m + 20 * u * hk), textSize: (banner ? 54 : 64) * hk, textWidth: banner ? 0.45 : 0.6,
				textFit: fy(floor - 20 * u), badge: 'label', hatch: 'floor', hatchY: fy(floor), hatchGap: 12, hatchAngle: 45, ...lockTL, logo: !banner,
				stickers: [stack('stack-wide', fx(m + 150 * u * hk), fy(floor - 10 * u * hk), (260 * u * hk) / S)],
			};
		}
		case 'partner':
			return {
				...base, align: 'center', textX: 0.5, textY: banner ? 0.5 : tall ? 0.52 : 0.5, textSize: (tall ? 72 : wide ? 54 : 62) * hk, textWidth: 0.8,
				textFit: 0.94, badge: 'label', pattern: 'full', tileSize: 34 * hk, tileStrength: 35, tileStagger: true, panelBorder: false,
				frame: 'line', frameWidth: 30 * hk, frameTone: 'grey', logo: true, logoSize: 40 * hk, logoX: 0.5,
				logoY: banner ? 0.18 : tall ? 0.36 : wide ? 0.24 : 0.3, logoAnchor: 'center', stickers: [],
			};
		case 'funding':
			return {
				...base, align: ultra ? 'left' : 'center', textX: ultra ? fx(m * 2) : 0.5, textY: 0.54, textMiddle: true,
				textSize: (tall ? 132 : banner ? 74 : wide ? 104 : 112) * hk, textWidth: ultra ? 0.6 : tall ? 0.8 : 0.7, textFit: banner ? 0.6 : 0.56,
				badge: 'label', badgeScale: 46, room: true, roomScale: 40, logo: !banner, logoWord: false, logoSize: (tall ? 56 : 40) * hk,
				logoX: 0.5, logoY: tall ? 0.16 : 0.08, logoAnchor: 'center', stickers: roomStacks(S, W, H, banner ? 0.7 : 0.9),
			};
		case 'announce': {
			const inner = m + 34 * u * hk;
			return {
				...base, align: 'left', textX: fx(inner), textY: fy(inner + (banner ? 10 : 60) * u * hk), textSize: (tall ? 96 : banner ? 56 : wide ? 72 : 78) * hk,
				textWidth: banner ? 0.6 : 0.76, textFit: banner ? 0.86 : fy(H - inner - lockH * u - 40 * u), badge: 'dot', frame: 'solid',
				frameWidth: 34 * hk, frameTone: 'red', logo: true, logoX: banner ? fx(W - inner) : fx(inner), logoY: banner ? fy(inner) : fy(H - inner - lockH * u),
				logoAnchor: banner ? 'right' : 'left', logoSize: lockH, stickers: [],
			};
		}
	}
}

const START: Omit<Design, 'template' | 'w' | 'h' | 'theme' | 'headline' | 'body' | 'badge' | 'badgeText'> = {
	highlight: 'red', badgeScale: 58, credit: '', align: 'left', textX: 0.033, textY: 0.064, textSize: 61.4, textWidth: 0.47, tracking: -10,
	leading: 1, bodyScale: 100, textFit: 0, textMiddle: false, badgeAt: 'words', badgeX: 0.95, badgeY: 0.08, foot: false, footLeft: '', footRight: '',
	logo: true, logoX: 0.033, logoY: 0.863, logoSize: 30, logoAnchor: 'left', logoMark: true, logoWord: true, partnerName: '', pattern: 'none',
	panelSide: 'right', panelCols: 2, panelTop: 0, tileSize: 51.6, tileStrength: 100, tileStagger: false, panelBorder: true, outline: false,
	outlineSize: 188.8, outlineY: 1.02, outlineStroke: 1.3, hatch: 'none', hatchY: 0.66, hatchGap: 19, hatchAngle: 45, guides: false, guideInset: 80,
	room: false, roomScale: 34, roomFade: 4, frame: 'none', frameWidth: 24, frameTone: 'light', window: 'none', winX: 0.5, winY: 0.42, winW: 0.86,
	winRatio: APP_H / APP_W, winRadius: 10, winFollow: false, winGap: 40, winBg: '', winShadow: 100, winBorder: 1, stickers: [],
	badgeGap: 21, badgeWeight: 500, badgeFill: '', badgeInk: '', badgeRound: -1, badgeFont: 'text', badgeTracking: 0, bodyAlpha: 78,
	bodyLeading: 1.4, bodyGap: 30, bodyWidth: 0, footSize: 20, footInset: 56, footTracking: 0, footRule: false,
};

export type Compose = { template: Layout; w: number; h: number; theme?: string; headline?: string; body?: string; badge?: BadgeStyle; badgeText?: string; highlight?: string; partner?: string; credit?: string; extra?: Partial<Design> };

/* A finished design: the template's layout at the size, then its opening copy, then what was asked for. */
export function compose(o: Compose): Design {
	const D = imageDoc();
	const t = D.templates[o.template]!;
	const theme = o.theme ?? t.theme;
	const onAccent = D.themes[theme]?.onAccent ?? {};
	const d: Design = {
		...START,
		template: o.template, w: o.w, h: o.h, theme,
		headline: t.headline, body: t.body, badge: t.badge, badgeText: t.badgeText,
		...layoutFor(o.template, o.w, o.h),
		footLeft: D.foot.left, footRight: D.foot.right,
	} as Design;
	/* The template's own badge style is the playground's occasion words over the layout's. */
	d.badge = t.badge;
	d.highlight = onAccent.highlight ?? 'red';
	d.badgeFill = onAccent.badgeFill ? color(onAccent.badgeFill) : '';
	d.badgeInk = onAccent.badgeInk ? color(onAccent.badgeInk) : '';
	d.partnerName = t.partner ?? '';
	if (o.headline !== undefined) {
		d.headline = emphasise(o.headline);
		if (o.partner === undefined) d.partnerName = '';
	}
	if (o.body !== undefined) d.body = o.body;
	if (o.badge) d.badge = o.badge;
	if (o.badgeText !== undefined) d.badgeText = o.badgeText;
	if (o.highlight) d.highlight = o.highlight;
	if (o.partner !== undefined) d.partnerName = o.partner;
	d.credit = o.credit ?? '';
	if (d.partnerName) d.logo = true;
	return o.extra ? { ...d, ...o.extra } : d;
}

/* The site's headlines end on a full stop, drawn in the highlight color. */
export function emphasise(s: string) {
	const t = s.replace(/\s+$/, '');
	if (/[\p{L}\p{N})”’"']$/u.test(t) && !/[.!?…:]$/.test(t)) return `${t}.`;
	return t;
}

/* ----------------------------------------------------------- motion */

/** A frame of the animated version: `t` seconds in, `u` the frame's unit (settle distances grow with it). */
export type Motion = { t: number; u: number };

/* When each part comes in, in seconds: the hero's order (the label, the headline letters, the line, then the
   window and the rest), its 60ms settle stagger and the windows' later arrival. */
const T = { logo: 0, badge: 0.06, head: 0.18, body: 0.42, window: 0.5, stickers: 0.62, foot: 0.74 };

/** When the last headline letter has settled, given each line's length in letters. */
export function revealEnd(mo: Motion | { t: number }, lineLengths: number[]): number {
	let end = 0;
	lineLengths.forEach((n, li) => {
		end = Math.max(end, T.head + 0.1 * li + 0.04 * Math.max(0, n - 1) + duration('enter') + duration('reveal'));
	});
	void mo;
	return end;
}

function withSettle<R>(ctx: Ctx, mo: Motion | undefined, delay: number, draw: () => R): R {
	if (!mo) return draw();
	const st = settle(mo.t, delay);
	ctx.save();
	ctx.globalAlpha *= st.alpha;
	ctx.translate(0, st.dy * mo.u);
	const r = draw();
	ctx.restore();
	return r;
}

async function settleAsync(ctx: Ctx, mo: Motion | undefined, delay: number, draw: () => Promise<void>) {
	if (!mo) return draw();
	const st = settle(mo.t, delay);
	ctx.save();
	ctx.globalAlpha *= st.alpha;
	ctx.translate(0, st.dy * mo.u);
	await draw();
	ctx.restore();
}

/* ------------------------------------------------------------ words */

type Word = { text: string; hi: boolean; space: boolean };
const STAR = '\u0000';
function parseLine(line: string): Word[] {
	const out: Word[] = [];
	let hi = false;
	line = line.replaceAll('\\*', STAR);
	for (const [i, chunk] of line.split('*').entries()) {
		if (i > 0) hi = !hi;
		for (const b of chunk.split(/(\s+)/)) {
			if (!b) continue;
			if (/^\s+$/.test(b)) {
				if (out.length) out[out.length - 1]!.space = true;
			} else out.push({ text: b.replaceAll(STAR, '*'), hi, space: false });
		}
	}
	return out;
}

function wrapWords(ctx: Ctx, words: Word[], max: number) {
	const space = ctx.measureText(' ').width;
	const lines: { words: Word[]; w: number }[] = [];
	let cur: Word[] = [];
	let w = 0;
	for (const wd of words) {
		const ww = ctx.measureText(wd.text).width;
		const add = cur.length ? space + ww : ww;
		if (cur.length && w + add > max) {
			lines.push({ words: cur, w });
			cur = [wd];
			w = ww;
		} else {
			cur.push(wd);
			w += add;
		}
	}
	if (cur.length || !lines.length) lines.push({ words: cur, w });
	return lines;
}

function plainLines(ctx: Ctx, s: string, max: number) {
	return s.split('\n').flatMap((l) => wrapWords(ctx, parseLine(l), max)).map((l) => ({ text: l.words.map((w) => w.text).join(' '), w: l.w }));
}

function baselineIn(ctx: Ctx, lineTop: number, size: number, lh: number) {
	const m = ctx.measureText('Hg');
	const asc = m.fontBoundingBoxAscent || size * 0.9;
	const desc = m.fontBoundingBoxDescent || size * 0.22;
	return lineTop + (size * lh - (asc + desc)) / 2 + asc;
}

/* ----------------------------------------------------------- colors */

export function colorsOf(d: Design) {
	const D = imageDoc();
	const t = D.themes[d.theme]!;
	const hi = D.highlights[d.highlight];
	return {
		bg: color(t.bg), ink: color(t.ink), line: color(t.line), tile: color(t.tile), border: color(t.border),
		hi: hi ? color(hi) : '', room: color(t.room), dark: t.dark, tileAlpha: t.tileAlpha,
	};
}
const tone = (name: string) => color(imageDoc().tones[name] ?? imageDoc().tones.light!);
const accent = () => color(imageDoc().accent);

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

export function tileWords(ctx: Ctx, r: Rect, tile: number, u: number, stagger: boolean, startX: number, startY: number) {
	const L = logoDoc().wordmark;
	const th = tile * u;
	const k = th / L.h;
	const tw = L.w * k;
	const gx = th * (18.43 / 51.61);
	const gy = th * (10 / 51.61);
	const path = wordmarkPath();
	ctx.save();
	ctx.beginPath();
	ctx.rect(r.x, r.y, r.w, r.h);
	ctx.clip();
	let row = 0;
	for (let y = startY; y < r.y + r.h; y += th + gy, row++) {
		const off = stagger && row % 2 ? (tw + gx) / 2 : 0;
		let x = startX - off;
		while (x > r.x) x -= tw + gx;
		for (; x < r.x + r.w; x += tw + gx) {
			ctx.save();
			ctx.translate(x, y);
			ctx.scale(k, k);
			ctx.fill(path);
			ctx.restore();
		}
	}
	ctx.restore();
}

function drawLogoRow(ctx: Ctx, d: Design, u: number, ink: string): Rect | null {
	if (!d.logo || (!d.logoMark && !d.logoWord)) return null;
	const L = logoDoc();
	const { w: W, h: H } = d;
	const k = (d.logoSize * u) / L.lockup.h;
	const markW = d.logoMark ? L.mark.w * k : 0;
	const wordGap = d.logoMark && d.logoWord ? (L.wordmark.x - L.mark.w) * k : 0;
	const wordW = d.logoWord ? L.wordmark.w * k : 0;
	const lw = markW + wordGap + wordW;
	const lh = L.lockup.h * k;
	const pname = d.partnerName.trim();
	const gap = 26 * k;
	const times = 16 * k;
	let pw = 0;
	if (pname) {
		ctx.font = font('display', 600, lh * 0.72);
		ctx.letterSpacing = '0px';
		pw = ctx.measureText(pname).width;
	}
	const total = pname ? lw + gap * 2 + times + pw : lw;
	const x = d.logoAnchor === 'left' ? d.logoX * W : d.logoAnchor === 'center' ? d.logoX * W - total / 2 : d.logoX * W - total;
	const y = d.logoY * H;
	const mh = L.mark.h * k;
	const my = y + lh / 2 - mh / 2;
	ctx.fillStyle = ink;
	if (d.logoMark) {
		ctx.save();
		ctx.translate(x, my);
		ctx.scale(k, k);
		ctx.fill(markPath(), 'evenodd');
		ctx.restore();
	}
	if (d.logoWord) {
		ctx.save();
		ctx.translate(x + markW + wordGap, y + L.wordmark.y * k);
		ctx.scale(k, k);
		ctx.fill(wordmarkPath());
		ctx.restore();
	}
	if (pname) {
		const cy = y + lh / 2;
		const cx = x + lw + gap + times / 2;
		ctx.strokeStyle = ink;
		const a0 = ctx.globalAlpha;
		ctx.globalAlpha = a0 * 0.55;
		ctx.lineWidth = 2.2 * k;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(cx - times / 2, cy - times / 2);
		ctx.lineTo(cx + times / 2, cy + times / 2);
		ctx.moveTo(cx + times / 2, cy - times / 2);
		ctx.lineTo(cx - times / 2, cy + times / 2);
		ctx.stroke();
		ctx.globalAlpha = a0;
		ctx.fillStyle = ink;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'left';
		ctx.font = font('display', 600, lh * 0.72);
		ctx.fillText(pname, cx + times / 2 + gap, cy + lh * 0.03);
	}
	return { x, y: Math.min(y, my), w: total, h: Math.max(y + lh, my + mh) - Math.min(y, my) };
}

function drawBadge(ctx: Ctx, d: Design, x: number, y: number, fs: number, ink: string, hi: string, dark: boolean, measureOnly: boolean, bg: string) {
	if (d.badge === 'none' || !d.badgeText.trim()) return { w: 0, h: 0 };
	const sq = fs * 1.2857;
	const wordInk = d.badgeInk || (d.badge === 'solid' ? bg : d.badge === 'label' ? tone('white') : ink);
	const track = (d.badgeTracking / 1000) * fs;
	ctx.font = font(d.badgeFont, d.badgeWeight, fs);
	ctx.letterSpacing = `${track}px`;
	const text = d.badge === 'label' || d.badge === 'dot' ? d.badgeText.toUpperCase() : d.badgeText;
	const tw = ctx.measureText(text).width - (track > 0 ? track : 0);
	ctx.letterSpacing = '0px';
	const words = (wx: number, wy: number) => {
		ctx.font = font(d.badgeFont, d.badgeWeight, fs);
		ctx.letterSpacing = `${track}px`;
		ctx.fillStyle = wordInk;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'left';
		ctx.fillText(text, wx, wy + fs * 0.04);
		ctx.letterSpacing = '0px';
	};
	const round = (h: number, own: number) => (d.badgeRound < 0 ? own : (d.badgeRound / 100) * (h / 2));
	if (d.badge === 'solid') {
		const padX = fs * 1.08;
		const h = fs * 2.46;
		const w = tw + padX * 2;
		if (!measureOnly) {
			ctx.fillStyle = d.badgeFill || ink;
			ctx.beginPath();
			ctx.roundRect(x, y, w, h, round(h, h / 2));
			ctx.fill();
			words(x + padX, y + h / 2);
		}
		return { w, h };
	}
	if (d.badge === 'pill') {
		const padX = fs * 0.75;
		const h = fs * 1.9;
		const w = tw + padX * 2 + fs * 0.9;
		if (!measureOnly) {
			ctx.fillStyle = dark ? color('off-white/0.14') : color('off-black/0.04');
			ctx.strokeStyle = dark ? color('off-white/0.28') : color('off-black/0.16');
			ctx.lineWidth = Math.max(1, fs * 0.06);
			ctx.beginPath();
			ctx.roundRect(x, y, w, h, round(h, h / 2));
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = hi || accent();
			ctx.beginPath();
			ctx.arc(x + padX + fs * 0.22, y + h / 2, fs * 0.24, 0, Math.PI * 2);
			ctx.fill();
			words(x + padX + fs * 0.9, y + h / 2);
		}
		return { w, h };
	}
	if (d.badge === 'dot') {
		const r = fs * 0.3;
		const w = r * 2 + fs * 0.55 + tw;
		if (!measureOnly) {
			/* A line marked with a small red square, not a dot. */
			ctx.fillStyle = hi || accent();
			ctx.fillRect(x, y + sq / 2 - r * 0.9, r * 1.8, r * 1.8);
			words(x + r * 2 + fs * 0.55, y + sq / 2);
		}
		return { w, h: sq };
	}
	/* The label chip: a red block with the words in capitals, squared off. */
	const padX = fs * 0.62;
	const h = fs * 1.75;
	const w = tw + padX * 2;
	if (!measureOnly) {
		ctx.fillStyle = d.badgeFill || accent();
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, round(h, h * 0.08));
		ctx.fill();
		words(x + padX, y + h / 2);
	}
	return { w, h };
}

function drawWords(ctx: Ctx, d: Design, size: number, ink: string, hiColor: string, dark: boolean, bg: string, dry = false, mo?: Motion): Rect {
	const { w: W, h: H } = d;
	const maxW = d.textWidth * W;
	const lh = d.leading;
	const ax = d.textX * W;
	let y = d.textY * H;
	const top = y;
	const xFor = (w: number) => (d.align === 'left' ? ax : d.align === 'center' ? ax - w / 2 : ax - w);
	const badgeSize = size * 0.3046 * (d.badgeScale / 100);
	const b = d.badgeAt === 'corner' ? { w: 0, h: 0 } : drawBadge(ctx, d, 0, 0, badgeSize, ink, hiColor, dark, true, bg);
	let widest = b.w;
	if (b.w) {
		if (!dry) withSettle(ctx, mo, T.badge, () => drawBadge(ctx, d, xFor(b.w), y, badgeSize, ink, hiColor, dark, false, bg));
		y += b.h + size * (d.badgeGap / 100);
	}
	ctx.font = font('display', 400, size);
	ctx.letterSpacing = `${(d.tracking / 1000) * size}px`;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	const hi = hiColor || ink;
	const lines = d.headline.split('\n').flatMap((l) => wrapWords(ctx, parseLine(l), maxW));
	const space = ctx.measureText(' ').width;
	const revealFrom = (hiColor && !dark ? hiColor : '') || (dark ? ink : color(imageDoc().accent));
	for (const [li, line] of lines.entries()) {
		let x = xFor(line.w);
		widest = Math.max(widest, line.w);
		if (!dry && mo && mo.t < revealEnd(mo, lines.map((l) => l.words.map((w) => w.text).join(' ').length))) {
			/* The headline reveal (HighlightText): each letter waits faint and red, fades up, then settles to its ink;
			   lines 100ms apart, letters 40ms apart from the center (or from the start on left-set words). */
			const base = baselineIn(ctx, y, size, lh);
			const text = line.words.map((w) => w.text).join(' ');
			const mid = (text.length - 1) / 2;
			let ci = 0;
			line.words.forEach((wd, wi) => {
				const stop = !wd.hi && line === lines[lines.length - 1] && wi === line.words.length - 1 && /[^.]\.$/.test(wd.text);
				for (let k = 0; k < wd.text.length; k++, ci++) {
					const target = wd.hi || (stop && k === wd.text.length - 1) ? hiColor || ink : ink;
					const step = d.align === 'left' ? ci : Math.abs(ci - mid);
					const delay = T.head + 0.1 * li + 0.04 * step;
					const a = 0.2 + 0.8 * progress(mo.t, delay, duration('enter'), 'reveal-fade');
					const c = progress(mo.t, delay + duration('enter'), duration('reveal'), 'reveal-ink');
					ctx.globalAlpha = a;
					ctx.fillStyle = mix(revealFrom, target, c);
					ctx.fillText(wd.text[k]!, x + ctx.measureText(wd.text.slice(0, k)).width, base);
				}
				ctx.globalAlpha = 1;
				ci += 1;
				x += ctx.measureText(wd.text).width + (wi < line.words.length - 1 ? space : 0);
			});
		} else if (!dry) {
			const base = baselineIn(ctx, y, size, lh);
			line.words.forEach((wd, i) => {
				const ww = ctx.measureText(wd.text).width;
				ctx.fillStyle = wd.hi ? hi : ink;
				const stop = !wd.hi && line === lines[lines.length - 1] && i === line.words.length - 1 && /[^.]\.$/.test(wd.text);
				if (stop) {
					const head = wd.text.slice(0, -1);
					ctx.fillText(head, x, base);
					ctx.fillStyle = hiColor || ink;
					ctx.fillText('.', x + ctx.measureText(head).width, base);
				} else ctx.fillText(wd.text, x, base);
				x += ww + (i < line.words.length - 1 ? space : 0);
			});
		}
		y += size * lh;
	}
	ctx.letterSpacing = '0px';
	if (d.body.trim()) {
		const bs = size * 0.34 * (d.bodyScale / 100);
		const bw = d.bodyWidth > 0 ? d.bodyWidth * W : maxW;
		y += size * (d.bodyGap / 100);
		ctx.font = font('text', 400, bs);
		ctx.fillStyle = ink;
		const st = mo ? settle(mo.t, T.body) : { alpha: 1, dy: 0 };
		ctx.globalAlpha = (d.bodyAlpha / 100) * st.alpha;
		for (const l of plainLines(ctx, d.body, bw)) {
			widest = Math.max(widest, l.w);
			if (!dry) ctx.fillText(l.text, xFor(l.w), baselineIn(ctx, y, bs, d.bodyLeading) + (mo ? st.dy * mo.u : 0));
			y += bs * d.bodyLeading;
		}
		ctx.globalAlpha = 1;
	}
	const credit = d.credit.trim();
	if (credit) {
		const cs = Math.max(11, size * 0.2);
		y += size * (d.body.trim() ? 0.12 : 0.2);
		ctx.font = font('text', 500, cs);
		ctx.fillStyle = ink;
		ctx.globalAlpha = 0.72 * (mo ? settle(mo.t, T.body).alpha : 1);
		const cw = d.bodyWidth > 0 ? d.bodyWidth * W : maxW;
		for (const l of plainLines(ctx, credit, cw)) {
			widest = Math.max(widest, l.w);
			if (!dry) ctx.fillText(l.text, xFor(l.w), baselineIn(ctx, y, cs, 1.15));
			y += cs * 1.15;
		}
		ctx.globalAlpha = 1;
	}
	return { x: xFor(widest), y: top, w: widest, h: y - top };
}

function fittedSize(ctx: Ctx, d: Design, u: number, bg: string) {
	const H = d.h;
	let size = d.textSize * u;
	if (d.textFit <= 0) return size;
	const limit = d.textMiddle ? d.textFit * H : d.textFit * H - d.textY * H;
	if (limit <= 0) return size * 0.4;
	for (let i = 0; i < 6; i++) {
		const r = drawWords(ctx, d, size, '#000000', '', false, bg, true);
		if (r.h <= limit + 0.5) break;
		size = Math.max(d.textSize * u * 0.4, size * Math.max(0.6, Math.min(0.98, limit / r.h)));
	}
	return size;
}

async function drawSticker(ctx: Ctx, s: Sticker, S: number, W: number, H: number) {
	const im = await artImage(imageDoc().art[s.src]!);
	const w = s.size * S;
	const h = w * (im.height / Math.max(1, im.width));
	const cx = s.x * W;
	const cy = s.y * H;
	if (w < 1 || h < 0.5) return;
	ctx.save();
	ctx.translate(cx, cy);
	if (s.flip) ctx.scale(-1, 1);
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(im, -w / 2, -h / 2, w, h);
	ctx.restore();
}

/* The window's frame and what is in it: the agent panel, or a picture shown whole at its own shape. */
function drawWindow(ctx: Ctx, d: Design, u: number, pic: Pic | null, line: string, top: number): Rect | null {
	if (d.window === 'none') return null;
	const { w: W, h: H } = d;
	let ww = d.winW * W;
	const scene = d.window === 'picture' && !!pic;
	const ratio = scene ? pic!.h / Math.max(1, pic!.w) : d.winRatio;
	let room = 0;
	if (scene) {
		room = H - top - Math.max(28 * u, 0.05 * Math.min(W, H));
		ww = Math.max(40 * u, Math.min(ww, room / ratio));
	}
	const wh = ww * ratio;
	const x = d.winX * W - ww / 2;
	const y = scene && d.winFollow ? top + Math.max(0, room - wh) * 0.5 : top;
	const r = d.winRadius * u;
	if (d.winShadow > 0) {
		ctx.save();
		ctx.shadowColor = color(`${imageDoc().window.shadow}/${Math.min(0.6, 0.16 * (d.winShadow / 100))}`);
		ctx.shadowBlur = 40 * u * (d.winShadow / 100);
		ctx.shadowOffsetY = 14 * u * (d.winShadow / 100);
		ctx.fillStyle = d.winBg;
		ctx.beginPath();
		ctx.roundRect(x, y, ww, wh, r);
		ctx.fill();
		ctx.restore();
	}
	ctx.save();
	ctx.beginPath();
	ctx.roundRect(x, y, ww, wh, r);
	ctx.clip();
	ctx.fillStyle = d.winBg;
	ctx.fillRect(x, y, ww, wh);
	if (d.window === 'app') {
		const s = ww / APP_W;
		ctx.translate(x, y);
		ctx.scale(s, s);
		drawPanel(ctx);
	} else if (pic) {
		const cover = Math.max(ww / pic.w, wh / pic.h);
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(pic.img, x - (pic.w * cover - ww) * 0, y - (pic.h * cover - wh) * 0, pic.w * cover, pic.h * cover);
	} else {
		ctx.fillStyle = color(imageDoc().window.placeholder);
		ctx.fillRect(x, y, ww, wh);
	}
	ctx.restore();
	if (d.winBorder > 0) {
		ctx.strokeStyle = line;
		ctx.lineWidth = Math.max(0.5, d.winBorder * u);
		ctx.beginPath();
		ctx.roundRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, ww - ctx.lineWidth, wh - ctx.lineWidth, r);
		ctx.stroke();
	}
	return { x, y, w: ww, h: wh };
}

function drawFrame(ctx: Ctx, d: Design, u: number, W: number, H: number, bg: string) {
	if (d.frame === 'none') return;
	const fw = d.frameWidth * u;
	const t = tone(d.frameTone);
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, W, H);
	ctx.rect(fw, fw, W - fw * 2, H - fw * 2);
	ctx.clip('evenodd');
	ctx.fillStyle = d.frame === 'solid' ? t : bg;
	ctx.fillRect(0, 0, W, H);
	ctx.restore();
	if (d.frame !== 'solid') {
		ctx.strokeStyle = t;
		ctx.lineWidth = Math.max(0.5, u);
		ctx.strokeRect(fw, fw, W - fw * 2, H - fw * 2);
	}
}

/* The room: a back wall roomScale% of the image, rings stepping out faster as they near the edge, and lines from
   the wall's edges out past the frame. */
export function drawRoom(ctx: Ctx, W: number, H: number, u: number, roomScale: number, roomFade: number, stroke: string, cx = W / 2, cy = H / 2) {
	const bw = (W * roomScale) / 100;
	const bh = (H * roomScale) / 100;
	const rings = Math.max(0, Math.round(roomFade));
	const ringAt = (t: number) => {
		const rw = bw + (W * 1.06 - bw) * t;
		const rh = bh + (H * 1.06 - bh) * t;
		return { x: cx - rw / 2, y: cy - rh / 2, w: rw, h: rh };
	};
	ctx.save();
	ctx.strokeStyle = stroke;
	ctx.lineWidth = Math.max(0.5, 1.1 * u);
	for (let i = 0; i <= rings; i++) {
		const r = ringAt(i === 0 ? 0 : Math.pow(i / (rings + 1), 1.7));
		ctx.strokeRect(r.x, r.y, r.w, r.h);
	}
	const far = 3;
	const out = (x: number, y: number) => {
		ctx.moveTo(x, y);
		ctx.lineTo(cx + (x - cx) * far, cy + (y - cy) * far);
	};
	const B = ringAt(0);
	ctx.beginPath();
	const n = 4;
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		out(B.x + B.w * t, B.y);
		out(B.x + B.w * t, B.y + B.h);
		if (i > 0 && i < n) {
			out(B.x, B.y + B.h * t);
			out(B.x + B.w, B.y + B.h * t);
		}
	}
	ctx.stroke();
	ctx.restore();
}

function drawFoot(ctx: Ctx, d: Design, u: number, W: number, H: number, ink: string) {
	const fs = d.footSize * u;
	const inset = d.footInset * u;
	const mid = H - inset - fs * 0.5;
	ctx.save();
	if (d.footRule) {
		const a0 = ctx.globalAlpha;
		ctx.fillStyle = ink;
		ctx.globalAlpha = a0 * 0.16;
		ctx.fillRect(inset, H - inset - fs * 2.4, W - inset * 2, Math.max(1, u));
		ctx.globalAlpha = a0;
	}
	ctx.fillStyle = ink;
	ctx.font = font('mono', 400, fs);
	const track = (d.footTracking / 1000) * fs;
	ctx.letterSpacing = `${track}px`;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	if (d.footLeft.trim()) ctx.fillText(d.footLeft, inset, mid);
	ctx.textAlign = 'right';
	if (d.footRight.trim()) ctx.fillText(d.footRight, W - inset + Math.max(0, track), mid);
	ctx.restore();
	ctx.letterSpacing = '0px';
}

/* -------------------------------------------------------- the panel */

const split = (s: string, by: RegExp) => s.split(by).map((x) => x.trim()).filter(Boolean);
function parts(s: string, n: number) {
	return split(s, /\n/).map((l) => {
		const p = l.split('|').map((x) => x.trim());
		while (p.length < n) p.push('');
		return p.slice(0, n);
	});
}
function hash(s: string) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
	return h >>> 0;
}

/* The dark agent panel (app.ts) in a 1040 x 640 box at the current transform. */
export function drawPanel(ctx: Ctx, content: Record<string, string> = imageDoc().panel.content) {
	const C = Object.fromEntries(Object.entries(imageDoc().panel.colors).map(([k, v]) => [k, color(v)])) as Record<string, string>;
	const a = { ...imageDoc().panel.content, ...content };
	const W = APP_W;
	const H = APP_H;
	const padX = 34;
	const f = (size: number, weight = 400) => font('ui', weight, size);
	ctx.save();
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.letterSpacing = '0px';
	const fit = (s: string, max: number) => {
		if (ctx.measureText(s).width <= max) return s;
		let t = s;
		while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
		return `${t.trimEnd()}…`;
	};
	const chipAt = (x: number, y: number, h: number, w: number, fill: string, stroke?: string) => {
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, 3);
		if (fill !== 'transparent') {
			ctx.fillStyle = fill;
			ctx.fill();
		}
		if (stroke) {
			ctx.strokeStyle = stroke;
			ctx.lineWidth = 1.4;
			ctx.stroke();
		}
	};
	ctx.fillStyle = C.bg!;
	ctx.fillRect(0, 0, W, H);
	const tb = 64;
	ctx.strokeStyle = C.ink!;
	ctx.lineWidth = 2;
	ctx.strokeRect(padX, tb / 2 - 8, 18, 16);
	ctx.fillStyle = C.ink!;
	ctx.fillRect(padX, tb / 2 - 8, 18, 4);
	ctx.font = f(22, 500);
	const title = fit(a.title!, 460);
	ctx.fillText(title, padX + 32, tb / 2);
	const tx = padX + 32 + ctx.measureText(title).width + 14;
	if (a.tag!.trim()) {
		ctx.font = f(15);
		const tw = ctx.measureText(a.tag!).width;
		chipAt(tx, tb / 2 - 15, 30, tw + 20, C.chip!);
		ctx.fillStyle = C.muted!;
		ctx.fillText(a.tag!, tx + 10, tb / 2);
	}
	ctx.strokeStyle = C.muted!;
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	const gx = W - padX - 10;
	ctx.beginPath();
	ctx.moveTo(gx - 7, tb / 2 - 7);
	ctx.lineTo(gx + 7, tb / 2 + 7);
	ctx.moveTo(gx + 7, tb / 2 - 7);
	ctx.lineTo(gx - 7, tb / 2 + 7);
	ctx.moveTo(gx - 52, tb / 2 + 5);
	ctx.lineTo(gx - 40, tb / 2 + 5);
	ctx.moveTo(gx - 24, tb / 2 + 1);
	ctx.lineTo(gx - 24, tb / 2 + 6);
	ctx.lineTo(gx - 19, tb / 2 + 6);
	ctx.moveTo(gx - 17, tb / 2 - 6);
	ctx.lineTo(gx - 12, tb / 2 - 6);
	ctx.lineTo(gx - 12, tb / 2 - 1);
	ctx.stroke();
	ctx.fillStyle = C.line!;
	ctx.fillRect(0, tb, W, 1.5);
	let y = tb + 30;
	const inner = W - padX * 2;
	{
		let x = padX;
		for (const [key, val] of parts(a.fields!, 2)) {
			ctx.font = f(17);
			const kw = ctx.measureText(key!).width;
			const vw = ctx.measureText(val!).width;
			const w = kw + vw + (val ? 30 : 22);
			if (x + w > W - padX) break;
			chipAt(x, y, 40, w, 'transparent', C.chipEdge);
			ctx.fillStyle = C.muted!;
			ctx.fillText(key!, x + 11, y + 20);
			ctx.fillStyle = C.ink!;
			ctx.fillText(val!, x + 11 + kw + 8, y + 20);
			x += w + 10;
		}
		y += 62;
	}
	if (a.task!.trim()) {
		ctx.fillStyle = C.accent!;
		ctx.fillRect(padX, y + 7, 10, 10);
		ctx.fillStyle = C.ink!;
		ctx.font = f(21);
		ctx.fillText(fit(a.task!, inner - 24), padX + 22, y + 12);
		y += 44;
	}
	{
		ctx.strokeStyle = C.muted!;
		ctx.lineWidth = 1.6;
		for (let i = 0; i < 4; i++) {
			ctx.beginPath();
			ctx.moveTo(padX, y + 22 - i * 4);
			ctx.quadraticCurveTo(padX + 8 + i * 2, y + 18 - i * 4, padX + 14 + i, y + 4);
			ctx.stroke();
		}
		ctx.fillStyle = C.muted!;
		ctx.font = f(18);
		ctx.fillText('Found in', padX + 30, y + 14);
		let x = padX + 30 + ctx.measureText('Found in').width + 18;
		for (const raw of split(a.sources!, /,/)) {
			const on = raw.endsWith('*');
			const name = raw.replace(/\*$/, '').trim();
			ctx.font = f(17);
			const w = ctx.measureText(name).width + (on ? 44 : 26);
			if (x + w > W - padX) break;
			chipAt(x, y - 4, 36, w, C.chip!);
			ctx.fillStyle = on ? C.ink! : name.startsWith('+') ? C.faint! : C.muted!;
			ctx.fillText(name, x + 13, y + 14);
			if (on) {
				ctx.fillStyle = C.accent!;
				ctx.fillRect(x + w - 21, y + 10, 8, 8);
			}
			x += w + 8;
		}
		y += 50;
	}
	{
		const s = 4.6;
		const g = 2.6;
		const rows = 5;
		const cols = Math.floor(inner / (s + g));
		const seed = hash(a.found! + a.task!);
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const n = (Math.imul(seed ^ (r * 131 + c * 7919), 2654435761) >>> 0) % 1000;
				ctx.fillStyle = n < 6 ? C.accent! : C.chipEdge!;
				ctx.fillRect(padX + c * (s + g), y + r * (s + g), s, s);
			}
		}
		y += rows * (s + g) + 18;
	}
	if (a.found!.trim()) {
		ctx.font = f(17);
		const m = a.found!.match(/^(\S+)(.*)$/);
		const first = m?.[1] ?? a.found!;
		ctx.fillStyle = C.accent!;
		ctx.fillText(first, padX, y + 10);
		ctx.fillStyle = C.muted!;
		ctx.fillText(m?.[2] ?? '', padX + ctx.measureText(first).width, y + 10);
		y += 30;
	}
	if (a.kinds!.trim()) {
		ctx.font = f(15);
		ctx.fillStyle = C.muted!;
		ctx.fillText(fit(a.kinds!, inner), padX, y + 8);
		y += 30;
	}
	const statsH = 70;
	ctx.fillStyle = C.line!;
	ctx.fillRect(padX, y + 6, inner, 1.5);
	y += 24;
	if (a.section!.trim()) {
		ctx.font = f(17);
		ctx.fillStyle = C.muted!;
		ctx.fillText(a.section!, padX, y + 12);
		y += 38;
	}
	const list = parts(a.rows!, 3);
	const room = H - statsH - y;
	const rh = Math.max(40, Math.min(60, room / Math.max(1, list.length)));
	list.forEach(([name, what, src], i) => {
		if (y + rh > H - statsH + 4) return;
		const mid = y + rh / 2;
		ctx.font = f(15);
		const sw = src ? ctx.measureText(src).width + 26 : 0;
		if (src) {
			chipAt(W - padX - sw, mid - 18, 36, sw, C.chip!);
			ctx.fillStyle = C.ink!;
			ctx.fillText(src, W - padX - sw + 13, mid);
		}
		ctx.font = f(21);
		ctx.fillStyle = C.ink!;
		const nt = fit(name!, inner * 0.4);
		ctx.fillText(nt, padX, mid);
		const nw = ctx.measureText(nt).width;
		ctx.font = f(16);
		ctx.fillStyle = C.soft!;
		ctx.fillText(fit(what!, inner - nw - sw - 40), padX + nw + 16, mid);
		if (i < list.length - 1) {
			ctx.fillStyle = C.line!;
			ctx.fillRect(padX - 10, y + rh, inner + 20, 1.2);
		}
		y += rh;
	});
	ctx.fillStyle = C.line!;
	ctx.fillRect(0, H - statsH, W, 1.5);
	let sx = padX;
	ctx.font = f(15);
	for (const s of split(a.stats!, /\n|\|/)) {
		const w = ctx.measureText(s).width + 18;
		if (sx + w > W - padX) break;
		chipAt(sx, H - statsH / 2 - 16, 32, w, C.chip!);
		ctx.fillStyle = C.muted!;
		ctx.fillText(s, sx + 9, H - statsH / 2);
		sx += w + 8;
	}
	ctx.restore();
}

/* The stand-in product scene for the feature window: the brand's own red room, stacks and the agent panel, at the
   playground scenes' 1600 by 719. Used when no --image is passed. */
let sceneCache: Promise<Pic> | undefined;
export function standInScene(): Promise<Pic> {
	sceneCache ??= (async () => {
		const W = 1600;
		const H = 719;
		const { canvas, ctx } = scratch(W, H);
		ctx.fillStyle = color(imageDoc().themes.red!.bg);
		ctx.fillRect(0, 0, W, H);
		drawRoom(ctx, W, H, 1.2, 30, 4, color(imageDoc().themes.red!.room));
		for (const s of [stack('stack-tall', 0.16, 0.3, 0.42), stack('stack-tall', 0.84, 0.3, 0.42, { flip: true }), stack('stack-wide', 0.17, 0.78, 0.5), stack('stack-wide', 0.83, 0.78, 0.5, { flip: true })]) await drawSticker(ctx, s, H, W, H);
		const pw = 0.86 * H * (APP_W / APP_H);
		const k = pw / APP_W;
		const px = (W - pw) / 2;
		const py = (H - APP_H * k) / 2;
		ctx.save();
		ctx.shadowColor = color(`${imageDoc().window.shadow}/0.19`);
		ctx.shadowBlur = 40;
		ctx.shadowOffsetY = 14;
		ctx.fillStyle = color(imageDoc().panel.colors.bg!);
		ctx.fillRect(px, py, pw, APP_H * k);
		ctx.restore();
		ctx.save();
		ctx.translate(px, py);
		ctx.scale(k, k);
		drawPanel(ctx);
		ctx.restore();
		return { img: canvas, w: W, h: H };
	})();
	return sceneCache;
}

/** Draws a design onto a context sized to the design's own frame. */
export async function drawDesign(ctx: Ctx, d: Design, picture: Pic | null, mo?: Motion) {
	const { w: W, h: H } = d;
	const u = unitOf(W, H);
	const S = Math.min(W, H);
	const C = colorsOf(d);
	ctx.globalAlpha = 1;
	ctx.letterSpacing = '0px';
	ctx.fillStyle = C.bg;
	ctx.fillRect(0, 0, W, H);
	if (d.room) drawRoom(ctx, W, H, u, d.roomScale, d.roomFade, C.room);
	if (d.pattern !== 'none') {
		const alpha = Math.min(1, C.tileAlpha * (d.tileStrength / 100));
		const th = d.tileSize * u;
		if (d.pattern === 'full') {
			ctx.fillStyle = C.tile;
			ctx.globalAlpha = alpha;
			tileWords(ctx, { x: 0, y: 0, w: W, h: H }, d.tileSize, u, d.tileStagger, 0, -th * 0.4);
		} else {
			let r: Rect;
			const m = 40 * u;
			if (d.panelSide === 'bottom') {
				const top = d.panelTop * H;
				r = { x: m, y: top, w: W - 2 * m, h: H - top + 2 - m };
			} else {
				const pw = panelWidth(d.panelCols, d.tileSize, u);
				r = { x: d.panelSide === 'right' ? W - m - pw : m, y: -22 * u, w: pw, h: H + 44 * u };
			}
			ctx.save();
			ctx.beginPath();
			ctx.rect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
			ctx.clip();
			ctx.fillStyle = C.tile;
			ctx.globalAlpha = alpha;
			tileWords(ctx, r, d.tileSize, u, d.tileStagger, r.x + 13 * u, r.y + 1 * u);
			ctx.restore();
			ctx.globalAlpha = 1;
			if (d.panelBorder) {
				ctx.strokeStyle = C.border;
				ctx.lineWidth = Math.max(1, u);
				ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
			}
		}
		ctx.globalAlpha = 1;
	}
	if (d.outline) {
		const L = logoDoc().wordmark;
		const bh = d.outlineSize * u;
		const k = bh / L.h;
		const bw = L.w * k;
		const gap = bh * 0.12;
		const top = d.outlineY * H - bh;
		let x0 = W / 2 - bw / 2;
		while (x0 > -bw) x0 -= bw + gap;
		for (let x = x0; x < W; x += bw + gap) {
			ctx.save();
			ctx.translate(x, top);
			ctx.scale(k, k);
			ctx.fillStyle = C.bg;
			ctx.fill(wordmarkPath());
			ctx.strokeStyle = C.line;
			ctx.lineWidth = (d.outlineStroke * u) / k;
			ctx.stroke(wordmarkPath());
			ctx.restore();
		}
	}
	if (d.hatch === 'floor') {
		const g = d.hatchGap * u;
		const lw = Math.max(0.5, u);
		const hy = d.hatchY * H;
		ctx.strokeStyle = C.line;
		ctx.lineWidth = lw;
		ctx.fillStyle = C.bg;
		ctx.fillRect(0, hy, W, H - hy);
		hatchLines(ctx, { x: 0, y: hy, w: W, h: H - hy }, g, d.hatchAngle);
		ctx.fillStyle = C.line;
		ctx.fillRect(0, hy, W, lw);
	}
	if (d.guides) {
		const gi = d.guideInset * u;
		const gw = Math.max(0.5, u);
		ctx.fillStyle = C.line;
		ctx.fillRect(gi, 0, gw, H);
		ctx.fillRect(W - gi - gw, 0, gw, H);
	}
	drawFrame(ctx, d, u, W, H, C.bg);

	const size = fittedSize(ctx, d, u, C.bg);
	let laid = drawWords(ctx, d, size, C.ink, C.hi, C.dark, C.bg, true);
	const dw = d.textMiddle ? { ...d, textY: d.textY - laid.h / 2 / H } : d;
	if (d.textMiddle) laid = drawWords(ctx, dw, size, C.ink, C.hi, C.dark, C.bg, true);
	const winTop = d.window === 'none' ? null : d.winFollow ? laid.y + laid.h + d.winGap * u : d.winY * H;

	if (mo) mo = { ...mo, u };
	for (const [i, s] of d.stickers.entries()) if (s.behind) await settleAsync(ctx, mo, T.stickers + i * 0.06, () => drawSticker(ctx, s, S, W, H));
	const pic = d.window === 'picture' ? picture ?? (await standInScene()) : null;
	let win: Rect | null = null;
	if (winTop !== null) {
		/* A window arrives on the windows' long ease-out (viz-card). */
		const p = mo ? progress(mo.t, T.window, duration('viz-card'), 'viz') : 1;
		ctx.save();
		ctx.globalAlpha = p;
		ctx.translate(0, (1 - p) * 40 * u);
		win = drawWindow(ctx, dw, u, pic, C.line, winTop);
		ctx.restore();
	}
	const text = drawWords(ctx, dw, size, C.ink, C.hi, C.dark, C.bg, false, mo);
	const logo = withSettle(ctx, mo, T.logo, () => drawLogoRow(ctx, d, u, C.ink));
	if (d.badgeAt === 'corner') {
		const fs = 19 * u * (d.badgeScale / 100);
		const b = drawBadge(ctx, d, 0, 0, fs, C.ink, C.hi, C.dark, true, C.bg);
		if (b.w) withSettle(ctx, mo, T.badge, () => drawBadge(ctx, d, d.badgeX * W - b.w, d.badgeY * H - b.h / 2, fs, C.ink, C.hi, C.dark, false, C.bg));
	}
	if (d.foot) withSettle(ctx, mo, T.foot, () => drawFoot(ctx, d, u, W, H, C.ink));
	for (const [i, s] of d.stickers.entries()) if (!s.behind) await settleAsync(ctx, mo, T.stickers + i * 0.06, () => drawSticker(ctx, s, S, W, H));
	return { text, logo, window: win };
}

export type OgRender = { png?: Buffer; svg?: string; rgb?: Buffer; width: number; height: number };

/** One design as PNG and, when asked, SVG (the same drawing through Skia's SVG backend). */
export async function renderDesign(d: Design, picture: Pic | null, opts: { png?: boolean; svg?: boolean; rgb?: boolean } = { png: true }): Promise<OgRender> {
	const out: OgRender = { width: d.w, height: d.h };
	if (opts.png !== false || opts.rgb) {
		const s = surface(d.w, d.h);
		await drawDesign(s.ctx, d, picture);
		if (opts.png !== false) out.png = toPng(s, { opaque: true });
		if (opts.rgb) out.rgb = rgbOf(s).rgb;
	}
	if (opts.svg) {
		const s = surface(d.w, d.h, { svg: true });
		await drawDesign(s.ctx, d, picture);
		out.svg = toSvg(s);
	}
	return out;
}

export const sizeIds = () => Object.keys(imageDoc().sizes);
/** A size by id, alias or WxH. */
export function sizeOf(id: string): (SizeDoc & { id: string }) | undefined {
	const n = id.trim().toLowerCase().replace('×', 'x').replace(/\s+/g, '');
	for (const [k, v] of Object.entries(imageDoc().sizes)) if (k === n || v.aliases?.includes(n) || `${v.w}x${v.h}` === n) return { id: k, ...v };
	return undefined;
}

/** How long the animated version runs: until the last part has settled, then a 1.5 second hold. */
export function motionLength(d: Design): number {
	const { ctx } = scratch(4, 4);
	const u = unitOf(d.w, d.h);
	const C = colorsOf(d);
	const size = fittedSize(ctx, d, u, C.bg);
	ctx.font = font('display', 400, size);
	ctx.letterSpacing = `${(d.tracking / 1000) * size}px`;
	const lines = d.headline.split('\n').flatMap((l) => wrapWords(ctx, parseLine(l), d.textWidth * d.w));
	ctx.letterSpacing = '0px';
	const head = revealEnd({ t: 0 }, lines.map((l) => l.words.map((w) => w.text).join(' ').length));
	const rest = Math.max(T.foot + duration('entrance'), d.window !== 'none' ? T.window + duration('viz-card') : 0, T.stickers + d.stickers.length * 0.06 + duration('entrance'));
	return Math.round((Math.max(head, rest) + 1.5) * 10) / 10;
}
