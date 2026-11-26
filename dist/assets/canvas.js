import { join } from 'node:path';
import { createCanvas, GlobalFonts, SvgExportFlag } from '@napi-rs/canvas';
import { brand, packageRoot, tokens } from '../lib/brand.js';
import { encodePng } from './png.js';
let registered;
/** Registers every brand font file once. Each family is registered as `ds <family>`. */
function register() {
    if (registered)
        return registered;
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
export function familyFor(role) {
    const files = brand().fonts.files;
    const want = role === 'display' ? 'heading' : role === 'text' ? 'brand' : role === 'ui' ? 'text' : 'code';
    const hit = files.find((f) => f.role === want) ?? files.find((f) => f.role === 'text') ?? files[0];
    return hit.family;
}
/** A CSS font string for a role at a weight. The weight snaps to the nearest one the brand ships. */
export function font(role, weight, size) {
    const fam = register().get(familyFor(role));
    const w = fam.weights.reduce((best, x) => (Math.abs(x - weight) < Math.abs(best - weight) ? x : best), fam.weights[0]);
    return `${w} ${size}px "${fam.alias}"`;
}
/** The weight a role actually draws at (for notes: a playground weight the brand does not ship). */
export function snappedWeight(role, weight) {
    const fam = register().get(familyFor(role));
    return fam.weights.reduce((best, x) => (Math.abs(x - weight) < Math.abs(best - weight) ? x : best), fam.weights[0]);
}
export function surface(width, height, opts = {}) {
    register();
    const scale = opts.scale ?? 1;
    const pw = Math.max(1, Math.round(width * scale));
    const ph = Math.max(1, Math.round(height * scale));
    const canvas = opts.svg ? createCanvas(pw, ph, SvgExportFlag.ConvertTextToPaths) : createCanvas(pw, ph);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    return { canvas, ctx, width, height, scale, svg: !!opts.svg };
}
/** A plain raster canvas in device pixels (offscreen items, cut-outs). */
export function scratch(width, height) {
    register();
    const canvas = createCanvas(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
    return { canvas, ctx: canvas.getContext('2d') };
}
export function pixelsOf(s) {
    const { width, height } = s.canvas;
    const img = s.canvas.getContext('2d').getImageData(0, 0, width, height);
    return { data: Buffer.from(img.data.buffer, img.data.byteOffset, img.data.byteLength), width, height };
}
/** RGB pixels (for PDF pages and video frames). */
export function rgbOf(s) {
    const px = pixelsOf(s);
    const rgb = Buffer.alloc(px.width * px.height * 3);
    for (let i = 0, j = 0; i < px.data.length; i += 4, j += 3) {
        rgb[j] = px.data[i];
        rgb[j + 1] = px.data[i + 1];
        rgb[j + 2] = px.data[i + 2];
    }
    return { rgb, width: px.width, height: px.height };
}
export function toPng(s, opts = {}) {
    if (s.svg)
        throw new Error('This surface records SVG; draw again on a raster surface for PNG.');
    if (!opts.opaque) {
        const px = pixelsOf(s);
        return encodePng(px.data, px.width, px.height, 4, opts.dpi);
    }
    const { rgb, width, height } = rgbOf(s);
    return encodePng(rgb, width, height, 3, opts.dpi);
}
export function toSvg(s, physical) {
    if (!s.svg)
        throw new Error('This surface holds pixels; draw again with { svg: true } for SVG.');
    let svg = renumber(compactSvg(s.canvas.getContent().toString('utf8')));
    if (physical)
        svg = svg.replace(/(<svg [^>]*?)width="[\d.]+" height="[\d.]+"/, `$1width="${physical.widthIn}in" height="${physical.heightIn}in" viewBox="0 0 ${s.canvas.width} ${s.canvas.height}"`);
    return svg;
}
/**
 * A color from the token file: a token name without its prefix (`off-black`, `home-red`, `color-fg`), optionally
 * with an alpha after a slash (`off-black/0.12`). Hex is refused: every color in brand/assets comes from tokens.css.
 */
export function color(spec) {
    const [name, alphaRaw] = spec.split('/');
    const key = name.startsWith('--ds-') ? name : name.startsWith('color-') ? `--ds-${name}` : `--ds-color-${name}`;
    const t = tokens()[key];
    if (!t)
        throw new Error(`Unknown color token \`${name}\` (brand/assets).`);
    const hex = t.light.trim();
    if (!/^#[0-9a-f]{6}$/i.test(hex))
        throw new Error(`Token ${key} is not a plain color (${hex}).`);
    if (alphaRaw === undefined)
        return hex.toLowerCase();
    const a = Number(alphaRaw);
    const n = (i) => Number.parseInt(hex.slice(i, i + 2), 16);
    return `rgba(${n(1)},${n(3)},${n(5)},${a})`;
}
/** The 6-digit hex of a token color (no alpha). */
export function hexOf(spec) {
    const c = color(spec.split('/')[0]);
    return c;
}
const channels = (c) => {
    if (c.startsWith('#'))
        return [1, 3, 5].map((i) => Number.parseInt(c.slice(i, i + 2), 16)).concat(1);
    const [r, g, b, a] = c.slice(c.indexOf('(') + 1, -1).split(',').map(Number);
    return [r, g, b, a ?? 1];
};
/** A color with alpha over an opaque one, as #rrggbb. */
export function blend(over, under) {
    const [r, g, b, a] = channels(over);
    const u = channels(under);
    return `#${[r, g, b].map((v, i) => Math.round(v * a + u[i] * (1 - a)).toString(16).padStart(2, '0')).join('')}`;
}
/** The WCAG contrast ratio of two opaque colors. */
export function contrast(a, b) {
    const lum = (c) => {
        const [r, g, bl] = channels(c).slice(0, 3).map((v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const x = lum(a);
    const y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** Skia numbers clip paths and other ids from a counter that runs across documents; number them from 1 in each, so the
 * same drawing always writes the same file. */
function renumber(svg) {
    const map = new Map();
    return svg.replace(/\b([a-z]{2,4})_(\d+)\b/g, (m, p) => {
        if (!map.has(m))
            map.set(m, `${p}_${[...map.keys()].filter((k) => k.startsWith(`${p}_`)).length + 1}`);
        return map.get(m);
    });
}
/** Skia writes numbers with six decimals; keep them to 0.01 px. */
export function compactSvg(svg) {
    return svg.replace(/ d="([^"]*)"/g, (_m, d) => ` d="${d.replace(/-?\d+\.\d{3,}/g, (n) => r2(Number(n)))}"`);
}
const r2 = (n) => {
    const v = Math.round(n * 100) / 100;
    return Object.is(v, -0) ? '0' : String(v);
};
