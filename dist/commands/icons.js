import { createCanvas, loadImage } from '@napi-rs/canvas';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { drawLockup, lockupRatio, logoDoc } from '../assets/art.js';
import { color, surface, toPng } from '../assets/canvas.js';
import { str } from '../assets/flags.js';
import { display, pick, write } from '../assets/io.js';
import { imageDoc, sizeOf } from '../assets/layouts.js';
import { compose, drawRoom, renderDesign } from '../assets/og.js';
// `icons`: the marks a site or an app needs, from the brand's own files: the favicon set brand/logo ships, the sizes it
// does not (192, maskable, app icon) drawn from the same mark, profile pictures, a default share image with the lockup
// alone, and the icons the library draws (lucide, ISC licence) as SVG.
export function iconsHelp() {
    const b = brand().bin;
    return [
        'Favicons, app icons, profile pictures, a default share image and the brand icon set, from the brand\'s own mark.',
        '',
        helpRow(`${b} icons`, 'Everything into icons/', 40),
        helpRow(`${b} icons --theme black --out public`, 'On another theme, into public/', 40),
        '',
        'Writes: favicon.ico (16, 32, 48), favicon-16/32/48/192/512.png, apple-touch-icon.png (180), favicon.svg, maskable-512.png (the mark inside',
        'the safe circle), site.webmanifest, app-icon-1024.png, avatar-400.png and avatar-800.png, og-default.png (1200x630, the lockup alone),',
        'and svg/<name>.svg for each icon the library uses (lucide, ISC licence, in svg/LICENSE).',
        '--theme white, paper, red (default), black or grey for the grounds. The shipped favicons in brand/logo/favicon are copied as they are.',
    ].join('\n');
}
function markSquare(size, theme, share, ground) {
    const t = imageDoc().themes[theme];
    const s = surface(size, size);
    s.ctx.fillStyle = ground?.bg ?? color(t.bg);
    s.ctx.fillRect(0, 0, size, size);
    const L = logoDoc();
    const h = size * share;
    const w = (h * L.mark.w) / L.mark.h;
    drawLockup(s.ctx, (size - w) / 2, (size - h) / 2, h, ground?.ink ?? color(t.ink), 'mark');
    return toPng(s, { opaque: true });
}
function markSvg(fill) {
    const raw = readFileSync(join(packageRoot, 'brand', 'logo', 'svg', 'mark.svg'), 'utf8');
    return raw.replace(/fill="#[0-9a-fA-F]{3,8}"/g, `fill="${fill}"`);
}
/** An ICO holding PNG images (every current browser reads them). */
function ico(pngs) {
    const head = Buffer.alloc(6);
    head.writeUInt16LE(0, 0);
    head.writeUInt16LE(1, 2);
    head.writeUInt16LE(pngs.length, 4);
    let offset = 6 + 16 * pngs.length;
    const dir = pngs.map(({ size, data }) => {
        const e = Buffer.alloc(16);
        e.writeUInt8(size >= 256 ? 0 : size, 0);
        e.writeUInt8(size >= 256 ? 0 : size, 1);
        e.writeUInt16LE(1, 4);
        e.writeUInt16LE(32, 6);
        e.writeUInt32LE(data.length, 8);
        e.writeUInt32LE(offset, 12);
        offset += data.length;
        return e;
    });
    return Buffer.concat([head, ...dir, ...pngs.map((p) => p.data)]);
}
export async function runIcons(cwd, args, flags) {
    if (args.length)
        throw new Error(`Unexpected \`${args.join(' ')}\`. ${brand().bin} icons [--theme red] [--out icons]`);
    const theme = pick('theme', str(flags.theme) ?? 'red', Object.keys(imageDoc().themes));
    /* Without --theme, the new sizes take the shipped favicon's own colors, so the set matches. */
    let ground;
    const big = join(packageRoot, 'brand', 'logo', 'favicon', 'favicon-512.png');
    if (!str(flags.theme) && existsSync(big)) {
        const im = await loadImage(readFileSync(big));
        const c = createCanvas(im.width, im.height);
        const g = c.getContext('2d');
        g.drawImage(im, 0, 0);
        const at = (x, y) => {
            const d = g.getImageData(x, y, 1, 1).data;
            return `#${[d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        };
        const bg = at(4, 4);
        const dist = (a, b) => [1, 3, 5].reduce((n, i) => n + Math.abs(Number.parseInt(a.slice(i, i + 2), 16) - Number.parseInt(b.slice(i, i + 2), 16)), 0);
        /* The mark's color: the sample furthest from the ground along the middle. */
        const ink = Array.from({ length: 9 }, (_, i) => at(Math.round(im.width * (0.1 + i * 0.1)), Math.round(im.height * 0.5))).sort((a, b) => dist(b, bg) - dist(a, bg))[0];
        ground = { bg, ink };
        if (ground.ink === ground.bg)
            ground = undefined;
    }
    const dir = resolve(cwd, str(flags.out) ?? 'icons');
    mkdirSync(dir, { recursive: true });
    const files = [];
    const add = (name, data, w, h, format = name.split('.').pop()) => {
        write(join(dir, name), data);
        files.push({ path: display(cwd, join(dir, name)), format, width: w, height: h });
    };
    const shipped = join(packageRoot, 'brand', 'logo', 'favicon');
    for (const [f, s] of [['favicon-16.png', 16], ['favicon-32.png', 32], ['favicon-48.png', 48], ['favicon-512.png', 512], ['apple-touch-icon.png', 180]]) {
        if (existsSync(join(shipped, f)))
            add(f, readFileSync(join(shipped, f)), s, s);
    }
    add('favicon.ico', existsSync(join(shipped, 'favicon.ico')) ? readFileSync(join(shipped, 'favicon.ico')) : ico([16, 32, 48].map((s) => ({ size: s, data: markSquare(s, theme, 0.8) }))), 48, 48);
    add('favicon-192.png', markSquare(192, theme, 0.62, ground), 192, 192);
    add('maskable-512.png', markSquare(512, theme, 0.42, ground), 512, 512);
    add('favicon.svg', markSvg(color(imageDoc().themes[theme].bg === 'off-white' ? 'off-black' : imageDoc().accent)), 0, 0, 'svg');
    add('app-icon-1024.png', markSquare(1024, theme, 0.5, ground), 1024, 1024);
    for (const s of [400, 800]) {
        const r = await renderDesign(compose({ template: 'avatar', size: { ...sizeOf('avatar'), w: s, h: s, frame: { x: 0, y: 0, w: s, h: s }, safe: { x: 0, y: 0, w: s, h: s } }, theme }), null, { png: true });
        add(`avatar-${s}.png`, r.png, s, s);
    }
    {
        /* The default share image: the lockup alone on the room. */
        const W = 1200;
        const H = 630;
        const t = imageDoc().themes[theme];
        const sf = surface(W, H);
        sf.ctx.fillStyle = color(t.bg);
        sf.ctx.fillRect(0, 0, W, H);
        const lh = 64;
        const lw = lh * lockupRatio('primary');
        const x = (W - lw) / 2;
        const y = (H - lh) / 2;
        drawRoom(sf.ctx, W, H, 1, { x: x - lh, y: y - lh, w: lw + 2 * lh, h: lh * 3 }, 4, color(t.room));
        drawLockup(sf.ctx, x, y, lh, color(t.ink), 'primary');
        add('og-default.png', toPng(sf, { opaque: true }), W, H);
    }
    const name = brand().name;
    add('site.webmanifest', `${JSON.stringify({ name, short_name: name, icons: [{ src: '/favicon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }], theme_color: color(imageDoc().themes[theme].bg), background_color: color(imageDoc().themes[theme].bg), display: 'standalone' }, null, 2)}\n`, 0, 0, 'json');
    const svgs = join(packageRoot, 'build', 'icons');
    if (existsSync(svgs)) {
        mkdirSync(join(dir, 'svg'), { recursive: true });
        for (const f of readdirSync(svgs))
            copyFileSync(join(svgs, f), join(dir, 'svg', f));
        files.push({ path: display(cwd, join(dir, 'svg')), format: 'svg', width: 24, height: 24, count: readdirSync(svgs).filter((f) => f.endsWith('.svg')).length });
    }
    return { json: { files, theme }, text: files.map((f) => `${f.path}${f.width ? `  ${f.width}x${f.height}` : ''}${f.count ? `  ${f.count} icons` : ''}`).join('\n') };
}
