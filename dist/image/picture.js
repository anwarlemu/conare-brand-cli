import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { readPicture } from '../assets/picture.js';
import { mimeOf } from './render.js';
/** A picture for a card's frame: a PNG or JPEG as it is, anything else (or anything huge) drawn to PNG. Damaged files are refused. */
export async function cardPicture(cwd, path) {
    const info = await readPicture(cwd, path, 2000);
    const data = readFileSync(isAbsolute(path) ? path : resolve(cwd, path));
    const mime = mimeOf(data);
    const keep = mime && info.natural <= 2000 && info.height < 2000;
    return { info, image: keep ? { mime: mime, data } : { mime: 'image/png', data: info.canvas.toBuffer('image/png') } };
}
