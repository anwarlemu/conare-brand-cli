import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { surface, rgbOf, toPng } from './canvas.js';
import { colorsOf, drawDesign, motionLength } from './og.js';
import { duration, progress } from './motion.js';
// Layout videos: every frame drawn by the same code as the still (drawDesign with a time), piped as raw RGB into
// ffmpeg. MP4 is H.264 (yuv420p, faststart), WebM is VP9; both single-threaded and bit-exact, so the same inputs
// write the same bytes on one ffmpeg build.
export const VIDEO_FORMATS = ['mp4', 'webm', 'gif'];
export function hasFfmpeg() {
    const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return r.status === 0;
}
/** One frame at `t` seconds as PNG (the still option). */
export async function still(d, pic, t) {
    const s = surface(d.w, d.h);
    await drawDesign(s.ctx, d, pic, t === undefined ? undefined : { t, u: 1 });
    return toPng(s, { opaque: true });
}
/**
 * Frames (RGB, or RGBA with `alpha`) streamed into ffmpeg. MP4 is H.264, WebM VP9 (with an alpha channel when the frames
 * have one), GIF a single palette made from the frames. Single-threaded and bit-exact: the same frames, the same bytes.
 */
export async function encodeFrames(w, h, fps, n, format, frame, opts = {}) {
    if (!hasFfmpeg())
        throw new Error('ffmpeg is not on PATH. Install it (brew install ffmpeg, apt install ffmpeg) or pass --still for a PNG.');
    if (opts.alpha && format === 'mp4')
        throw new Error('An MP4 has no transparency. Use webm (or gif) for a lower third.');
    const dir = mkdtempSync(join(tmpdir(), 'ds-video-'));
    const file = join(dir, `out.${format}`);
    const pad = 'pad=ceil(iw/2)*2:ceil(ih/2)*2';
    const codec = format === 'mp4'
        ? ['-vf', pad, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-x264-params', 'threads=1']
        : format === 'webm'
            ? ['-vf', pad, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '30', '-pix_fmt', opts.alpha ? 'yuva420p' : 'yuv420p', '-row-mt', '0', ...(opts.alpha ? ['-auto-alt-ref', '0'] : [])]
            : ['-filter_complex', `${w > 960 ? 'scale=960:-2:flags=lanczos,' : ''}split[a][b];[a]palettegen=stats_mode=full${opts.alpha ? ':reserve_transparent=1' : ''}[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0'];
    const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', opts.alpha ? 'rgba' : 'rgb24', '-s', `${w}x${h}`, '-r', String(fps), '-i', '-', ...codec, '-threads', '1', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:v', '+bitexact', file];
    const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let err = '';
    ff.stderr.on('data', (c) => (err += c));
    const done = new Promise((res) => ff.on('close', (code) => res(code ?? 1)));
    try {
        for (let i = 0; i < n; i++) {
            const buf = await frame(i);
            if (!ff.stdin.write(buf))
                await new Promise((r) => ff.stdin.once('drain', r));
        }
        ff.stdin.end();
        const code = await done;
        if (code !== 0)
            throw new Error(`ffmpeg failed: ${err.trim()}`);
        return readFileSync(file);
    }
    finally {
        rmSync(dir, { recursive: true, force: true });
    }
}
/** Draws every frame and streams it into ffmpeg; returns the file's bytes and its length in seconds. With `loop`, the
 *  design fades to its ground at the end (the exit step) so the first frame follows on. */
export async function renderVideo(d, pic, fps, format, seconds, opts = {}) {
    const out = opts.loop ? duration('exit') + duration('enter') : 0;
    const len = (seconds ?? motionLength(d)) + out;
    const n = Math.max(1, Math.round(len * fps));
    const ground = colorsOf(d).bg;
    const data = await encodeFrames(d.w, d.h, fps, n, format, async (i) => {
        const t = i / fps;
        const s = surface(d.w, d.h);
        await drawDesign(s.ctx, d, pic, { t: Math.min(t, len - out), u: 1 });
        if (out && t > len - out) {
            /* Out on the exit step's curve, then a beat of ground before it starts again. */
            s.ctx.globalAlpha = progress(t, len - out, duration('exit'), 'out');
            s.ctx.fillStyle = ground;
            s.ctx.fillRect(0, 0, d.w, d.h);
            s.ctx.globalAlpha = 1;
        }
        return rgbOf(s).rgb;
    });
    return { data, seconds: Math.round(len * 100) / 100, frames: n };
}
