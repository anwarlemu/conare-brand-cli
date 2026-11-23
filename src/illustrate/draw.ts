import { readFileSync } from 'node:fs';
import type { Canvas } from '@napi-rs/canvas';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { color, surface, toPng, toSvg, type Ctx } from '../assets/canvas.js';
import { pick } from '../assets/io.js';
import { APP_H, APP_W, drawRoom, hatchLines, imageDoc, roomStacks, tileWords, unitOf, wallOf, type Pic } from '../assets/og.js';
import { drawPanel } from '../assets/panel.js';
import { logoDoc, wordmarkPath } from '../assets/art.js';

// The brand's illustration style as vector drawing calls (brand/assets/illustrate.json, rules in
// brand/illustration.md): stacks of documents with the red pixel grid, the perspective room, the wordmark tile and the
// hollow wordmark, hatching, the strip of documents searched and the agent window. Drawn through the canvas, so the
// same calls give a PNG and an SVG of real vector shapes.

type Box = { w: number; h: number; grid: 'top-left' | 'top-right'; step?: [number, number] };
type IllustrateDoc = {
	pixels: { pattern: string[]; red: string; pale: string; gap: number };
	stack: { sheet: string; edge: string; edgeBack: string; sheets: number; step: [number, number]; frames: number; frameStep: number; tall: Box; wide: Box };
	subjects: Record<string, string>;
	defaults: { theme: string; size: [number, number] };
};

let doc: IllustrateDoc | undefined;
export const illustrateDoc = (): IllustrateDoc => (doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'illustrate.json'), 'utf8')) as IllustrateDoc);
export const SUBJECTS = () => Object.keys(illustrateDoc().subjects);

function rng(seed: number) {
	let a = seed >>> 0 || 1;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** The pixel grid's cells: the brand's own pattern, or with a seed the same cells reshuffled. */
export function pixelCells(seed?: number): boolean[][] {
	const rows = illustrateDoc().pixels.pattern.map((r) => [...r].map((c) => c === 'R'));
	if (!seed) return rows;
	const flat = rows.flat();
	const r = rng(seed);
	for (let i = flat.length - 1; i > 0; i--) {
		const j = Math.floor(r() * (i + 1));
		[flat[i], flat[j]] = [flat[j]!, flat[i]!];
	}
	const n = rows[0]!.length;
	return rows.map((_, i) => flat.slice(i * n, i * n + n));
}

/** The red pixel grid, `size` square at x, y. */
export function drawPixels(ctx: Ctx, x: number, y: number, size: number, seed?: number) {
	const P = illustrateDoc().pixels;
	const cells = pixelCells(seed);
	const n = cells.length;
	const cs = size / n;
	const g = cs * P.gap;
	cells.forEach((row, r) =>
		row.forEach((on, c) => {
			ctx.fillStyle = color(on ? P.red : P.pale);
			ctx.fillRect(x + c * cs + g / 2, y + r * cs + g / 2, cs - g, cs - g);
		}),
	);
}

/** Width over height of a stack's box (the art files' 412 by 498 and 626 by 336). */
export const stackRatio = (shape: 'tall' | 'wide') => (shape === 'tall' ? 412 / 498 : 626 / 336);

/**
 * A stack of documents filling a box `w` wide centered at cx, cy: sheets stepping back behind a front sheet with
 * nested frames and the pixel grid at its corner. `pic` goes on the front sheet, inside the frames.
 */
export function drawStack(ctx: Ctx, cx: number, cy: number, w: number, shape: 'tall' | 'wide', opts: { flip?: boolean; seed?: number; pic?: Pic | null } = {}) {
	const S = illustrateDoc().stack;
	const ref = shape === 'tall' ? { W: 412, H: 498, front: { x: 8, y: 110, w: 257, h: 380 } } : { W: 626, H: 336, front: { x: 8, y: 8, w: 452, h: 200 } };
	const box = S[shape];
	const step = box.step ?? S.step;
	const k = w / ref.W;
	const h = ref.H * k;
	ctx.save();
	ctx.translate(cx - w / 2, cy - h / 2);
	if (opts.flip) {
		ctx.translate(w, 0);
		ctx.scale(-1, 1);
	}
	ctx.scale(k, k);
	const lw = 1;
	ctx.lineWidth = lw;
	for (let i = S.sheets; i >= 1; i--) {
		const x = ref.front.x + step[0] * i;
		const y = ref.front.y + step[1] * i;
		ctx.fillStyle = color(S.sheet);
		ctx.fillRect(x, y, ref.front.w, ref.front.h);
		ctx.strokeStyle = color(S.edgeBack);
		ctx.strokeRect(x + 0.5, y + 0.5, ref.front.w - 1, ref.front.h - 1);
	}
	const f = ref.front;
	ctx.fillStyle = color(S.sheet);
	ctx.fillRect(f.x, f.y, f.w, f.h);
	ctx.strokeStyle = color(S.edge);
	ctx.strokeRect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1);
	ctx.strokeStyle = color(S.edgeBack);
	let inset = 0;
	for (let i = 1; i <= S.frames; i++) {
		inset = S.frameStep * i + (i === S.frames ? S.frameStep : 0);
		ctx.strokeRect(f.x + inset + 0.5, f.y + inset + 0.5, f.w - 2 * inset - 1, f.h - 2 * inset - 1);
	}
	if (opts.pic) {
		const ix = f.x + inset + 1;
		const iy = f.y + inset + 1;
		const iw = f.w - 2 * inset - 2;
		const ih = f.h - 2 * inset - 2;
		ctx.save();
		ctx.beginPath();
		ctx.rect(ix, iy, iw, ih);
		ctx.clip();
		const c = Math.max(iw / opts.pic.w, ih / opts.pic.h);
		if (opts.flip) {
			ctx.translate(ix + iw, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(opts.pic.img, (iw - opts.pic.w * c) / 2, iy + (ih - opts.pic.h * c) / 2, opts.pic.w * c, opts.pic.h * c);
		} else ctx.drawImage(opts.pic.img, ix + (iw - opts.pic.w * c) / 2, iy + (ih - opts.pic.h * c) / 2, opts.pic.w * c, opts.pic.h * c);
		ctx.restore();
	}
	const g = 54;
	const gx = box.grid === 'top-left' ? f.x + 4 : f.x + f.w - g - 4;
	if (opts.flip && box.grid === 'top-right') {
		/* A mirrored stack keeps its grid's cells the right way round. */
		ctx.save();
		ctx.translate(gx + g, 0);
		ctx.scale(-1, 1);
		drawPixels(ctx, 0, f.y + 4, g, opts.seed);
		ctx.restore();
	} else drawPixels(ctx, gx, f.y + 4, g, opts.seed);
	ctx.restore();
	return { w, h };
}

const themeColors = (theme: string) => {
	const t = imageDoc().themes[theme]!;
	return { bg: color(t.bg), ink: color(t.ink), line: color(t.line), tile: color(t.tile), tileAlpha: t.tileAlpha, room: color(t.room), dark: t.dark };
};

export type IllustrateRequest = { subject: string; width: number; height: number; theme?: string; seed?: number; shape?: 'tall' | 'wide'; picture?: Pic | null; transparent?: boolean; sample?: boolean; /** Where a room's back wall stands (the words on it), when not the middle. */ wall?: { x: number; y: number; w: number; h: number } };

const stickerAt = (ctx: Ctx, s: { src: string; x: number; y: number; size: number; flip?: boolean }, S: number, W: number, H: number, seed?: number) => {
	const shape = s.src === 'stack-wide' ? 'wide' : 'tall';
	drawStack(ctx, s.x * W, s.y * H, s.size * S, shape, { flip: s.flip, seed });
};

/** Draws a subject filling the frame. */
export function drawSubject(ctx: Ctx, r: IllustrateRequest) {
	const subject = pick('subject', r.subject, SUBJECTS());
	const theme = pick('theme', r.theme ?? (subject === 'stacks' || subject === 'scene' ? 'red' : illustrateDoc().defaults.theme), Object.keys(imageDoc().themes));
	const C = themeColors(theme);
	const { width: W, height: H } = r;
	const S = Math.min(W, H);
	const u = unitOf(W, H);
	if (!r.transparent) {
		ctx.fillStyle = C.bg;
		ctx.fillRect(0, 0, W, H);
	}
	switch (subject) {
		case 'stack': {
			const shape = r.shape ?? (H > W ? 'tall' : 'wide');
			const fit = Math.min(W * 0.8, H * 0.8 * stackRatio(shape));
			drawStack(ctx, W / 2, H / 2, fit, shape, { seed: r.seed, pic: r.picture });
			break;
		}
		case 'pixels':
			drawPixels(ctx, (W - S * 0.7) / 2, (H - S * 0.7) / 2, S * 0.7, r.seed);
			break;
		case 'room':
			drawRoom(ctx, W, H, u, r.wall ?? wallOf(W, H, 0.34), 4, C.room);
			break;
		case 'stacks':
			drawRoom(ctx, W, H, u, r.wall ?? wallOf(W, H, 0.34), 4, C.room);
			for (const s of roomStacks(W, H, 0.9)) stickerAt(ctx, s, S, W, H, r.seed);
			break;
		case 'tile':
			ctx.fillStyle = C.tile;
			ctx.globalAlpha = Math.min(1, C.tileAlpha * 2);
			tileWords(ctx, { x: 24 * u, y: 24 * u, w: W - 48 * u, h: H - 48 * u }, 40 * u, true);
			ctx.globalAlpha = 1;
			break;
		case 'outline': {
			const L = logoDoc().wordmark;
			const m = 40 * u;
			const bw = Math.min(W - 2 * m, ((H * 0.5) / L.h) * L.w);
			const k = bw / L.w;
			ctx.save();
			ctx.translate((W - bw) / 2, H - m - L.h * k);
			ctx.scale(k, k);
			ctx.strokeStyle = C.line;
			ctx.lineWidth = (1.2 * u) / k;
			ctx.stroke(wordmarkPath());
			ctx.restore();
			break;
		}
		case 'hatch': {
			const floor = H * 0.62;
			ctx.strokeStyle = C.line;
			ctx.lineWidth = Math.max(0.5, u);
			hatchLines(ctx, { x: 0, y: floor, w: W, h: H - floor }, 12 * u, 45);
			ctx.fillStyle = C.line;
			ctx.fillRect(0, floor, W, Math.max(0.5, u));
			drawStack(ctx, W * 0.5, floor - S * 0.1, S * 0.5, 'wide', { seed: r.seed, pic: r.picture });
			break;
		}
		case 'strip': {
			const cols = 48;
			const rows = 12;
			const cell = Math.min((W * 0.86) / cols, (H * 0.6) / rows);
			const s = cell * 0.64;
			const x0 = (W - cols * cell) / 2;
			const y0 = (H - rows * cell) / 2;
			const rnd = rng(r.seed ?? 3);
			const found = new Set<number>();
			while (found.size < 6) found.add(Math.floor(rnd() * cols * rows));
			for (let i = 0; i < cols * rows; i++) {
				ctx.fillStyle = found.has(i) ? color(imageDoc().accent) : C.dark ? color('neutral-300') : C.line;
				ctx.fillRect(x0 + (i % cols) * cell, y0 + Math.floor(i / cols) * cell, s, s);
			}
			break;
		}
		case 'panel':
		case 'scene': {
			if (subject === 'scene') {
				drawRoom(ctx, W, H, u, wallOf(W, H, 0.3), 4, C.room);
				for (const s of [{ src: 'stack-tall', x: 0.1, y: 0.28, size: 0.32 }, { src: 'stack-tall', x: 0.9, y: 0.28, size: 0.32, flip: true }, { src: 'stack-wide', x: 0.1, y: 0.78, size: 0.34 }, { src: 'stack-wide', x: 0.9, y: 0.78, size: 0.34, flip: true }]) stickerAt(ctx, s, Math.min(H, W / 2), W, H, r.seed);
			}
			const pw = Math.min(W * (subject === 'panel' ? 0.9 : 0.62), H * (subject === 'panel' ? 0.9 : 0.86) * (APP_W / APP_H));
			const k = pw / APP_W;
			ctx.save();
			ctx.shadowColor = color(`${imageDoc().window.shadow}/0.19`);
			ctx.shadowBlur = 40 * u;
			ctx.shadowOffsetY = 14 * u;
			ctx.fillStyle = color(imageDoc().panel.colors.bg!);
			ctx.fillRect((W - pw) / 2, (H - APP_H * k) / 2, pw, APP_H * k);
			ctx.restore();
			ctx.save();
			ctx.translate((W - pw) / 2, (H - APP_H * k) / 2);
			ctx.scale(k, k);
			drawPanel(ctx, r.sample);
			ctx.restore();
			break;
		}
	}
	return { subject, theme };
}

export type IllustrateRender = { png?: Buffer; svg?: string; jpg?: Buffer; webp?: Buffer; width: number; height: number; subject: string; theme: string };

export function renderSubject(r: IllustrateRequest, opts: { png?: boolean; svg?: boolean; jpg?: boolean; webp?: boolean; scale?: number } = { png: true, svg: true }): IllustrateRender {
	const out: IllustrateRender = { width: r.width, height: r.height, subject: r.subject, theme: '' };
	if (opts.png !== false || opts.jpg || opts.webp) {
		const s = surface(r.width, r.height, { scale: opts.scale ?? 1 });
		const d = drawSubject(s.ctx, r);
		out.subject = d.subject;
		out.theme = d.theme;
		if (opts.png !== false) out.png = toPng(s, { opaque: !r.transparent });
		if (opts.jpg) out.jpg = (s.canvas as Canvas).toBuffer('image/jpeg', 92);
		if (opts.webp) out.webp = (s.canvas as Canvas).toBuffer('image/webp', 92);
	}
	if (opts.svg) {
		const s = surface(r.width, r.height, { svg: true });
		const d = drawSubject(s.ctx, r);
		out.subject = d.subject;
		out.theme = d.theme;
		out.svg = toSvg(s);
	}
	return out;
}
