import { resolve } from 'node:path';
import { platformOf } from '../design/platforms.js';
import { CopyError } from './glyphs.js';
import { num, pick, unknown } from './io.js';
import { customSize, sizeIds, sizeOf } from './layouts.js';
import { BADGES } from './og.js';
export const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const raw = (v) => (typeof v === 'string' ? v.replace(/\\n/g, '\n') : undefined);
/** One value from a flag and its aliases; two that disagree are an error. */
export function oneOf(flags, names) {
    const given = names.map((n) => [n, raw(flags[n])]).filter((x) => x[1] !== undefined);
    for (const n of names)
        if (flags[n] === true)
            throw new Error(`--${n} needs a value.`);
    if (!given.length)
        return undefined;
    const [first] = given;
    for (const [n, v] of given)
        if (v.trim() !== first[1].trim())
            throw new Error(`--${first[0]} and --${n} disagree. Pass one.`);
    return first[1];
}
/** The copy flags. `--badge` is the badge's words; a style name there (label, pill...) still picks the style. */
export function copyFlags(flags) {
    const badgeRaw = raw(flags.badge);
    if (flags.badge === true)
        throw new Error('--badge needs a value.');
    const style = str(flags['badge-style']) ?? (badgeRaw && BADGES.includes(badgeRaw.trim().toLowerCase()) ? badgeRaw : undefined);
    const words = badgeRaw !== undefined && style !== badgeRaw ? badgeRaw : undefined;
    const eyebrow = oneOf(flags, ['eyebrow']);
    if (words !== undefined && eyebrow !== undefined && words.trim() !== eyebrow.trim())
        throw new Error('--badge and --eyebrow disagree. Pass one.');
    const badgeStyle = style ? pick('badge style', style, BADGES) : undefined;
    return {
        headline: oneOf(flags, ['headline', 'title']), body: oneOf(flags, ['body', 'text', 'subtitle']), badge: words ?? eyebrow, badgeStyle,
        note: oneOf(flags, ['note']), page: oneOf(flags, ['page']), credit: oneOf(flags, ['credit']), partner: oneOf(flags, ['partner']),
    };
}
/** Sizes from a list of ids, aliases, WxH, `custom` (with --width and --height) or `all` (those in `all`). */
export function sizesFrom(tokens, flags, all) {
    const out = [];
    for (const t of tokens.flatMap((x) => x.split(',')).map((x) => x.trim()).filter(Boolean)) {
        if (t.toLowerCase() === 'all')
            out.push(...all.map((id) => sizeOf(id)));
        else if (t.toLowerCase() === 'custom') {
            const w = num('width', flags.width, 1, 100000, { integer: true });
            const h = num('height', flags.height, 1, 100000, { integer: true });
            if (!w || !h)
                throw new Error('--size custom needs --width and --height.');
            out.push(customSize(w, h));
        }
        else {
            const s = sizeOf(t);
            if (!s)
                throw unknown('size', t, [...sizeIds(), 'custom', 'all']);
            out.push(s);
        }
    }
    if (!tokens.length && (flags.width !== undefined || flags.height !== undefined))
        return sizesFrom(['custom'], flags, all);
    const seen = new Set();
    return out.filter((s) => {
        const k = `${s.id}-${s.w}x${s.h}`;
        return seen.has(k) ? false : (seen.add(k), true);
    });
}
/** A size as it names a file. */
export const sizeName = (s) => (s.id === 'custom' ? `${s.w}x${s.h}` : s.id);
export const RASTER = ['png', 'jpg', 'webp'];
const FORMATS = ['png', 'svg', 'jpg', 'webp'];
/** --format: png, svg, jpg, webp, a list of them, both (PNG and SVG, the default) or all. A file name for --out decides. */
export function formatsFrom(flags, cwd, out) {
    const ext = out ? /\.(png|svg|jpe?g|webp)$/i.exec(out)?.[1]?.toLowerCase().replace('jpeg', 'jpg') : undefined;
    const bad = out ? /\.([a-z0-9]{2,4})$/i.exec(out)?.[1]?.toLowerCase() : undefined;
    if (!ext && bad && ['gif', 'pdf', 'mp4', 'webm', 'avif', 'tiff', 'bmp', 'ico'].includes(bad))
        throw new Error(`--out ${out}: this command writes png, svg, jpg or webp, not ${bad}.`);
    if (flags.format === true)
        throw new Error('--format needs a value.');
    if (ext) {
        const asked = str(flags.format);
        if (asked && asked !== 'both' && asked.toLowerCase().replace('jpeg', 'jpg') !== ext)
            throw new Error(`--out ends in .${ext} and --format says ${asked}. Pass one.`);
        return { formats: [ext], named: resolve(cwd, out) };
    }
    const list = (str(flags.format) ?? 'both').toLowerCase().split(',').map((f) => f.trim().replace('jpeg', 'jpg'));
    const formats = list.flatMap((f) => (f === 'both' ? ['png', 'svg'] : f === 'all' ? FORMATS : [pick('format', f, [...FORMATS, 'both', 'all'])]));
    return { formats: [...new Set(formats)] };
}
/** The stem of a named file. */
export const stemOf = (named) => named.replace(/\.(png|svg|jpe?g|webp)$/i, '');
/** A note when a raster file is over what the platform takes. */
export function overLimit(s, bytes, path) {
    const limit = s.limit ?? platformOf(s.id, s.w, s.h).limit;
    if (!limit || bytes <= limit.bytes)
        return undefined;
    return `${path} is ${(bytes / 1048576).toFixed(1)} MB; ${s.label} takes ${(limit.bytes / 1048576).toFixed(0)} MB${limit.official ? '' : ' (approximate)'}. Write it as jpg or webp (--format jpg).`;
}
export const seedOf = (flags) => num('seed', flags.seed, 0, 1_000_000_000, { integer: true });
export { CopyError };
