import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { loadImage } from '@napi-rs/canvas';
import { scratch } from './canvas.js';
const KINDS = [
    ['png', (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47],
    ['jpeg', (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8],
    ['webp', (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'],
    ['gif', (b) => b.length > 6 && b.toString('ascii', 0, 3) === 'GIF'],
    ['svg', (b) => /<svg[\s>]/i.test(b.toString('utf8', 0, Math.min(b.length, 4096)))],
];
export function pictureKind(data) {
    return KINDS.find(([, test]) => test(data))?.[0];
}
/** Decodes picture bytes. `max` is the long side kept (the editor's 1000 by default). */
export async function pictureFrom(data, max = 1000, name = 'The picture') {
    const kind = pictureKind(data);
    if (!kind)
        throw new Error('Use a PNG, JPEG, WebP, GIF or SVG picture.');
    let img;
    try {
        img = await loadImage(data);
    }
    catch {
        throw new Error(`${name} could not be read as a picture; the file may be damaged.`);
    }
    if (!(img.width > 0) && kind !== 'svg')
        throw new Error(`${name} could not be read as a picture; the file may be damaged.`);
    const iw = img.width || max;
    const ih = img.height || (img.width ? max : iw);
    const k = Math.min(1, max / Math.max(iw, ih));
    const w = Math.max(1, Math.round(iw * k));
    const h = Math.max(1, Math.round(ih * k));
    const { canvas, ctx } = scratch(w, h);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    if (kind !== 'svg' && ctx.getImageData(0, 0, w, h).data.every((v) => v === 0))
        throw new Error(`${name} is empty: every pixel is transparent.`);
    return { canvas, width: w, height: h, natural: kind === 'svg' ? Number.MAX_SAFE_INTEGER : iw, key: createHash('sha1').update(data).update(String(max)).digest('hex') };
}
/** Reads a picture from a path relative to `cwd`. */
export async function readPicture(cwd, path, max = 1000) {
    const abs = isAbsolute(path) ? path : resolve(cwd, path);
    let data;
    try {
        data = readFileSync(abs);
    }
    catch (err) {
        if (err.code === 'EISDIR')
            throw new Error(`${path} is a folder, not a picture.`);
        throw new Error(`No picture at ${path}.`);
    }
    if (!pictureKind(data))
        throw new Error(`${path} is not a PNG, JPEG, WebP, GIF or SVG picture.`);
    return pictureFrom(data, max, path);
}
/** A picture drawn by code (a built-in sample) at its own size. */
export function pictureOf(width, height, draw, key) {
    const { canvas, ctx } = scratch(width, height);
    draw(ctx);
    return { canvas, width, height, natural: width, key: `drawn:${key}` };
}
