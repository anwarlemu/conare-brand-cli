import { Resvg } from '@resvg/resvg-js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { drawCard } from './draw.js';
import { faces } from './fonts.js';
import { groundById, sizeById, templateById, theme, TEMPLATES, GROUNDS } from './spec.js';
export async function renderImages(req) {
    const title = req.title.trim();
    if (!title)
        throw new Error('A title is required.');
    const out = [];
    let image;
    if (req.image) {
        const img = await loadImage(req.image.data);
        image = { ...req.image, w: img.width, h: img.height };
    }
    for (const asked of req.sizes) {
        const size = typeof asked === 'string' ? sizeById(asked) : asked;
        if (!size)
            continue;
        const copy = { template: req.template, ground: req.ground, title, text: req.text, eyebrow: req.eyebrow, by: req.by, image, layers: req.layers };
        const { svg, layers } = await drawCard(copy, size);
        const scaled = req.scale && req.scale !== 1 ? svg.replace(/(<svg [^>]*?)width="(\d+)" height="(\d+)"/, (_m, a, w, h) => `${a}width="${Number(w) * req.scale}" height="${Number(h) * req.scale}"`) : svg;
        out.push({ template: req.template, size, ground: req.ground, width: size.w, height: size.h, svg, png: req.raster === false ? Buffer.alloc(0) : await raster(scaled, theme(req.ground).bg), layers });
    }
    return out;
}
/** The card's PNG as JPEG or WebP. */
export async function encodeAs(png, format) {
    const img = await loadImage(png);
    const canvas = createCanvas(img.width, img.height);
    canvas.getContext('2d').drawImage(img, 0, 0);
    return format === 'jpg' ? canvas.toBuffer('image/jpeg', 92) : canvas.toBuffer('image/webp', 92);
}
/** Rasterize with the vendored faces only, so a second machine cannot pick up a different system font. */
export async function rasterize(svg, background) {
    const loaded = await faces();
    const resvg = new Resvg(svg, {
        background,
        fitTo: { mode: 'original' },
        textRendering: 2,
        font: {
            loadSystemFonts: false,
            fontFiles: [loaded.heading.ttfPath, loaded.text.ttfPath, loaded.medium.ttfPath],
            defaultFontFamily: loaded.text.family,
            serifFamily: loaded.heading.family,
            sansSerifFamily: loaded.text.family,
        },
    });
    const rendered = resvg.render();
    return { png: Buffer.from(rendered.asPng()), pixels: Buffer.from(rendered.pixels), width: rendered.width, height: rendered.height };
}
export async function raster(svg, background) {
    return (await rasterize(svg, background)).png;
}
export function pngSize(png) {
    if (png.length < 24 || png.toString('ascii', 12, 16) !== 'IHDR')
        throw new Error('Output is not a PNG.');
    return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}
export function mimeOf(data) {
    if (data.length > 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47)
        return 'image/png';
    if (data.length > 3 && data[0] === 0xff && data[1] === 0xd8)
        return 'image/jpeg';
    return undefined;
}
/** A card template and ground by name (defaults: statement on paper). */
export function resolveRequest(input) {
    const template = templateById(input.template || 'statement');
    if (!template)
        throw new Error(`Unknown template \`${input.template}\`. Templates: ${TEMPLATES.map((t) => t.id).join(', ')}.`);
    const ground = groundById(input.ground || 'paper');
    if (!ground)
        throw new Error(`Unknown ground \`${input.ground}\`. The cards come on ${GROUNDS.map((g) => g.id).join(' and ')}.`);
    return { template, ground };
}
