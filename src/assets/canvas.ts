import { join } from 'node:path';
import { createCanvas, GlobalFonts, SvgExportFlag, type Canvas, type SKRSContext2D, type SvgCanvas } from '@napi-rs/canvas';
import { brand, packageRoot, tokens } from '../lib/brand.js';
import { encodePng } from './png.js';

// The drawing surface the asset commands use: a 2D canvas (Skia, no browser) with the brand's faces registered under
// private family names, so a face this machine has installed can never stand in for a missing weight. Written as PNG
// (our own encoder: the same pixels give the same bytes) or as SVG (the same calls through Skia's SVG backend, text
// turned into outlines so the file needs no fonts).

export type Ctx = SKRSContext2D;
export type AnyCanvas = Canvas | SvgCanvas;
export type Surface = { canvas: AnyCanvas; ctx: Ctx; width: number; height: number; scale: number; svg: boolean };

/** The faces by role: display (the heading face), text, ui (the product face) and mono. */
export type FaceRole = 'display' | 'text' | 'ui' | 'mono';

let registered: Map<string, { alias: string; weights: number[] }> | undefined;

/** Registers every brand font file once. Each family is registered as `ds <family>`. */
function register() {
	if (registered) return registered;
	registered = new Map();
	for (const f of brand().fonts.files) {
		const alias = `ds ${f.family}`;
		GlobalFonts.registerFromPath(join(packageRoot, 'brand', 'fonts', f.file), alias);
		const entry = registered.get(f.family) ?? { alias, weights: [] };
		entry.weights.push(f.weight);
		registered.set(f.family, entry);
	}
	return registered;
}

/** The family each role draws in (brand.json font roles: heading, brand, text, code). */
export function familyFor(role: FaceRole): string {
	const files = brand().fonts.files;
	const want = role === 'display' ? 'heading' : role === 'text' ? 'brand' : role === 'ui' ? 'text' : 'code';
	const hit = files.find((f) => f.role === want) ?? files.find((f) => f.role === 'text') ?? files[0]!;
	return hit.family;
}

/** A CSS font string for a role at a weight. The weight snaps to the nearest one the brand ships. */
export function font(role: FaceRole, weight: number, size: number): string {
	const fam = register().get(familyFor(role))!;
	const w = fam.weights.reduce((best, x) => (Math.abs(x - weight) < Math.abs(best - weight) ? x : best), fam.weights[0]!);
	return `${w} ${size}px "${fam.alias}"`;
}

/** The weight a role actually draws at (for notes: a playground weight the brand does not ship). */
export function snappedWeight(role: FaceRole, weight: number): number {
	const fam = register().get(familyFor(role))!;
	return fam.weights.reduce((best, x) => (Math.abs(x - weight) < Math.abs(best - weight) ? x : best), fam.weights[0]!);
}

export function surface(width: number, height: number, opts: { scale?: number; svg?: boolean } = {}): Surface {
	register();
	const scale = opts.scale ?? 1;
	const pw = Math.max(1, Math.round(width * scale));
	const ph = Math.max(1, Math.round(height * scale));
	const canvas: AnyCanvas = opts.svg ? createCanvas(pw, ph, SvgExportFlag.ConvertTextToPaths) : createCanvas(pw, ph);
	const ctx = canvas.getContext('2d');
	ctx.setTransform(scale, 0, 0, scale, 0, 0);
	return { canvas, ctx, width, height, scale, svg: !!opts.svg };
}

/** A plain raster canvas in device pixels (offscreen items, cut-outs). */
export function scratch(width: number, height: number): { canvas: Canvas; ctx: Ctx } {
	register();
	const canvas = createCanvas(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
	return { canvas, ctx: canvas.getContext('2d') };
}

export function pixelsOf(s: Pick<Surface, 'canvas'>): { data: Buffer; width: number; height: number } {
	const { width, height } = s.canvas;
	const img = s.canvas.getContext('2d').getImageData(0, 0, width, height);
	return { data: Buffer.from(img.data.buffer, img.data.byteOffset, img.data.byteLength), width, height };
}

/** RGB pixels (for PDF pages and video frames). */
export function rgbOf(s: Pick<Surface, 'canvas'>): { rgb: Buffer; width: number; height: number } {
	const px = pixelsOf(s);
	const rgb = Buffer.alloc(px.width * px.height * 3);
	for (let i = 0, j = 0; i < px.data.length; i += 4, j += 3) {
		rgb[j] = px.data[i]!;
		rgb[j + 1] = px.data[i + 1]!;
		rgb[j + 2] = px.data[i + 2]!;
	}
	return { rgb, width: px.width, height: px.height };
}

export function toPng(s: Surface, opts: { dpi?: number; opaque?: boolean } = {}): Buffer {
	if (s.svg) throw new Error('This surface records SVG; draw again on a raster surface for PNG.');
	if (!opts.opaque) {
		const px = pixelsOf(s);
		return encodePng(px.data, px.width, px.height, 4, opts.dpi);
	}
	const { rgb, width, height } = rgbOf(s);
	return encodePng(rgb, width, height, 3, opts.dpi);
}

export function toSvg(s: Surface, physical?: { widthIn: number; heightIn: number }): string {
	if (!s.svg) throw new Error('This surface holds pixels; draw again with { svg: true } for SVG.');
	let svg = renumber(compactSvg((s.canvas as SvgCanvas).getContent().toString('utf8')));
	if (physical) svg = svg.replace(/(<svg [^>]*?)width="[\d.]+" height="[\d.]+"/, `$1width="${physical.widthIn}in" height="${physical.heightIn}in" viewBox="0 0 ${s.canvas.width} ${s.canvas.height}"`);
	return svg;
}

/**
 * A color from the token file: a token name without its prefix (`off-black`, `home-red`, `color-fg`), optionally
 * with an alpha after a slash (`off-black/0.12`). Hex is refused: every color in brand/assets comes from tokens.css.
 */
export function color(spec: string): string {
	const [name, alphaRaw] = spec.split('/');
	const key = name!.startsWith('--ds-') ? name! : name!.startsWith('color-') ? `--ds-${name}` : `--ds-color-${name}`;
	const t = tokens()[key];
	if (!t) throw new Error(`Unknown color token \`${name}\` (brand/assets).`);
	const hex = t.light.trim();
	if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Token ${key} is not a plain color (${hex}).`);
	if (alphaRaw === undefined) return hex.toLowerCase();
	const a = Number(alphaRaw);
	const n = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16);
	return `rgba(${n(1)},${n(3)},${n(5)},${a})`;
}

/** The 6-digit hex of a token color (no alpha). */
export function hexOf(spec: string): string {
	const c = color(spec.split('/')[0]!);
	return c;
}

/** Skia numbers clip paths and other ids from a counter that runs across documents; number them from 1 in each, so the
 * same drawing always writes the same file. */
function renumber(svg: string): string {
	const map = new Map<string, string>();
	return svg.replace(/\b([a-z]{2,4})_(\d+)\b/g, (m, p: string) => {
		if (!map.has(m)) map.set(m, `${p}_${[...map.keys()].filter((k) => k.startsWith(`${p}_`)).length + 1}`);
		return map.get(m)!;
	});
}

/** Skia writes numbers with six decimals; keep them to 0.01 px. */
export function compactSvg(svg: string): string {
	return svg.replace(/ d="([^"]*)"/g, (_m, d: string) => ` d="${d.replace(/-?\d+\.\d{3,}/g, (n) => r2(Number(n)))}"`);
}

const r2 = (n: number) => {
	const v = Math.round(n * 100) / 100;
	return Object.is(v, -0) ? '0' : String(v);
};
