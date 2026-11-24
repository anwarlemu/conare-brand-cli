import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import type { Anchor, Rect } from '../design/types.js';
import { PLATFORMS, platformOf, sizeAlias, zonePx } from '../design/platforms.js';
import type { FaceRole } from './glyphs.js';

// The share images' rules: the brand's part (brand/assets/image.json), the sizes with the platforms' safe areas, and
// what each layout asks for at a size (ported from the agd-playground posts tool's layouts.ts). Everything that must
// be seen is placed in a size's frame; grounds and patterns fill the whole canvas.

export type ThemeDoc = { label: string; bg: string; ink: string; muted: string; line: string; tile: string; tileAlpha: number; border: string; room: string; dark: boolean; onAccent?: { highlight?: string; badgeFill?: string; badgeInk?: string } };
export type Sample = { headline?: string; body?: string; badge?: string; partner?: string; note?: string };
type TemplateDoc = { label: string; description: string; theme: string; badge: BadgeStyle; sample: Sample };
type SizeDoc = { w?: number; h?: number; label?: string; frame?: number[]; safe?: number[]; clear?: number[]; shown?: number; avoid?: number[][]; limitMb?: number; note?: string };
export type ImageDoc = {
	themes: Record<string, ThemeDoc>;
	tones: Record<string, string>;
	highlights: Record<string, string>;
	highlightAlt: Record<string, string>;
	accent: string;
	accentSmall: string;
	address: string;
	art: Record<string, string>;
	window: { bg: string; placeholder: string; shadow: string };
	panel: { colors: Record<string, string>; content: Record<string, string> };
	templates: Record<string, TemplateDoc>;
	sizes: Record<string, SizeDoc>;
	sizeAliases: Record<string, string>;
	custom: { min: number; max: number; ratio: [number, number] };
	notes: string[];
};

let doc: ImageDoc | undefined;
export const imageDoc = (): ImageDoc => (doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'image.json'), 'utf8')) as ImageDoc);

export const LAYOUTS = ['hero', 'brief', 'tile', 'app', 'outline', 'hatch', 'room', 'feature', 'partner', 'funding', 'announce', 'card', 'avatar'] as const;
export type Layout = (typeof LAYOUTS)[number];
export type BadgeStyle = 'label' | 'pill' | 'solid' | 'dot' | 'none';
export const BADGES: BadgeStyle[] = ['label', 'pill', 'solid', 'dot', 'none'];
export type Align = 'left' | 'center' | 'right';

/* ------------------------------------------------------------ sizes */

/** A size ready to draw on: the canvas, the frame everything seen stays in, what the platform covers, and how wide it is shown. */
export type Size = { id: string; w: number; h: number; label: string; frame: Rect; /** The frame clear of everything the platform covers (for engines that do not place round it). */ clear?: Rect; safe: Rect; avoid: Rect[]; shown: number; note?: string; /** The largest file the platform takes, in bytes. */ limit?: { bytes: number; official: boolean } };

const rect = (a: number[]): Rect => ({ x: a[0]!, y: a[1]!, w: a[2]!, h: a[3]! });

function sizeFrom(id: string): Size {
	const own = imageDoc().sizes[id] ?? {};
	const base = PLATFORMS.find((x) => x.id === id) ?? platformOf(id, own.w!, own.h!);
	/* A size of this brand's own (an ad, a wallpaper) brings its own shown width, covered parts and note. */
	const p = PLATFORMS.some((x) => x.id === id) ? base : { ...base, label: own.label ?? base.label, shown: Math.min(own.shown ?? base.shown, base.shown) /* the shared check reads sizes it does not know as shown at least 540 px wide */, avoid: (own.avoid ?? []).map((a) => ({ name: 'what the platform covers', official: false, rect: { x: a[0]! / base.width, y: a[1]! / base.height, w: a[2]! / base.width, h: a[3]! / base.height } })), note: own.note, ...(own.limitMb ? { limit: { bytes: own.limitMb * 1048576, official: false } } : {}) };
	const full = { x: 0, y: 0, w: p.width, h: p.height };
	const frame = own.frame ? rect(own.frame) : full;
	return { id, w: p.width, h: p.height, label: own.label ?? p.label, frame, ...(own.clear ? { clear: rect(own.clear) } : {}), safe: own.safe ? rect(own.safe) : frame, avoid: p.avoid.map((z) => zonePx(z, p.width, p.height)), shown: p.shown, note: p.avoid.length || p.safe || own.note ? p.note : undefined, limit: p.limit };
}

export const sizeIds = () => [...PLATFORMS.map((p) => p.id), ...Object.keys(imageDoc().sizes).filter((k) => k !== '$comment' && !PLATFORMS.some((p) => p.id === k))];

/** A size of the person's own: no platform, so no safe area. */
export function customSize(w: number, h: number): Size {
	const c = imageDoc().custom;
	if (![w, h].every((n) => Number.isInteger(n) && n >= c.min && n <= c.max)) throw new Error(`A custom size takes whole numbers from ${c.min} to ${c.max} px, not ${w}x${h}.`);
	if (w / h < c.ratio[0] || w / h > c.ratio[1]) throw new Error(`A custom size goes from ${c.ratio[0]} to ${c.ratio[1]} wide for its height; ${w}x${h} is ${(w / h).toFixed(2)}.`);
	const full = { x: 0, y: 0, w, h };
	return { id: 'custom', w, h, label: `Custom ${w}x${h}`, shown: platformOf('custom', w, h).shown, frame: full, safe: full, avoid: [] };
}

/** A size by id, another name for it or WxH (a WxH no platform has is a custom size). */
export function sizeOf(id: string): Size | undefined {
	const n = id.trim().toLowerCase().replace('×', 'x').replace(/\s+/g, '');
	const hit = sizeIds().includes(n) ? n : (sizeAlias(id) ?? imageDoc().sizeAliases[n]);
	if (hit) return sizeFrom(hit);
	const m = /^(\d+)x(\d+)$/.exec(n);
	if (!m) return undefined;
	const [w, h] = [Number(m[1]), Number(m[2])];
	const same = sizeIds().find((k) => k !== 'avatar' && sizeFrom(k).w === w && sizeFrom(k).h === h);
	return same ? sizeFrom(same) : customSize(w, h);
}

/**
 * The box a layout's type and spacing are scaled to: the whole canvas, as the posts tool scales them at that size,
 * except where only a middle crop is seen everywhere (YouTube's channel art), which is then the canvas.
 */
export const scaleBox = (s: Pick<Size, 'w' | 'h' | 'frame'>) => (s.frame.x > 0 && s.frame.y > 0 && s.frame.h < s.h * 0.5 ? { w: s.frame.w, h: s.frame.h } : { w: s.w, h: s.h });

/** Pages and cards for print, and the signature strip: `print`, `email` and compose make them, not the share layouts. */
export const PRINT_SIZES = ['a4', 'letter', 'business-card', 'email-signature'];

/** Sizes a layout draws at. The profile picture takes the mark alone; nothing else fits a circle that small. Hatch's box,
 * the app and feature windows and the hollow wordmark need more height than a 50 px strip has. A video call background keeps its words to the top
 * band over the person, where the layouts whose art is a window or the hollow wordmark have no room for it. */
export function sizesFor(t: Layout): string[] {
	if (t === 'avatar') return ['avatar'];
	return sizeIds().filter((id) => id !== 'avatar' && !PRINT_SIZES.includes(id) && !(['hatch', 'app', 'outline', 'feature'].includes(t) && (sizeOf(id)?.h ?? 100) < 60) && !(id === 'meeting' && ['app', 'feature', 'outline', 'hatch'].includes(t)));
}

/* One unit: a pixel of the 1200 x 630 link preview, grown with the area. */
export const unitOf = (W: number, H: number) => Math.sqrt((W * H) / (1200 * 630));

/** The smallest a word may be at a size, so it is read at the width the platform shows the image: 8 px there. */
export const smallFloor = (w: number, shown: number) => (8 * w) / shown;
/** Type that counts as large for contrast: 24 px where the image is shown (the shared check's line). */
export const largeType = (w: number, shown: number) => (24 * w) / shown;
/** The lockup's legible height at a size: 12 px as shown. */
export const logoFloor = (w: number, shown: number) => (12 * w) / shown;

/* ---------------------------------------------------------- layouts */

export type Spec = {
	align: Align;
	valign: 'top' | 'middle' | 'bottom';
	/** Headline px, and its width as a share of the frame. */
	size: number;
	width: number;
	tracking: number;
	leading: number;
	/** The share of the zone's height the words may take before they shrink (0: all of it). */
	limit: number;
	bodyRatio: number;
	bodyLeading: number;
	bodyGap: number;
	bodyWidth: number;
	badgeAt: 'words' | 'corner';
	badgeRatio: number;
	badgeFont: FaceRole;
	badgeWeight: number;
	badgeTracking: number;
	badgeRound: number;
	badgeGap: number;
	logo: { at: Anchor | 'above'; h: number; word: boolean } | null;
	foot: boolean;
	footSize: number;
	footRule: boolean;
	margin: number;
	room: { min: number; rings: number } | null;
	guides: number | null;
	border: { kind: 'line' | 'solid'; px: number; tone: string } | null;
	pattern: 'panel' | 'full' | null;
	patternTile: number;
	patternStrength: number;
	/** How far the headline may grow past its size to fill the room the layout gives it (a banner's height). */
	fill: number;
	wordmark: boolean;
	/** The hollow wordmark's height (the posts tool's 150 px at the link preview, grown with the area). */
	wordmarkH: number;
	floor: number | null;
	window: 'app' | 'picture' | null;
	/** Window beside the words (a wide banner), not under them. */
	split: boolean;
	/** The window's width in the posts tool, as a share of the scale box; a window that cannot be whole at it runs off the foot and fades. */
	winW: number;
	stacks: 'corners' | 'lower' | 'side' | 'panel' | 'floor' | null;
	stackScale: number;
};

/** What a layout asks for in a frame (px of the canvas). */
export function specFor(t: Layout, fw: number, fh: number): Spec {
	const u = unitOf(fw, fh);
	const S = Math.min(fw, fh);
	const r = fw / fh;
	const wide = r >= 1.4;
	const banner = r >= 2.4;
	const ultra = r >= 3.9;
	const tall = fh / fw > 1.15;
	const hk = banner ? Math.min(1, fh / (500 * u)) : 1;
	const m = ultra ? Math.min(44 * u, fh * 0.13) : (banner ? 48 : 44) * u * (banner ? hk : 1);
	const lockH = 30 * hk * u;
	/* A strip's headline grows with its height; the layouts' own numbers are for a 500 px tall banner. */
	const head = (px: number) => px * hk * u;
	const side: Anchor = 'right';
	const base: Spec = {
		align: 'left', valign: 'middle', size: head(62), width: 0.66, tracking: -20, leading: 1.08, limit: 0, bodyRatio: 0.34, bodyLeading: 1.45,
		bodyGap: 34, bodyWidth: 0, badgeAt: 'words', badgeRatio: 0.177, badgeFont: 'text', badgeWeight: 500, badgeTracking: 60, badgeRound: -1, badgeGap: 21,
		logo: null, foot: false, footSize: 15 * hk * u, footRule: true, margin: m, room: null, guides: null, border: null, pattern: null, patternTile: 40 * u,
		patternStrength: 100, fill: banner ? 1.7 : 1, wordmark: false, wordmarkH: 150 * hk * u, floor: null, window: null, split: false, winW: 0.8, stacks: null, stackScale: 1,
	};
	const ring = { min: 0.34, rings: 4 };
	switch (t) {
		case 'hero':
			return {
				...base, align: ultra ? 'left' : 'center', size: head(tall ? 78 : banner ? 52 : wide ? 62 : 70), width: banner ? 0.62 : tall ? 0.82 : wide ? 0.66 : 0.76,
				badgeRatio: 0.152, bodyRatio: 0.3, bodyWidth: tall ? 0.78 : wide && !banner ? 0.56 : banner ? 0 : 0.7, guides: banner ? null : 48 * u,
				logo: { at: ultra ? side : banner ? 'top-left' : 'top', h: lockH, word: true }, foot: !banner, margin: banner ? m : m + 48 * u,
			};
		case 'brief':
			return {
				...base, size: head(tall ? 76 : banner ? 50 : wide ? 60 : 68), width: banner ? 0.62 : tall ? 0.86 : wide ? 0.7 : 0.84, bodyRatio: 0.292,
				bodyWidth: banner ? 0 : tall ? 0.8 : wide ? 0.56 : 0.74, badgeAt: ultra ? 'words' : 'corner', badgeFont: 'mono', badgeWeight: 400, badgeTracking: 80, badgeRatio: 0.23,
				logo: { at: ultra ? side : 'top-left', h: lockH, word: true }, foot: !ultra, footSize: 14 * hk * u, margin: ultra ? m : (banner ? 44 * hk : 56) * u,
			};
		case 'card': {
			const mm = ultra ? m : Math.min(71 * u, 0.09 * S);
			const q = mm / 98;
			return {
				...base, size: ultra ? head(52) : 108 * q * (wide && !banner ? 1 : 1), width: 1, tracking: -22, leading: 1.06, bodyRatio: 0.367, bodyGap: 38, bodyWidth: banner ? 0 : 0.86,
				badgeAt: ultra ? 'words' : 'corner', badgeFont: 'mono', badgeWeight: 500, badgeTracking: 90, badgeRound: 8, badgeRatio: 22 / 108,
				logo: { at: ultra ? side : 'top-left', h: ultra ? lockH : 46 * q, word: true }, foot: !ultra, footSize: 24 * q, margin: mm,
			};
		}
		case 'room':
			return {
				...base, align: 'center', size: head(tall ? 84 : banner ? 56 : wide ? 70 : 76), width: banner ? 0.62 : tall ? 0.78 : 0.64, limit: 0.94, tracking: -16, room: ring,
				logo: banner ? { at: 'left', h: fh * 0.3, word: false } : { at: 'above', h: head(tall ? 62 : 48), word: false }, ...(banner ? { align: 'left' as const } : {}), stacks: banner ? 'side' : 'corners', stackScale: 0.9,
			};
		case 'funding':
			return {
				...base, align: banner ? 'left' : 'center', size: head(tall ? 132 : banner ? 74 : wide ? 104 : 112), width: tall ? 0.8 : banner ? 0.62 : 0.68, badgeRatio: 0.14, room: { min: 0.4, rings: 4 },
				logo: banner ? { at: 'left', h: fh * 0.3, word: false } : { at: 'top', h: head(tall ? 56 : 40), word: false }, stacks: banner ? 'side' : 'corners', stackScale: 0.9,
			};
		case 'app':
			return {
				...base, fill: banner ? 1.4 : 1, align: 'center', valign: 'top', size: head(tall ? 72 : banner ? 46 : wide ? 52 : 60), width: banner ? 0.62 : 0.84, limit: banner ? 0.46 : 0.46,
				badgeRatio: 0.17, room: { min: 0.3, rings: 4 }, window: 'app', split: false, winW: tall ? 0.9 : banner ? 0.5 : wide ? 0.66 : 0.84, stacks: 'lower', stackScale: 0.85,
				margin: tall ? m + 24 * u : m,
			};
		case 'feature':
			return {
				...base, fill: r >= 2.4 ? 1.4 : 1, align: r >= 2.2 ? 'left' : 'center', valign: r >= 2.2 ? 'middle' : 'top', size: head(tall ? 76 : banner ? 46 : wide ? 52 : 62), width: 0.84, limit: r >= 2.2 ? 0 : 0.52,
				badgeRatio: 0.183, bodyRatio: 0.306, window: 'picture', split: r >= 2.2, winW: tall ? 0.96 : banner ? 0.5 : wide ? 0.86 : 0.92, guides: r >= 2.2 ? null : 24 * u, margin: tall ? m + 24 * u : m,
			};
		case 'outline':
			return { ...base, align: ultra ? 'left' : 'center', size: head(banner ? 60 : 68), width: banner ? 0.8 : 0.84, badgeRatio: 0.16, wordmark: true };
		case 'tile':
			return {
				...base, valign: 'middle', size: head(banner ? 54 : 64), width: 1, badgeRatio: 0.17, pattern: 'panel', patternTile: 40 * u * hk,
				logo: banner ? null : { at: 'top-left', h: lockH, word: true }, stacks: 'panel',
			};
		case 'hatch':
			return {
				...base, align: 'right', valign: 'middle', size: head(banner ? 54 : 64), width: 0.62, badgeRatio: 0.17, floor: 150 * u * hk,
				logo: ultra ? null : { at: 'top-left', h: lockH, word: true }, stacks: 'floor',
			};
		case 'partner':
			return {
				...base, align: 'center', size: head(tall ? 72 : wide ? 54 : 62), width: 0.84, badgeRatio: 0.17, pattern: 'full', patternTile: 34 * hk * u, patternStrength: 35,
				border: { kind: 'line', px: 30 * hk * u, tone: 'grey' }, logo: ultra ? { at: side, h: head(36), word: true } : { at: 'above', h: head(40), word: true }, ...(ultra ? { align: 'left' as const } : {}),
			};
		case 'announce':
			return {
				...base, valign: 'top', size: head(tall ? 96 : banner ? 56 : wide ? 72 : 78), width: banner ? 0.9 : 0.9, badgeFont: 'text', badgeRatio: 0.177,
				border: { kind: 'solid', px: 34 * hk * u, tone: 'red' }, logo: { at: ultra ? side : banner ? 'top-right' : 'bottom-left', h: lockH, word: true },
			};
		case 'avatar':
			return { ...base, logo: { at: 'center', h: S * 0.42, word: false } };
	}
}
