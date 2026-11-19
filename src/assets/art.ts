import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadImage, Path2D, type Image } from '@napi-rs/canvas';
import { packageRoot } from '../lib/brand.js';
import type { Ctx } from './canvas.js';

// The brand's own drawn parts: the logo's mark and wordmark as paths (brand/assets/logo.json says which paths of the
// logo file are which), and the art files brand/assets/image.json names (stacks of documents, the pixel grid).

type Box = { x: number; y: number; w: number; h: number };
export type LogoDoc = { file: string; lockup: { w: number; h: number }; mark: Box & { paths: number[] }; wordmark: Box & { paths: number[] }; colors: string[]; lockups: Record<string, string> };

const json = <T>(...p: string[]): T => JSON.parse(readFileSync(join(packageRoot, 'brand', ...p), 'utf8')) as T;

let logo: LogoDoc | undefined;
export const logoDoc = () => (logo ??= json<LogoDoc>('assets', 'logo.json'));

let paths: string[] | undefined;
/** The d attribute of every path in the logo file, in order. */
export function logoPaths(): string[] {
	paths ??= [...readFileSync(join(packageRoot, 'brand', logoDoc().file), 'utf8').matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]!);
	return paths;
}

let markP: Path2D | undefined;
let wordP: Path2D | undefined;
/** The mark as one path, drawn at its own size from 0, 0. */
export function markPath(): Path2D {
	if (!markP) {
		markP = new Path2D();
		const d = logoDoc().mark;
		for (const i of d.paths) markP.addPath(new Path2D(logoPaths()[i]!), { a: 1, b: 0, c: 0, d: 1, e: -d.x, f: -d.y });
	}
	return markP;
}
/** The wordmark as one path, drawn at its own size from 0, 0. */
export function wordmarkPath(): Path2D {
	if (!wordP) {
		wordP = new Path2D();
		const d = logoDoc().wordmark;
		for (const i of d.paths) wordP.addPath(new Path2D(logoPaths()[i]!), { a: 1, b: 0, c: 0, d: 1, e: -d.x, f: -d.y });
	}
	return wordP;
}

/** The lockup (mark and wordmark), `h` tall with its top left at x, y. Returns its width. */
export function drawLockup(ctx: Ctx, x: number, y: number, h: number, fill: string, parts: 'primary' | 'mark' | 'wordmark' = 'primary'): number {
	const L = logoDoc();
	const k = h / L.lockup.h;
	ctx.save();
	ctx.fillStyle = fill;
	if (parts === 'mark') {
		ctx.translate(x, y);
		ctx.scale(k, k);
		ctx.fill(markPath(), 'evenodd');
		ctx.restore();
		return L.mark.w * k;
	}
	if (parts === 'wordmark') {
		const kw = h / L.wordmark.h;
		ctx.translate(x, y);
		ctx.scale(kw, kw);
		ctx.fill(wordmarkPath());
		ctx.restore();
		return L.wordmark.w * kw;
	}
	ctx.translate(x, y);
	ctx.scale(k, k);
	ctx.save();
	ctx.translate(L.mark.x, L.mark.y);
	ctx.fill(markPath(), 'evenodd');
	ctx.restore();
	ctx.translate(L.wordmark.x, L.wordmark.y);
	ctx.fill(wordmarkPath());
	ctx.restore();
	return L.lockup.w * k;
}

/** Width over height of a lockup. */
export function lockupRatio(parts: 'primary' | 'mark' | 'wordmark' = 'primary'): number {
	const L = logoDoc();
	return parts === 'mark' ? L.mark.w / L.mark.h : parts === 'wordmark' ? L.wordmark.w / L.wordmark.h : L.lockup.w / L.lockup.h;
}

const images = new Map<string, Promise<Image>>();
/** An art file named in brand/assets/image.json (`stack-tall`), decoded once. */
export function artImage(file: string): Promise<Image> {
	let p = images.get(file);
	if (!p) {
		p = loadImage(readFileSync(join(packageRoot, 'brand', file)));
		images.set(file, p);
	}
	return p;
}
